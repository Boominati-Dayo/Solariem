import Link from 'next/link';
import Wordmark from './Wordmark';
import { ORG, FOOTER_LINKS, FEES } from '@/lib/site';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-section border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-container px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" aria-label="Solariem home">
              <Wordmark onDark />
            </Link>
            <p className="mt-6 max-w-measure text-body-sm text-background/70">
              A multi-currency account, and a team that traces money taken by fraud.
            </p>
            <p className="mt-6 max-w-measure text-caption text-background/50">
              {ORG.legalName} holds money for customers. Balances are not covered by any deposit
              guarantee scheme.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <h2 className="text-micro font-medium uppercase tracking-[0.08em] text-background/50">
                    {group}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-body-sm text-background/70 underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:text-background hover:decoration-background"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-background/15 pt-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="text-body-sm font-medium text-background">Offices</h2>
              <ul className="mt-4 space-y-3">
                {ORG.addresses.map((a) => (
                  <li key={a.city} className="text-caption text-background/60">
                    <span className="text-background/90">{a.city}</span> — {a.line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6">
              <h2 className="text-body-sm font-medium text-background">Talk to us</h2>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`mailto:${ORG.email}`}
                    className="text-caption text-background/60 underline decoration-transparent underline-offset-4 transition-colors hover:text-background hover:decoration-background"
                  >
                    {ORG.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${ORG.phone.replace(/\s/g, '')}`}
                    className="text-caption text-background/60 underline decoration-transparent underline-offset-4 transition-colors hover:text-background hover:decoration-background"
                  >
                    {ORG.phone}
                  </a>
                </li>
              </ul>
              <p className="mt-6 max-w-measure text-caption text-background/50">
                Recovery cases are charged at {FEES.successRate} of amounts actually returned. No
                success fee is due unless money is returned.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-background/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-background/50">
            &copy; {currentYear} {ORG.legalName}. All rights reserved.
          </p>
          <p className="max-w-read text-caption text-background/40">
            Information on this site is general, not advice about your own situation. Outcomes of
            recovery cases cannot be promised.
          </p>
        </div>
      </div>
    </footer>
  );
}
