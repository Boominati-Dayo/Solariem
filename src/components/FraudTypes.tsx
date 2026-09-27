const TYPES = [
  {
    name: 'Business email compromise',
    body: 'An email appears to come from a supplier or a director asking for a payment to new bank details. The real thread has been hijacked, or the sender is impersonating them well. Common in accounting fraud, and frequently inside otherwise careful companies.',
  },
  {
    name: 'Authorised push payment fraud',
    body: 'You were convinced to make the payment yourself, by someone who had researched you. Investment offers, property deals, and invoice scams all fall here. Because the payment was authorised, a bank will often refuse to refund it, which is why legal action rather than a complaint is usually needed.',
  },
  {
    name: 'Investment and trading schemes',
    body: 'A platform shows real profits on paper and small withdrawals succeed, which builds trust. Larger withdrawals are then blocked on tax, insurance, or clearance fees. The profits were never real, so there is usually nothing to trace.',
  },
  {
    name: 'Romance and relationship fraud',
    body: 'A relationship develops over months, sometimes years. A request for money arrives around an illness, a stranded shipment, or an investment opportunity. Almost always a photo of someone who does not exist.',
  },
  {
    name: 'Impersonation of officials or institutions',
    body: 'A caller claiming to be from a bank, a courier firm, or a government office explains that money must be moved to a "safe account" to protect it. No bank, courier, or regulator will ever ask for this. It is the single most common phone fraud.',
  },
  {
    name: 'Marketplace and ticket fraud',
    body: 'Goods or tickets are sold online and never arrive, or counterfeit tickets are supplied. Payment is often by bank transfer, which removes the chargeback route that a card payment would have given you.',
  },
  {
    name: 'Invoice and payroll redirection',
    body: 'Legitimate invoices are redirected to a fraudulent account, or a payroll is changed without the change being verified by voice. Both are treated as a standalone fraud and usually pay out where the bank failed its own checks.',
  },
];

/**
 * Fraud typologies. Replaces the previous "recent cases" section, which
 * presented unverified recovery figures as fact. This is honest, and it earns
 * the same search traffic.
 */
export default function FraudTypes() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">The fraud patterns we work on most.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            Seven schemes account for most of the cases we see. Recognising yours tells us quickly
            whether there is anything worth tracing.
          </p>
        </header>

        <dl className="mt-16 divide-y divide-border border-y border-border">
          {TYPES.map((t) => (
            <div key={t.name} className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6">
              <dt className="text-h4 text-foreground md:col-span-4">{t.name}</dt>
              <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                {t.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
