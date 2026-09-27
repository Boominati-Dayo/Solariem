import { ORG } from '@/lib/site';

const CONTROLS = [
  {
    title: 'Where client money is held',
    body: 'With Solariem, which means we hold the balance, including money we recover for you before it reaches you. There is no deposit guarantee or deposit insurance behind it. We say so plainly because it is a real limitation rather than something to design around.',
  },
  {
    title: 'Identity checks before anything else',
    body: 'Identity verification runs before an account is opened and before any case is accepted. It is a legal requirement for this kind of business, not a marketing feature.',
  },
  {
    title: 'Encryption in transit and at rest',
    body: 'Traffic is encrypted with TLS, and stored records are encrypted at rest. We will not claim a certification grade of encryption, because that is a claim a client should be able to verify in an audit report and we have not asked for one.',
  },
  {
    title: 'Access is limited and logged',
    body: 'Staff see a client record only when the case requires it, and every access is written to an audit log. Access is reviewed on a schedule and revoked when it is no longer needed.',
  },
  {
    title: 'We hold no regulator affiliations',
    body: 'Solariem is not affiliated with any regulator, police force, or government body, and is not authorised or regulated as a bank. We will never tell you we have special access to any of them, because no legitimate firm does.',
  },
  {
    title: 'Complaints go to an ombudsman, not to us alone',
    body: 'Clients in the covered jurisdictions can take a complaint to the relevant financial ombudsman. We would rather you knew that route existed at the start than at the point of disagreement.',
  },
];

/**
 * Security and regulatory position. Deliberately free of unverifiable claims
 * such as "military-grade encryption", "internationally regulated" or a
 * fabricated deposit guarantee — each of those is a compliance exposure in
 * this category.
 */
export default function SecurityCompliance() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <header className="section-head lg:col-span-5">
            <h2 className="text-h2 text-foreground">Where your money sits, and who can see it.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              Security claims are easy to make and hard to check. These are the ones we can actually
              stand behind, including the parts that are not flattering.
            </p>
            <p className="mt-5 text-body text-muted-foreground">
              Registered offices: {ORG.addresses.map((a) => a.city).join(', ')}.
            </p>
          </header>

          <div className="lg:col-span-7">
            <dl className="divide-y divide-border border-y border-border">
              {CONTROLS.map((c) => (
                <div key={c.title} className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6">
                  <dt className="text-h4 text-foreground md:col-span-4">{c.title}</dt>
                  <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                    {c.body}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-measure text-caption text-muted-foreground">
              Full detail is in the{' '}
              <a
                href="/terms"
                className="text-accent underline decoration-1 underline-offset-4 hover:decoration-accent"
              >
                terms and conditions
              </a>{' '}
              and the{' '}
              <a
                href="/privacy"
                className="text-accent underline decoration-1 underline-offset-4 hover:decoration-accent"
              >
                privacy notice
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
