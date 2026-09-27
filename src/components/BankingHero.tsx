import Image from 'next/image';
import Link from 'next/link';
import FinanceHeroImg from '@/assets/images_for_pages/finance-hero.jpg';

/**
 * Hero. Asymmetric 7/5 grid, left-aligned, one real object in a hairline frame.
 * No gradient, no glass, no floating card, no eyebrow, no icon row.
 */
export default function BankingHero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="font-display text-display-1 text-foreground sm:text-display-2">
              Money you can move, and money we can trace.
            </h1>

            <p className="mt-7 max-w-measure text-lead text-muted-foreground">
              Solariem is two things. A multi-currency account for holding and moving your money. And
              a team that traces transfers taken by fraud, then acts on them through the banks and
              the courts involved.
            </p>

            <p className="mt-5 max-w-measure text-body text-muted-foreground">
              Opening an account is free, and we charge no recovery fee unless funds actually come
              back to you. If they do, we take 15&ndash;25% of what actually arrived. If nothing comes
              back, no success fee is due.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-ink">
                Open an account
              </Link>
              <Link href="/asset-recovery" className="btn-line">
                Start a recovery case
              </Link>
            </div>

            <p className="mt-8 max-w-measure text-caption text-muted-foreground">
              Solariem is a financial services company, not a bank. We do not take deposits, and we
              cannot promise that any particular case will succeed.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-20">
            <figure className="border border-border bg-card p-2">
              <Image
                src={FinanceHeroImg}
                alt="A client reviewing a bank statement alongside a case timeline"
                width={1200}
                height={800}
                priority
                className="h-auto w-full"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
