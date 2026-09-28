import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JonathanSterlingImg from '@/assets/images_for_pages/leaders/jonathanSterling.jpg';
import ElenaRostovaImg from '@/assets/images_for_pages/leaders/Elena Rostova.png';
import MarcusChenImg from '@/assets/images_for_pages/leaders/Marcus Chen.jpg';
import { ORG } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Who runs Solariem, and what we refuse to do',
  description: 'The three people who run Solariem, what happens to your balance while we hold it, and the claims we will not make. We pay ourselves only after money comes back.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Who runs Solariem, and what we refuse to do',
    description:
      'The three people who run Solariem, and the claims we will not make. We pay ourselves only after money comes back.',
    url: '/about',
  },
};

/**
 * Team biographies are intentionally free of figures. Recovery-firm
 * marketing that cites revenue, client counts or success percentages is
 * exactly what the FTC and SEC warn the public about, and none of these
 * numbers can be audited from outside. Add credentials only where the
 * individual has confirmed them in writing and can evidence them.
 */
const TEAM = [
  {
    name: 'Jonathan Sterling',
    role: 'Chief Executive',
    image: JonathanSterlingImg,
    bio: 'Runs the firm and signs off on whether a case is worth taking. Every case is reviewed against the evidence before it is accepted, and Jonathan is the person who says no when there is no route to the money.',
  },
  {
    name: 'Elena Rostova',
    role: 'Head of Forensic Accounting',
    image: ElenaRostovaImg,
    bio: 'Leads the tracing work. She reads statements and transaction histories to work out which accounts received the funds, which institutions hold them, and whether the chain of custody survives past the first hop.',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Legal',
    image: MarcusChenImg,
    bio: 'Instructs counsel in each jurisdiction we file in and decides which route a case takes: a recall to the sending bank, a freeze application, an ombudsman complaint, or proceedings. Where an institution will not act alone, that decision is his.',
  },
];

const PRINCIPLES = [
  {
    title: 'The evidence decides, not the fee',
    body: 'A file is accepted or declined on the documents. We trace the money before we commit to anything, because the identity of the receiving account determines the outcome more than anything else we do. If there is no route to the funds, we say so, and no success fee is due.',
  },
  {
    title: 'You are told the realistic figure',
    body: 'Once we have read your statements, you get a written assessment of what is likely to come back. It is usually a range, sometimes it is nothing, and we would rather you know that early than be surprised later.',
  },
  {
    title: 'Paid out of the recovery, not before it',
    body: 'A percentage of whatever actually reaches you is due only then, at a rate agreed in writing beforehand. Nobody credible needs your money to find out where your money went.',
  },
  {
    title: 'No regulator in our pocket',
    body: 'We have no special access to any regulator, police force, or government body, and we will never imply that we do. What we rely on is the transaction record and, where it comes to it, a court. Anyone claiming insider access is describing something that does not exist.',
  },
];

export default function AboutPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">
                We keep money where it should be.
              </h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                Solariem is a financial services company. We hold client money in a multi-currency
                account, and we trace transfers that left an account because of a scam. Two things,
                and we do them properly rather than ten things badly.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                We hold your balance, and there is no deposit guarantee behind it. We do not
                guarantee that money comes back either, and any firm that tells you it can is
                misleading you. What we do is tell you early and in writing what the realistic
                outcome is.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn-ink">
                  Talk to us
                </Link>
                <Link href="/asset-recovery" className="btn-line">
                  How recovery works
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-14">
              <div className="border border-border">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">The short version</h2>
                </div>
                <dl className="divide-y divide-border">
                  <div className="grid grid-cols-3 gap-4 px-6 py-5">
                    <dt className="col-span-1 text-caption text-muted-foreground">A bank?</dt>
                    <dd className="col-span-2 text-body text-foreground">No.</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4 px-6 py-5">
                    <dt className="col-span-1 text-caption text-muted-foreground">Recovery fee</dt>
                    <dd className="col-span-2 text-body text-foreground">
                      None unless money comes back.
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4 px-6 py-5">
                    <dt className="col-span-1 text-caption text-muted-foreground">Fee if it works</dt>
                    <dd className="col-span-2 text-body text-foreground">
                      A percentage of what reaches you.
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4 px-6 py-5">
                    <dt className="col-span-1 text-caption text-muted-foreground">Regulator ties</dt>
                    <dd className="col-span-2 text-body text-foreground">None, and none claimed.</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why the firm exists */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Why this firm exists.</h2>
            </header>
            <div className="space-y-6 lg:col-span-7">
              <p className="max-w-measure text-lead text-muted-foreground">
                When a scam takes money, the victim usually discovers it days or weeks later. By then
                the funds have been passed on, often several times, and the bank&rsquo;s own recall
                window has closed. The person who knows what happened is a fraud investigator or a
                lawyer, and both charge by the hour whether or not anything comes back.
              </p>
              <p className="max-w-measure text-body text-muted-foreground">
                Solariem was built around a different arrangement. We carry the cost of the tracing
                work and take our payment out of whatever is actually returned. That means it is in
                our interest to establish the truth quickly, including when the truth is that there is
                nothing to recover, and to tell you rather than send an invoice.
              </p>
              <p className="max-w-measure text-body text-muted-foreground">
                The name comes from <em className="font-display not-italic">sol</em>, the Latin for
                light. A transaction record is the light that makes a disputed payment visible, and
                most of this work is the dull business of reading it properly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Four rules we work to.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              These are the things we will not trade away when a case is difficult or a client is
              unhappy.
            </p>
          </header>
          {/* Four commitments, each independent. Cards rather than a two-column
              ruled list, because the whole point of this section is that each
              of the four stands alone — a reader scanning for the one that
              matters to them should be able to see it whole. */}
          <ul className="card-grid-2 mt-16">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title}>
                <span className="card-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-h4 text-foreground">{p.title}</h3>
                <p className="mt-3 text-body text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Leadership */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Who runs it.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              Three people, named, with photographs and direct responsibility for their part of the
              work. If you do not know who is handling your file, that is a bad sign, and this is
              ours to fix.
            </p>
          </header>

          <ul className="mt-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            {TEAM.map((m) => (
              <li key={m.name} className="bg-background">
                <figure className="aspect-[4/5] overflow-hidden bg-foreground">
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover"
                  />
                </figure>
                <div className="border-t border-border p-6 lg:p-8">
                  <h3 className="text-h3 font-normal text-foreground">{m.name}</h3>
                  <p className="mt-1 text-caption text-muted-foreground">{m.role}</p>
                  <p className="mt-5 text-body-sm text-muted-foreground">{m.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Offices */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Where we are.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                Most of our work is done by correspondence, because that is how claims are actually
                run. These are the addresses we can receive documents at, and the jurisdictions our
                counsel can file in.
              </p>
            </header>
            <ul className="lg:col-span-7">
              {ORG.addresses.map((a) => (
                <li key={a.city} className="border-b border-border py-6 first:border-t">
                  <p className="font-mono text-data text-foreground">{a.line}</p>
                  <p className="mt-1 text-caption text-muted-foreground">{a.country}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border bg-foreground px-6 py-14 text-background sm:px-12">
            <h2 className="font-display text-display-1">Ask us anything.</h2>
            <p className="mt-6 max-w-measure text-lead text-background/70">
              If a claim on this site cannot be substantiated, ask us for the evidence behind it. If
              we cannot produce it, we will withdraw the claim. You can also ask your own lawyer to
              read the terms before you sign anything, and we will not ask you not to.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-background bg-background px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-background/85"
              >
                Contact us
              </Link>
              <Link
                href="/terms"
                className="inline-flex h-12 items-center border border-background px-6 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-background hover:text-foreground"
              >
                Read the terms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
