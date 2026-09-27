import Link from 'next/link';

/**
 * Where to report a scam. Genuinely useful, jurisdiction-specific, and free of
 * promotion — which is also the single strongest trust signal available to a
 * firm in this category, because regulator pages are dominated by warnings
 * about recovery scams.
 */
const ROUTES = [
  {
    body: 'Report Fraud',
    detail:
      'United Kingdom. The national reporting centre for fraud and financial crime. Renamed from Action Fraud, which still appears on some older pages — if you land there, you are in the right place.',
    action: 'Report at reportfraud.police.uk, or call 0300 123 2040.',
  },
  {
    body: 'MoneyHelper',
    detail:
      'United Kingdom. Free and impartial, and it will never contact you first or charge for help — a useful filter on any call claiming to be official.',
    action: 'Financial Crimes and Scams Unit, 0800 015 4402.',
  },
  {
    body: 'FBI Internet Crime Complaint Center',
    detail: 'United States. Reports of internet-enabled fraud and asset tracing requests.',
    action: 'Report at ic3.gov.',
  },
  {
    body: 'Federal Trade Commission',
    detail: 'United States. Consumer fraud reports, and warnings about fake recovery services.',
    action: 'Report at reportfraud.ftc.gov.',
  },
  {
    body: 'Your national fraud line',
    detail: 'Everywhere else. Most countries run a national fraud reporting line or a dedicated financial crimes unit.',
    action: 'Ask your bank first, then report to your national police or fraud unit.',
  },
];

export default function ReportScamSection() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <header className="section-head lg:col-span-5">
            <h2 className="text-h2 text-foreground">Report it to someone who can act on it.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              A fraud report is what starts the clock on a bank recall. The longer you wait, the
              likelier the money has moved. Tell your bank the same day, and report it to the
              national fraud body for your country.
            </p>
            <p className="mt-5 text-body text-muted-foreground">
              You can also bring the case to us. We will look at the transaction records and tell you
              whether there is a realistic route to recover it.
            </p>
            <Link href="/contact" className="btn-line mt-8">
              Send us the details
            </Link>
          </header>

          <div className="lg:col-span-7">
            <dl className="divide-y divide-border border-y border-border">
              {ROUTES.map((r) => (
                <div
                  key={r.body}
                  className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6"
                >
                  <dt className="text-h4 text-foreground md:col-span-4">{r.body}</dt>
                  <dd className="text-body text-muted-foreground md:col-span-8">
                    {r.detail} {r.action}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
