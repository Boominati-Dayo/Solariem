/**
 * Contrast audit for <ScrollProgress>.
 *
 * A scroll-scrubbed section is the one place on this site where text sits on a
 * background that CHANGES WHILE YOU READ IT. Every other section has a fixed
 * background, so a token pair can be checked once and trusted. Here the same
 * text is composited over a different colour on every frame, which means:
 *
 *   - a ratio measured at progress 0 says nothing about progress 0.8, and
 *   - the binding constraint is the WORST frame, not the end state, because a
 *     layer that peaks mid-run can be darker than the layers on top of it.
 *
 * So this composites the full layer stack at every 0.005 of --progress and
 * reports the minimum. It is a build-time script, not a test, so it can be run
 * by hand after changing any of the values in the `steps` array.
 *
 * IT READS ITS NUMBERS FROM THE SOURCE RATHER THAN HARD-CODING THEM. The token
 * values come out of globals.css, the layer list is parsed out of the
 * `steps={[...]}` array in the page, and the transition shape and offsets come
 * out of the .sp-layer rule. If someone changes the ramp and forgets to re-run
 * this, nothing complains — but if they change the ramp and re-run this, the
 * numbers are real, including the ones they just changed. A hard-coded copy of
 * the values would go stale silently and then be trusted, which is worse than
 * not having the check.
 *
 * Usage: node scripts/audit-scroll-progress.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

/* ------------------------------------------------------------------ */
/* colour maths                                                        */
/* ------------------------------------------------------------------ */

function hslToRgb([h, s, l]) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

const hex = (rgb) => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();

/** Source-over composite. `fg` is [r,g,b,alpha]. */
const over = (fg, bg) => fg.map((c, i) => Math.round(c * fg[3] + bg[i] * (1 - fg[3])));

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* ------------------------------------------------------------------ */
/* read the real tokens out of globals.css                             */
/* ------------------------------------------------------------------ */

/** Pull `--name: H S% L%` from inside a named block of globals.css. */
function token(css, block, name) {
  // The block is either `:root {` or `.dark {`. Find it, then find the token
  // before the block's closing brace so a token of the same name later in the
  // file cannot be picked up by accident.
  const start = css.indexOf(block);
  if (start < 0) throw new Error(`no ${block} block in globals.css`);
  const end = css.indexOf('\n  }', start);
  const body = css.slice(start, end < 0 ? css.length : end);
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`no --${name} inside ${block}`);
  return hslToRgb(m.slice(1, 4).map(Number));
}

const css = read('src/app/globals.css');

/* ------------------------------------------------------------------ */
/* read the real layer stack out of the page                           */
/* ------------------------------------------------------------------ */

const page = read('src/app/asset-recovery/page.tsx');

const stepArray = page.match(/steps=\{\[([\s\S]*?)\]\}/);
if (!stepArray) throw new Error('could not find the steps={[…]} array on the asset-recovery page');

const VAR = { background: 'background', accent: 'accent', gold: 'gold' };

const layers = [];
for (const m of stepArray[1].matchAll(
  /\{\s*at:\s*([\d.]+),\s*label:\s*'([^']*)',\s*background:\s*'hsl\(var\(--([\w-]+)\)\s*\/\s*([\d.]+)\)'[^}]*?(?:strength:\s*([\d.]+))?\s*\}/g
)) {
  const [, at, label, tokenName, alpha, strength] = m;
  layers.push({
    at: Number(at),
    label,
    token: tokenName,
    alpha: Number(alpha),
    strength: strength === undefined ? 1 : Number(strength),
  });
}

if (!layers.length) throw new Error('parsed zero layers from the steps array');

// The transition shape is in the .sp-layer rule, not the array: opacity ramps
// as (progress - at) * K. Reading K out of the CSS means a change to the
// crossfade width in one place cannot drift out of step with this audit.
const shapeRule = css.match(/\.sp-layer\s*\{[^}]*?\*\s*([\d.]+)/);
if (!shapeRule) throw new Error('could not find the ramp multiplier in the .sp-layer rule');
const SHAPE = Number(shapeRule[1]);

/* ------------------------------------------------------------------ */
/* audit                                                              */
/* ------------------------------------------------------------------ */

function run(theme) {
  const block = theme === 'light' ? ':root {' : '.dark {';
  const bg = token(css, block, 'background');
  const heading = token(css, block, 'foreground');
  const body = token(css, block, 'sp-body');

  // Layers paint in document order with the first entry given the highest
  // z-index by the component, so the FIRST entry in the array is the topmost
  // coloured layer and the LAST is the closest to the panel. Compositing has to
  // go the other way round: bottom-most first.
  const ordered = [...layers].reverse().map((l) => ({
    ...l,
    rgb: token(css, block, VAR[l.token] ?? l.token),
  }));

  let worst = Infinity;
  let worstAt = 0;
  let worstBg = null;
  let worstPair = '';

  for (let p = 0; p <= 1.0001; p += 0.005) {
    let comp = bg;
    for (const l of ordered) {
      // exactly the expression in the .sp-layer rule, then clamped
      const a = Math.min(1, Math.max(0, (p - l.at) * SHAPE * l.strength)) * l.alpha;
      if (a <= 0) continue;
      comp = over([l.rgb[0], l.rgb[1], l.rgb[2], a], comp);
    }
    for (const [name, rgb] of [['heading', heading], ['body', body]]) {
      const r = contrast(rgb, comp);
      if (r < worst) {
        worst = r;
        worstAt = p;
        worstBg = comp;
        worstPair = name;
      }
    }
  }

  return {
    theme, bg: hex(bg), heading: hex(heading), body: hex(body),
    worst, worstAt, worstBg: hex(worstBg), worstPair,
  };
}

/**
 * Scan the section's own markup for text colours it should not be using.
 *
 * The numeric audit above only knows about the two tokens this script resolves.
 * If someone types `text-muted-foreground` into the panel, the numbers here stay
 * green while the page actually fails — 3.62:1 was exactly that, found by
 * looking rather than by computing. So this reads the JSX between the
 * <ScrollProgress> tags and fails on any text colour other than the two that
 * were measured. It cannot see a colour set inline or via an arbitrary value,
 * which is a real limit, but it catches the ordinary mistake.
 */
function scanMarkup() {
  const start = page.indexOf('<ScrollProgress');
  if (start < 0) return { ok: true, note: 'no <ScrollProgress> on the page' };
  const end = page.indexOf('</ScrollProgress>', start);
  if (end < 0) return { ok: false, offenders: ['unterminated <ScrollProgress> block'] };
  const block = page.slice(start, end);

  // every text colour class used inside the panel
  const used = [...block.matchAll(/text-(muted-foreground|foreground|subtle-foreground|sp-body)\b/g)].map(
    (m) => m[1]
  );
  const offenders = [...new Set(used)].filter((c) => c !== 'foreground' && c !== 'sp-body');

  return {
    ok: offenders.length === 0,
    used: [...new Set(used)],
    offenders,
  };
}

console.log('ScrollProgress contrast audit');
console.log('='.repeat(76));
console.log(`  layers: ${layers.length}   ramp: (progress - at) * ${SHAPE}   step: 0.005`);
console.log(`  from:   src/app/asset-recovery/page.tsx  steps={[…]}`);
console.log(`  shape:  src/app/globals.css  .sp-layer`);
console.log('');

let failed = false;
for (const theme of ['light', 'dark']) {
  const r = run(theme);
  const pass = r.worst >= 4.5;
  if (!pass) failed = true;
  console.log(`  ${theme.toUpperCase()}`);
  console.log(`    panel     ${r.bg}`);
  console.log(`    heading   ${r.heading}`);
  console.log(`    body      ${r.body}`);
  console.log(`    worst     ${r.worst.toFixed(2)}:1  at progress ${r.worstAt.toFixed(3)}`);
  console.log(`              ${r.worstPair} on ${r.worstBg}`);
  console.log(`    ${pass ? 'PASS' : 'FAIL'}  AA normal text needs 4.5:1`);
  console.log('');
}

console.log('  ramp as it will render:');
for (const l of layers) {
  console.log(`    at ${String(l.at).padEnd(5)}  --${(VAR[l.token] ?? l.token).padEnd(11)} / ${l.alpha}${l.strength !== 1 ? `  strength ${l.strength}` : ''}  ${l.label}`);
}

const scan = scanMarkup();
console.log('  markup check: text colours inside the <ScrollProgress> panel');
console.log(`    found: ${scan.ok ? scan.used.join(', ') : scan.note || scan.used.join(', ')}`);
if (scan.ok) console.log('    PASS  only text-foreground and text-sp-body');
else console.log(`    FAIL  not measured by the numeric audit: ${scan.offenders.join(', ')}`);
if (failed || !scan.ok) failed = true;

if (failed) {
  console.log('');
  console.log('  FAIL — see above. For a numeric failure, lighten the layer alphas or');
  console.log('  darken --sp-body until the worst case clears; for a markup failure, use');
  console.log('  text-sp-body in the panel instead of text-muted-foreground.');
  process.exit(1);
}
console.log('');
console.log('  PASS — every text pair clears AA at every point in the scroll, in both themes,');
console.log('  and the panel contains no unmeasured text colour.');
