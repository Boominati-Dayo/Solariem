import type { ReactNode, RefObject } from 'react';

/**
 * The five auth forms — sign in, open an account, request a reset link, use a
 * reset link, verify an email — used to be five independent implementations of
 * the same page. Four of them were still on the old grey/rounded/shadow system
 * while sign-in had been rebuilt, so the reset link a customer arrives on looked
 * nothing like the page they left.
 *
 * They are now built from these four pieces, so "match the sign-in form" is a
 * property of the code rather than a thing that has to be re-typed per page.
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
 */
export function AuthShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div id="main">
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-6">{children}</div>
            {aside ? <aside className="lg:col-span-6 lg:pl-8">{aside}</aside> : null}
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
 * A labelled input.
 *
 * `hint` sits under the control rather than in the label: a hint is guidance
 * about how to fill the field, and putting it in the label makes assistive tech
 * read it as part of the field's name.
 */
export function FormField({
  id,
  label,
  hint,
  invalid,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 max-w-measure">
      <label htmlFor={id} className="label">
        {label}
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
    <FormField id={id} label={label} hint={hint} invalid={invalid}>
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
 */
export function NotePanel({
  heading,
  children,
  points,
  action,
}: {
  heading: string;
  children?: ReactNode;
  points?: ReactNode[];
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-muted p-6 lg:p-8">
      <h2 className="text-h3 font-normal text-foreground">{heading}</h2>
      {children ? (
        <p className="mt-4 max-w-measure text-body-sm text-muted-foreground">{children}</p>
      ) : null}
      {points && points.length > 0 ? (
        <ul className="mt-6 space-y-3 text-body-sm text-muted-foreground">
          {points.map((p, i) => (
            <li key={i} className="border-l border-border pl-4">
              {p}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
