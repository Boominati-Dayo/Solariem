/**
 * Regenerate the icon set from the Solariem monogram.
 *
 *   node scripts/generate-icons.mjs
 *
 * The mark is defined once, here, and matches src/components/Wordmark.tsx: a
 * ring (custody, and a zero-sum reversed) crossed by a vertical stroke (the
 * ledger rule). Geometry is expressed in a 100-unit box so it scales cleanly.
 *
 * Why this exists: the previous set was RealFaviconGenerator output from the
 * pre-rebrand logo, with a base64 PNG embedded in the SVG, duplicated across
 * four directories under two different naming schemes — and Next.js only
 * recognises a fixed set of filenames, so several of those copies were dead
 * weight while the manifest pointed at icon paths that 404'd.
 *
 * Two variants are produced:
 *   "any"     — full-bleed mark, for browser tabs and desktop.
 *   "maskable"— same mark scaled to 44%, so it survives a circular mask. The
 *               safe zone of a maskable icon is a circle of 80% of the icon
 *               area, and an unscaled ring-plus-rule extends past it and gets
 *               its tips clipped on Android.
 */
import { writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/favicon');

const INK = '#14130F';
const BONE = '#FAF9F6';

/**
 * Ring radius in the 100-unit box, matching Wordmark.tsx.
 *
 * The stroke weight deliberately does not. The header mark sits at ~28px where
 * 7 units reads as a confident hairline; the same weight at a 16px favicon is
 * 1.1px and antialiases down to a faint grey, so the favicon uses 9. Verified
 * by sampling rendered pixels at 16/32/512 rather than by eye.
 */
const R = 36.25;
const STROKE = 9;
const RULE_TOP = 7.5;
const RULE_BOTTOM = 92.5;

/**
 * @param {number} scale 1 for the plain icon; ~0.44 for the maskable variant.
 * @param {string} bg    tile colour. Kept solid rather than transparent so the
 *                       bone mark has something to read against on a light tab.
 */
const svg = (scale, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${bg}"/>
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <circle cx="50" cy="50" r="${R}" fill="none" stroke="${BONE}" stroke-width="${STROKE}"/>
    <path d="M50 ${RULE_TOP}V${RULE_BOTTOM}" stroke="${BONE}" stroke-width="${STROKE}"/>
  </g>
</svg>
`;

/**
 * Minimal ICO writer. An ICO file is a 6-byte header, a 16-byte directory
 * entry per image, then the image payloads. Every browser in current use reads
 * PNG-encoded ICO entries, so the payloads here are PNGs rather than BMPs —
 * which is also the only way to get this done without adding a dependency.
 * A width or height of 0 in a directory entry means 256.
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + pngs.length * 16;

  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const raster = (source, size) => sharp(source).resize(size, size).png().toBuffer();

/**
 * Open Graph / Twitter card image, 1200x630.
 *
 * The site had a single pre-rebrand thumbnail.png (103 KB) serving as the share
 * image, so every link shared on LinkedIn, WhatsApp or Slack carried the old
 * logo. This replaces it with the current mark.
 *
 * Set in a generic sans rather than Instrument Serif on purpose: librsvg cannot
 * see the fonts loaded by next/font, and silently falling back to a different
 * serif would be worse than a clean sans. Geist is the site's UI face anyway, so
 * this is close to what the header renders.
 */
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}"/>
  <g transform="translate(80 315)">
    <circle cx="0" cy="0" r="52" fill="none" stroke="${BONE}" stroke-width="9"/>
    <path d="M0 -52V52" stroke="${BONE}" stroke-width="9"/>
  </g>
  <text x="200" y="288" font-family="Helvetica, Arial, sans-serif" font-size="76"
        letter-spacing="16" fill="${BONE}">SOLARIEM</text>
  <line x1="200" y1="330" x2="1120" y2="330" stroke="${BONE}" stroke-opacity="0.25" stroke-width="2"/>
  <text x="200" y="392" font-family="Helvetica, Arial, sans-serif" font-size="34"
        letter-spacing="1" fill="${BONE}" fill-opacity="0.72">Every asset, accounted for.</text>
</svg>
`;
}

async function main() {
  const anySvg = Buffer.from(svg(1, INK));
  const maskableSvg = Buffer.from(svg(0.44, INK));

  // Written as-is: the master vector.
  await writeFile(resolve(OUT, 'favicon.svg'), anySvg);

  // Browser / OS icons.
  await writeFile(resolve(OUT, 'apple-touch-icon.png'), await raster(anySvg, 180));
  await writeFile(resolve(OUT, 'favicon-96x96.png'), await raster(anySvg, 96));

  // PWA icons, maskable, at the two sizes the web app manifest requires.
  await writeFile(resolve(OUT, 'web-app-manifest-192x192.png'), await raster(maskableSvg, 192));
  await writeFile(resolve(OUT, 'web-app-manifest-512x512.png'), await raster(maskableSvg, 512));

  // Legacy .ico at the three sizes browsers actually ask for.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map(async (size) => ({ size, data: await raster(anySvg, size) })),
  );
  await writeFile(resolve(OUT, 'favicon.ico'), buildIco(pngs));

  await writeFile(
    resolve(ROOT, 'public/og.png'),
    await sharp(Buffer.from(ogSvg())).png().toBuffer(),
  );

  // The previous RealFaviconGenerator set left three orphans in the same
  // folder. Two of them are referenced by nothing, and the third is a duplicate
  // of apple-touch-icon.png under a name Next.js does not recognise — but which
  // still emits a competing <link rel="apple-touch-icon"> because it sits in
  // src/app. Removed here so the folder only holds files this script writes.
  for (const orphan of ['apple-icon.png', 'icon0.svg', 'icon1.png', 'manifest.json']) {
    await rm(resolve(OUT, orphan), { force: true });
  }

  console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png,');
  console.log('      favicon-96x96.png, web-app-manifest-{192,512}.png, public/og.png');
  console.log('Removed 4 orphaned pre-rebrand files.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
