import Link from 'next/link';

type Route = {
  payment: string;
  window: string;
  position: string;
  whatWeDo: string;
};

/**
 * What is actually recoverable, by payment type. This is the most useful thing
 * a fraud victim can learn, and it is the section that keeps us honest: a
 * chargeback only ever exists on the card leg of a payment, never on the
 * blockchain leg, so anyone offering a "crypto chargeback" is describing
 * something that cannot be done.
 */
const ROUTES: Route[] = [
  {
    payment: 'Card payment',
    window: 'Usually 120 days from the statement',
    position: 'Strongest position',
    whatWeDo:
      'We file a chargeback with the acquiring bank and, where the merchant took goods or services they never delivered, a Section 75 claim. This is the one route that does not depend on the money still being in the same account.',
  },
  {
    payment: 'UK Faster Payment or SEPA transfer',
    window: 'Hours, occasionally up to a few days',
    position: 'Good if the receiving account is still open',
    whatWeDo:
      'A Faster Payment can sometimes be stopped, but only while the funds have not left the receiving account. We send a recall request to the sending bank immediately and pursue a freeze where one is available.',
  },
  {
    payment: 'SWIFT or international wire',
    window: 'Often one to two days',
    position: 'Depends entirely on the receiving bank',
    whatWeDo:
      'We identify the beneficiary bank and file a formal request to freeze or return the funds. Where that fails we issue proceedings through counsel in the receiving jurisdiction.',
  },
  {
    payment: 'Cryptocurrency transfer',
    window: 'Minutes. There is no recall.',
    position: 'Weakest position',
    whatWeDo:
      'We identify the receiving wallet address, determine which exchange or custodian controls it, and file a legal claim against that exchange. A chargeback does not exist here. Recovery usually depends on the exchange holding the funds and on a court order reaching it.',
  },
  {
    payment: 'Cheque or bank transfer taken in person',
    window: 'Days to weeks',
    position: 'Poor, but not always hopeless',
    whatWeDo:
      'Cheque fraud is handled by the bank under its own indemnity rules, and outcomes are often poor. We review the case anyway because the circumstances sometimes support a separate claim against the person who obtained the funds.',
  },
];

export default function AssetRecoverySection() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">What can be recovered, and how.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            The payment method decides almost everything. The table below is the honest version of
            what is possible, ordered from strongest position to weakest.
          </p>
          <p className="mt-5 text-body text-muted-foreground">
            Speed matters more than anything else. A recall only works while the money is still in
            the receiving account, so the first call to make is always to your own bank.
          </p>
        </header>

        <div className="mt-16 border border-border">
          <div className="hidden grid-cols-12 gap-6 border-b border-border bg-muted px-6 py-3 md:grid">
            <p className="col-span-3 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
              How you paid
            </p>
            <p className="col-span-2 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Time you have
            </p>
            <p className="col-span-2 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Position
            </p>
            <p className="col-span-5 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
              What we do
            </p>
          </div>

          <div className="divide-y divide-border">
            {ROUTES.map((r) => (
              <div
                key={r.payment}
                className="grid grid-cols-1 gap-x-6 gap-y-3 px-6 py-6 md:grid-cols-12"
              >
                <p className="text-h4 text-foreground md:col-span-3">{r.payment}</p>
                <p className="text-body-sm text-muted-foreground md:col-span-2">{r.window}</p>
                <p className="text-body-sm text-foreground md:col-span-2">{r.position}</p>
                <p className="max-w-measure text-body-sm text-muted-foreground md:col-span-5">
                  {r.whatWeDo}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/asset-recovery" className="btn-ink">
            Start a recovery case
          </Link>
          <Link href="/track-claim" className="btn-line">
            Check an existing case
          </Link>
        </div>
      </div>
    </section>
  );
}
