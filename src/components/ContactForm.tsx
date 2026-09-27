'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { showError, showSuccess } from '@/utils/toast';

const SCAM_TYPES = [
  'Bank transfer fraud',
  'Card fraud',
  'Investment or trading platform',
  'Cryptocurrency fraud',
  'Romance or investment scam',
  'Invoice or business payment fraud',
  'Something else',
];

const EMPTY = {
  name: '',
  email: '',
  scamType: SCAM_TYPES[0],
  amount: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof EMPTY) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError(null);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data?.error || 'We could not send that. Please try again.';
        setError(message);
        showError(message);
        return;
      }

      setSent(true);
      setForm(EMPTY);
      showSuccess('Sent. We will reply by email.');
    } catch {
      const message = 'We could not reach the server. Check your connection and try again.';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-border bg-card p-8 lg:p-10">
        <h2 className="text-h3 text-foreground">Your message is on its way.</h2>
        <p className="mt-4 max-w-measure text-body text-muted-foreground">
          We have sent it to the right desk and will reply to the email address you gave us. If the
          money was taken recently, it is worth contacting your own bank as well, because they may be
          able to act inside a recall window that is shorter than ours.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 inline-flex h-12 items-center border border-foreground px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-border bg-card p-6 sm:p-8 lg:p-10">
      <h2 className="text-h3 text-foreground">Tell us what happened.</h2>
      <p className="mt-3 max-w-measure text-body-sm text-muted-foreground">
        The more specific you are about dates and amounts, the more quickly we can tell you whether
        there is a route to recover the money.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="field mt-2"
            placeholder="First and last name"
            value={form.name}
            onChange={(e) => update('name')(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field mt-2"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update('email')(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-type" className="label">
            What kind of fraud
          </label>
          <select
            id="contact-type"
            name="scamType"
            className="field mt-2"
            value={form.scamType}
            onChange={(e) => update('scamType')(e.target.value)}
          >
            {SCAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-amount" className="label">
            Roughly how much
          </label>
          <input
            id="contact-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            className="field mt-2"
            placeholder="For example, 12,000 USD"
            value={form.amount}
            onChange={(e) => update('amount')(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="label">
          What happened
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={7}
          className="field mt-2 h-auto py-3 resize-y"
          placeholder="Dates, amounts, how you paid, and who you paid."
          value={form.message}
          onChange={(e) => update('message')(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 border-l-2 border-destructive pl-4 text-body-sm text-destructive">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-ink mt-7 w-full disabled:opacity-50">
        {loading ? 'Sending…' : 'Send message'}
      </button>

      <p className="mt-5 text-caption text-muted-foreground">
        We use what you send here to assess whether the case is worth pursuing, and nothing else. We
        do not sell it, and we do not add you to a marketing list because you contacted us. See the{' '}
        <a href="/privacy" className="text-foreground underline underline-offset-4 hover:text-accent">
          privacy notice
        </a>
        .
      </p>
    </form>
  );
}
