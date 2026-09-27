'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { showError } from '@/utils/toast';

type Update = { status: string; message: string; timestamp: string };

type CaseData = {
  claimNumber: string;
  scamType: string;
  amountLost: number;
  currency: string;
  dateOfIncident: string;
  status: string;
  amountClaimed?: number;
  updates?: Update[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Ordered stages, matching the RecoveryCase status enum. The label is the
 * customer-facing name; the raw status never reaches the page.
 */
const STAGES: { status: string; label: string; body: string }[] = [
  {
    status: 'pending',
    label: 'Received',
    body: 'Your file is logged and waiting for an officer to pick it up. Nothing needs to happen from you at this stage.',
  },
  {
    status: 'investigating',
    label: 'Documents under review',
    body: 'We are reading your statements and identifying which accounts received the money.',
  },
  {
    status: 'forensic_phase',
    label: 'Tracing',
    body: 'We are following the funds through the institutions involved and working out which of them can be compelled to act.',
  },
  {
    status: 'legal_action',
    label: 'Filed with the institutions',
    body: 'A recall request, freeze application, or formal complaint has been filed with the sending bank and the receiving institution.',
  },
  {
    status: 'funds_frozen',
    label: 'Funds restricted',
    body: 'Money has been held rather than released. This is the point at which a case most often succeeds.',
  },
  {
    status: 'approved',
    label: 'Cleared for release',
    body: 'The receiving institution has confirmed the funds can be returned and is processing the transfer.',
  },
  {
    status: 'completed',
    label: 'Returned',
    body: 'Funds have reached you. Your fee is calculated on the amount that actually arrived.',
  },
];

const TERMINAL: Record<string, { label: string; body: string }> = {
  rejected: {
    label: 'Closed',
    body: 'We could not establish a route to the funds, so the case has been closed. No success fee is due. The reason is in the updates below.',
  },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Received',
  investigating: 'Under review',
  forensic_phase: 'Tracing',
  legal_action: 'Filed',
  funds_frozen: 'Restricted',
  approved: 'Cleared for release',
  completed: 'Returned',
  rejected: 'Closed',
};

function stageIndex(status: string) {
  const i = STAGES.findIndex((s) => s.status === status);
  return i;
}

function money(value: number, currency: string) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return '—';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || ''} ${amount.toLocaleString('en-GB')}`.trim();
  }
}

function date(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CaseTracker() {
  const [email, setEmail] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  async function handleTrack(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !claimNumber.trim()) {
      showError('Enter both the email address and the case reference.');
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({ email: email.trim(), claimNumber: claimNumber.trim() });
      const response = await fetch(`/api/public-recovery/track?${qs.toString()}`);
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        showError(payload?.error || 'We could not find that case.');
        return;
      }

      setCaseData(payload.data);
    } catch {
      showError('We could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!caseData) {
    return (
      <form onSubmit={handleTrack} className="border border-border bg-card p-6 sm:p-8 lg:p-10">
        <h2 className="text-h3 text-foreground">Find your case.</h2>
        <p className="mt-3 max-w-measure text-body-sm text-muted-foreground">
          Use the reference from your confirmation email, together with the address you gave us. The
          reference looks like <span className="font-mono">REC-XXXXXX</span>.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="track-email" className="label">
              Email address
            </label>
            <input
              id="track-email"
              type="email"
              required
              autoComplete="email"
              className="field mt-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="track-ref" className="label">
              Case reference
            </label>
            <input
              id="track-ref"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              className="field mt-2 font-mono uppercase"
              placeholder="REC-XXXXXX"
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-ink mt-7 w-full disabled:opacity-50">
          {loading ? 'Checking…' : 'Check the status'}
        </button>

        <p className="mt-5 text-caption text-muted-foreground">
          Lost the reference?{' '}
          <Link href="/contact" className="text-foreground underline underline-offset-4 hover:text-accent">
            Ask us to resend it
          </Link>
          . We can confirm your identity from the account details you gave us originally.
        </p>
      </form>
    );
  }

  const closed = caseData.status === 'rejected';
  const current = stageIndex(caseData.status);
  const updates = [...(caseData.updates || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-12">
      {/* Summary */}
      <section className="border border-border bg-foreground text-background">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-7">
            <p className="font-mono text-data uppercase tracking-[0.08em] text-background/60">
              {caseData.claimNumber}
            </p>
            <h2 className="mt-3 font-display text-display-1">
              {STATUS_LABELS[caseData.status] || 'In progress'}
            </h2>
            <p className="mt-4 max-w-measure text-body text-background/70">
              {closed
                ? TERMINAL.rejected.body
                : STAGES[current]?.body || 'This case is open and moving.'}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:col-span-5 lg:grid-cols-1">
            <div>
              <dt className="text-caption text-background/60">Type of fraud</dt>
              <dd className="mt-1 text-body-sm text-background">{caseData.scamType}</dd>
            </div>
            <div>
              <dt className="text-caption text-background/60">Amount reported</dt>
              <dd className="mt-1 text-body-sm text-background">
                {money(caseData.amountLost, caseData.currency)}
              </dd>
            </div>
            {typeof caseData.amountClaimed === 'number' && caseData.amountClaimed > 0 && (
              <div>
                <dt className="text-caption text-background/60">Amount being claimed</dt>
                <dd className="mt-1 text-body-sm text-background">
                  {money(caseData.amountClaimed, caseData.currency)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-caption text-background/60">Date of the loss</dt>
              <dd className="mt-1 text-body-sm text-background">{date(caseData.dateOfIncident)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Stage list */}
      {!closed && (
        <section>
          <h2 className="text-h3 text-foreground">Where the case has reached.</h2>
          <ol className="mt-8 border-t border-border">
            {STAGES.map((stage, i) => {
              const state =
                caseData.status === 'completed' || i < current
                  ? 'done'
                  : i === current
                    ? 'active'
                    : 'todo';

              return (
                <li key={stage.status} className="border-b border-border py-6">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-12 md:gap-6">
                    <div className="flex items-baseline gap-4 md:col-span-4">
                      <span
                        aria-hidden="true"
                        className={[
                          'font-mono text-data tabular-nums',
                          state === 'todo' ? 'text-muted-foreground/50' : 'text-foreground',
                        ].join(' ')}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3
                        className={[
                          'text-h4',
                          state === 'todo' ? 'text-muted-foreground/60' : 'text-foreground',
                        ].join(' ')}
                      >
                        {stage.label}
                        {state === 'active' && (
                          <span className="ml-3 text-body-sm font-normal text-accent">
                            Current stage
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="max-w-measure text-body-sm text-muted-foreground md:col-span-8">
                      {stage.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Updates */}
      <section>
        <h2 className="text-h3 text-foreground">What has happened so far.</h2>
        {updates.length === 0 ? (
          <p className="mt-6 max-w-measure text-body text-muted-foreground">
            No updates have been posted yet. The first one is normally added once an officer has read
            your documents and formed a view on whether the case can proceed.
          </p>
        ) : (
          <ol className="mt-8 border-t border-border">
            {updates.map((u, i) => (
              <li key={`${u.timestamp}-${i}`} className="border-b border-border py-6">
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-12 md:gap-6">
                  <p className="font-mono text-data uppercase tracking-[0.06em] text-muted-foreground md:col-span-3">
                    {STATUS_LABELS[u.status] || u.status.replace(/_/g, ' ')}
                  </p>
                  <div className="md:col-span-9">
                    <p className="max-w-measure text-body text-foreground">{u.message}</p>
                    <p className="mt-2 font-mono text-data text-muted-foreground">
                      {dateTime(u.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* What to do now */}
      <section className="border border-border bg-muted p-6 sm:p-8">
        <h2 className="text-h3 text-foreground">If you are waiting on us.</h2>
        <p className="mt-4 max-w-measure text-body text-muted-foreground">
          A case usually stalls because a document cannot be obtained from a third party, and that
          shows up in the updates above. If the stage has not moved for six weeks, ask rather than
          wait. Pushing is normal and it is not rude.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="btn-ink">
            Ask for an update
          </Link>
          <button
            type="button"
            onClick={() => {
              setCaseData(null);
              setClaimNumber('');
            }}
            className="btn-quiet"
          >
            Check a different case
          </button>
        </div>
      </section>
    </div>
  );
}
