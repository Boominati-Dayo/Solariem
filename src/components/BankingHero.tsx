import Link from 'next/link';
import PhotoBackdrop from '@/components/PhotoBackdrop';
import SolariemExteriorImg from '@/assets/images_for_pages/solariem-exterior.png';

/**
 * Hero. Full-bleed photograph carrying the whole section, copy in the left
 * seven columns. No gradient, no glass, no floating card, no eyebrow, no icon
 * row, and no photo in a hairline frame beside the words — which is what this
 * was, and which is why it read as a slide rather than a page.
 *
 * The photograph is the bank itself, shot from outside: neutral grey overall,
 * bright sky across the top half and the facade in shadow below it. That is
 * what `scrim="left"` wants — a light solid end for the words and a darker
 * right end for the picture, so nothing in the type has to fight the image.
 *
 * The image runs at full strength and the SCRIM alone does the protecting. An
 * earlier version faded both at once, which multiplied two low-contrast values
 * and made the photograph effectively invisible. Nothing here is legible off
 * the photograph alone, which is the point: the copy has to be read, and the
 * image is there so the section does not look like a wall of text.
 *
 * `position` is close to a no-op at desktop and the reason is worth keeping in
 * mind before anyone "fixes" it. The section is taller in aspect than the
 * photo (1086x849 against 1536x1024), so `object-cover` fits the height and
 * crops the width — only the left ~15% is off-screen at `right`, and the
 * scrim only uncovers the right quarter anyway. On a phone the section is far
 * taller than the photo's aspect and the same crop rule crops hard sideways,
 * which is where `right` finally earns its keep: it keeps the visible slice on
 * the bright sky half rather than the shadowed half.
 */
export default function BankingHero() {
  return (
    <PhotoBackdrop
      image={SolariemExteriorImg}
      scrim="left"
      photo="full"
      position="center right"
      priority
      className="border-b border-border"
    >
      <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
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
            We hold money for you, and money we recover on a case is credited to the account it
            belongs to. Balances held with us are not covered by any deposit guarantee scheme, and
            we cannot promise that a particular case will succeed.
          </p>
        </div>
      </div>
    </PhotoBackdrop>
  );
}
