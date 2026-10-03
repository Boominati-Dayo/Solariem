import type { ReactNode, RefObject } from 'react';

/**
 * The six auth pages — sign in, open an account, request a reset link, use a
 * reset link, verify an email, and the inbox page that explains a verification
 * email that has not arrived — used to be independent implementations of the
 * same page. Five of them were still on the old grey/rounded/shadow system
 * while sign-in had been rebuilt, so the reset link a customer arrives on looked
 * nothing like the page they left.
 *
 * They are now built from these pieces, so "match the sign-in form" is a
 * property of the code rather than a thing that has to be re-typed per page.
 * Sign-in itself is the odd one out: it keeps its own markup, for the reason
 * set out in its own file, but it borrows `NotePanel` for its aside.
 *
 * Every class string below is a literal: Tailwind scans source text and cannot
 * evaluate an interpolated class name, so anything assembled at runtime is
 * silently never generated.
 */

/**
 * Page shell: the same two-column grid sign-in uses. Form left, aside right,
 * and the aside collapses below the form on narrow screens rather than being
 * hidden — on a phone the reassurance is as useful as the fields.
 *
 * Layout only. The heading belongs to `children`, because several of these pages
 * change what they are called once they know the outcome (a reset link turns
 * from "choose a password" into "check your email"), and a shell that owned the
 * title would either emit two `h1`s or need the state threaded up into it.
 *
 * The root is a `div`, not a `main`: `ConditionalLayout` already wraps these
 * pages in a `main` landmark, and a second one would nest two. `id="main"` is
 * what the header's skip link targets, and a skip target does not have to be
 * the landmark itself.
 *
 * THE ASIDE IS CENTRED, NOT TOP-ALIGNED. `self-center` puts it on the form's
 * middle axis. Top-aligned, a three-point note beside a four-step form hung off
 * the heading with a large empty gap under it, which read as an unfinished
 * layout rather than as space. Below `lg` the two are stacked in one column, each
 * in a row of its own height, so `align-self` has nothing to align and the note
 * simply follows the form.
 *
 * BOTH COLUMNS ARE CENTRED BELOW `lg`. Stacked in one column, the form was the
 * full width of the container while its fields stopped at the 680px reading
 * measure, so on a tablet the whole form sat against the left margin with a
 * hundred-odd pixels of nothing down its right side. `mx-auto w-full
 * max-w-measure` centres the block and stops the line length growing past the
 * measure at the same time.
 *
 * At `lg` the measure is not reached and never binds: the container caps at
 * 1200px, so a column is (1200 − 32) / 2 = 584px, under 680. The item is
 * therefore as wide as its cell, and `mx-auto` has no free space to take. That is
 * why there is no `lg:` override — the two-column layout is untouched, and this
 * was checked in the browser at 1095px rather than reasoned about.
 *
 * The aside gets the same cap so the two blocks share a left edge when they are
 * stacked; at `lg` the `lg:pl-8` gutter does the separating instead.
 */
export function AuthShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div id="main">
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <div className="mx-auto w-full max-w-measure lg:col-span-6">{children}</div>
            {aside ? (
              <aside className="mx-auto w-full max-w-measure self-center lg:col-span-6 lg:pl-8">
                {aside}
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * The heading block every one of these pages opens with.
 */
export function AuthHeading({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <>
      <h1 className="font-display text-display-1">{title}</h1>
      {intro ? <p className="mt-5 max-w-measure text-body text-muted-foreground">{intro}</p> : null}
    </>
  );
}

/**
 * Error summary.
 *
 * `role="alert"` so it is announced when it appears, and `tabIndex={-1}` so the
 * form can move focus onto it — a validation failure the screen reader never
 * reads and the keyboard never reaches is a failure the reader cannot act on.
 *
 * A left rule rather than a tinted box, matching sign-in.
 */
export function FormError({
  children,
  errorRef,
  heading,
}: {
  children: ReactNode;
  errorRef?: RefObject<HTMLDivElement | null>;
  heading?: string;
}) {
  return (
    <div
      ref={errorRef}
      role="alert"
      tabIndex={-1}
      className="mt-6 max-w-measure border-l-2 border-destructive pl-4 outline-none"
    >
      {heading ? <p className="text-body-sm font-medium text-destructive">{heading}</p> : null}
      <div className="text-body-sm text-destructive">
        {typeof children === 'string' || typeof children === 'number' ? <p>{children}</p> : children}
      </div>
    </div>
  );
}

/**
 * A list of short points, the shape every piece of reassurance on these pages
 * takes: a left rule and muted body text, no bullets and no numbers.
 *
 * Shared because this markup was being re-typed per page and had already
 * drifted — one auth page used `list-disc`, two others drew the box by hand.
 * Bullets are the one thing in this list that reads as a different design from
 * the rest of the site, which marks lists with a rule instead.
 *
 * `ordered` where the sequence is the point ("we ask for a PIN, then you confirm
 * your address, then you sign in"). Order is information, so it is left in the
 * markup rather than implied by wording.
 *
 * `className` is the caller's spacing, not a decoration hook: the vertical gap
 * above a list inside the note panel is not the gap above one under a heading,
 * and passing both as classes would just be two conflicting margins whose
 * winner depends on the stylesheet.
 *
 * `tone="destructive"` for a validation summary. Muted is right for reassurance
 * and wrong for an error: an error in grey reads as a note. The whole string is
 * one of two literals rather than a fragment appended to a colour, because
 * Tailwind finds classes in source text and never evaluates what it finds there.
 */
export function AuthList({
  points,
  ordered = false,
  className = 'mt-6',
  tone = 'muted',
}: {
  points: ReactNode[];
  ordered?: boolean;
  className?: string;
  tone?: 'muted' | 'destructive';
}) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`space-y-3 text-body-sm ${
        tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
      } ${className}`}
    >
      {points.map((p, i) => (
        <li key={i} className="border-l border-border pl-4">
          {p}
        </li>
      ))}
    </Tag>
  );
}

/**
 * A labelled input.
 *
 * `hint` sits under the control rather than in the label: a hint is guidance
 * about how to fill the field, and putting it in the label makes assistive tech
 * read it as part of the field's name.
 *
 * `invalid` prints "Check this field" under the control, which is the right
 * treatment for a form with one field on it. A form that validates several
 * fields at once should NOT pass it: it already lists what is wrong, by name,
 * above the fields, and a generic line under each control only repeats that
 * back. Those forms set `aria-invalid` on the input itself, which is what turns
 * the border red.
 *
 * `optional` puts "(optional)" in the label in muted text. In the label rather
 * than the hint because it is part of what the field is, and because a reader
 * scanning labels should not have to read the line under each one to find out
 * which fields they can leave alone.
 */
export function FormField({
  id,
  label,
  hint,
  invalid,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  invalid?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 max-w-measure">
      <label htmlFor={id} className="label">
        {label}
        {optional ? <span className="text-muted-foreground"> (optional)</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-2 text-caption text-muted-foreground">{hint}</p> : null}
      {invalid ? (
        <p className="mt-2 text-caption text-destructive">
          Check this field.
        </p>
      ) : null}
    </div>
  );
}

/**
 * A password input with a Show/Hide toggle.
 *
 * The toggle is a text button sitting inside the field's right edge rather than
 * an eye icon, because an icon alone gives a screen reader nothing to announce
 * and a sighted user nothing to read — and the visible word stays legible when
 * the icon does not render.
 *
 * `invalid` marks the control and nothing else: no "Check this field" line.
 * A password is the one field where a generic message is worth least, because
 * what is actually wrong with it is never generic, and the page that asks for
 * one is a form that lists its problems above the fields.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete = 'current-password',
  placeholder,
  invalid,
  hint,
  inputMode,
  maxLength,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
  placeholder?: string;
  invalid?: boolean;
  hint?: ReactNode;
  inputMode?: 'numeric' | 'text';
  maxLength?: number;
  className?: string;
}) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={invalid ? true : undefined}
          className={`field pr-24 ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 px-3 text-caption text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          {show ? 'Hide' : 'Show'}
          <span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </div>
    </FormField>
  );
}

/**
 * The aside box: a hairline and a muted fill, no shadow. Shared so the
 * reassurance copy can change without any of these pages drifting apart.
 *
 * Three of the six pages drew this box by hand — sign-in, open an account, and
 * verify email — which is three chances to drift from the one they were meant to
 * match. A page whose aside is not this component is a page that will not match
 * sign-in in a month.
 */
export function NotePanel({
  heading,
  children,
  points,
  ordered = false,
  action,
}: {
  heading: string;
  children?: ReactNode;
  points?: ReactNode[];
  ordered?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-muted p-6 lg:p-8">
      <h2 className="text-h3 font-normal text-foreground">{heading}</h2>
      {children ? (
        <p className="mt-4 max-w-measure text-body-sm text-muted-foreground">{children}</p>
      ) : null}
      {points && points.length > 0 ? <AuthList points={points} ordered={ordered} /> : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
