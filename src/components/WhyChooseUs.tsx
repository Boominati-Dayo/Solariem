/**
 * Hairline-divided definition rows. No icons, no tiles, no hover lift.
 * Every claim here is either verifiable by the client or explicitly hedged —
 * unverifiable superlatives are a regulatory risk in this category.
 */
const REASONS = [
  {
    title: 'The fee only exists if we succeed',
    body: 'There is no charge for opening an account or starting a case. A percentage is due only once money has actually reached you. If a case recovers nothing, the invoice is zero.',
  },
  {
    title: 'We tell you the realistic outcome first',
    body: 'After we have read your statements we will say what we think can be recovered, and what we think cannot. That assessment is written down before you commit to anything, so there is nothing to be sold later.',
  },
  {
    title: 'We file through named institutions',
    body: 'Claims go to the sending bank, the receiving bank, the relevant ombudsman, and where needed the courts. We are not affiliated with any regulator or police force and we will never claim to have contacts inside one.',
  },
  {
    title: 'We will not ask you to keep it quiet',
    body: 'We treat your case as confidential and we never sell your details. But we will not stop you from speaking to your own lawyer, your bank, or your family. A firm that wants secrecy is a warning sign.',
  },
  {
    title: 'No claim of protection we cannot back',
    body: 'We hold your balance, and no deposit guarantee scheme stands behind it. We would rather you knew that up front than discovered it later.',
  },
  {
    title: 'Plain English, in writing',
    body: 'Every case has a reference you can use to check its stage at any time. You will always be able to see what we are waiting on and what we need from you.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section section-rule wash-brand">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">Why people send a case here.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            The recovery industry is full of firms that ask for money up front and promise
            everything. These are the things we do differently.
          </p>
        </header>

        <dl className="mt-16 divide-y divide-border border-y border-border">
          {REASONS.map((r) => (
            <div key={r.title} className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6">
              <dt className="text-h4 text-foreground md:col-span-4">{r.title}</dt>
              <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                {r.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
