import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { ORG } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Start with what actually happened',
  description: 'Tell us what happened to your money. We will tell you whether it can be traced, and there is no charge for that answer.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Start with what actually happened | Solariem',
    description:
      'Tell us what happened to your money. We will tell you whether it can be traced, and there is no charge for that answer.',
    url: '/contact',
  },
};

const BEFORE_YOU_WRITE = [
  'The dates you made each payment, and the amount of each one.',
  'How you paid: card, bank transfer, wire, or crypto, and to whom.',
  'The transaction reference from your statement, if you have it.',
  'Any messages, emails, or letters from whoever took the money.',
];

const IF_IT_WAS_RECENT = [
  'Contact your own bank. They may be able to raise a recall or freeze themselves, and their window is usually shorter than the time it takes to trace anything.',
  'If you paid by card, ask your card issuer about a chargeback now rather than later. Time limits apply and they are shorter than most people expect.',
  'If you paid a platform or an individual rather than a bank, tell the platform as well. They have their own compliance obligations once they know.',
  'If you are still in contact with the people who took the money, do not pay anything further to release the original sum. That pattern is the single clearest sign of a recovery scam.',
];

export default function ContactPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">
                Start with what actually happened.
              </h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                Send us the details and you will get a plain answer on whether there is a route to
                recover the money and what it would take. That answer costs nothing, whether or not
                you go on to work with us.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                We cannot guarantee a result, and we will not charge you a recovery fee unless money
                actually comes back. If someone else has already taken money from you promising to
                get the first lot back, tell us that too, because it is worth knowing before we open a
                file.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-14">
              <div className="border border-border">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">Other ways to reach us</h2>
                </div>
                <dl className="divide-y divide-border">
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Email</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${ORG.email}`}
                        className="font-mono text-body-sm text-foreground underline underline-offset-4 hover:text-accent"
                      >
                        {ORG.email}
                      </a>
                    </dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Telephone</dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${ORG.phone.replace(/\s/g, '')}`}
                        className="font-mono text-body-sm text-foreground underline underline-offset-4 hover:text-accent"
                      >
                        {ORG.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Hours</dt>
                    <dd className="mt-1 text-body-sm text-foreground">
                      Monday to Friday, 09:00 to 18:00 UK time.
                    </dd>
                  </div>
                </dl>
                <p className="border-t border-border px-6 py-5 text-caption text-muted-foreground">
                  Email is the fastest route because it leaves a written record. We do not need you
                  to send documents until we have told you what is needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + supporting columns */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            <div className="space-y-12 lg:col-span-5">
              <div>
                <h2 className="text-h4 text-foreground">Helpful to have ready</h2>
                <p className="mt-3 text-body-sm text-muted-foreground">
                  You do not need all of this to send a first message. It just saves a round trip.
                </p>
                <ul className="mt-6 border-t border-border">
                  {BEFORE_YOU_WRITE.map((item) => (
                    <li key={item} className="border-b border-border py-4">
                      <p className="text-body-sm text-muted-foreground">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-h4 text-foreground">If the payment was recent</h2>
                <p className="mt-3 text-body-sm text-muted-foreground">
                  Do these in parallel with contacting us. Acting through your own bank is often
                  faster than waiting for anyone else.
                </p>
                <ul className="mt-6 border-t border-border">
                  {IF_IT_WAS_RECENT.map((item) => (
                    <li key={item} className="border-b border-border py-4">
                      <p className="text-body-sm text-muted-foreground">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-border bg-muted p-6">
                <h2 className="text-h4 text-foreground">Something to be clear about</h2>
                <p className="mt-3 text-body-sm text-muted-foreground">
                  We are not affiliated with any regulator or police force, and we do not have
                  special access to any of them. We will never ask you to keep a case secret from
                  your own lawyer, your bank, or your family. Legitimate firms have nothing to hide
                  from advisers.
                </p>
                <Link href="/asset-recovery" className="btn-quiet mt-6 -ml-6">
                  What we will never do
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
