# Solariem

Internal document of record. This is not marketing copy and it is not published.
Its job is to state what the company is, what it is not, and what we are not
allowed to say, so that a new writer or a new developer cannot reintroduce a
claim the product cannot support.

Brand, fee and FAQ copy lives in **`src/lib/site.ts`**. If the two disagree,
`site.ts` is what ships, and this document explains why.

---

## What we are

A company that does two things:

1. **Multi-currency accounts.** Hold money in the currencies a client actually
   uses, move it between them, and show every movement on one statement. The
   application supports 49 distinct currency codes and maps 63 countries to a
   default currency (`src/lib/currencies.ts`).
2. **Asset recovery.** Trace a payment the client says was taken by fraud, and
   act on it through the institutions involved — the sending bank, the receiving
   bank or exchange, and where appropriate the courts, through independent
   counsel in the relevant jurisdiction.

That is the whole business. There is no third thing.

---

## What we are not

This section is the important one. Every item below was previously asserted in
this file or in site copy, and was untrue.

- **We are not a bank.** We are not authorised to take deposits.
- **We do not hold client deposits** in any safeguarded or protected sense.
  There is no FSCS, FDIC, or equivalent behind a balance held with us.
- **We are not a regulated financial firm.** We are not authorised to give
  investment advice. We hold no regulatory licence that authorises us to.
- **We are not a law firm** and are not authorised to practise law. Where a
  matter must be issued, we instruct independent solicitors or barristers.
- **We have no regulator relationship.** Not affiliated with, and do not act
  for, any regulator, police force, court, bank, or government body.
- **We cannot protect money.** A balance held with us is not the same as a
  balance held in a bank current account, and we do not pretend otherwise.
- **We do not grow money.** There is no yield, no rate, no plan, no maturity,
  and no return on a balance. The investment-plan machinery was removed from
  this codebase; anything that reintroduces a promise of growth on a balance is
  a regression.

---

## What we charge

Stated in full, because the fee position is the single most scrutinised thing
about a firm in this category.

| Charge | When | Amount |
| --- | --- | --- |
| Opening an account | — | Free |
| Recovery success fee | Only if money is actually returned to you | 15–25% of the amount that actually reached you, at the rate agreed in writing before the case begins |
| Account-level charges | If an account is restricted pending verification and clearing it carries a fee | Shown in the app, with the amount, before you authorise it |

**Open item — the account-restriction charge.** The application can restrict an
account and can charge to lift that restriction (`src/lib/admin/unblockUtils.ts`,
enforced by `src/components/dashboard/AccountBlockedOverlay.tsx`). The public
position has been written to be accurate rather than flattering: no success fee
without money returned, and anything else disclosed with its amount before it is
owed. This is deliberately narrower than the previous "you will never be asked
to pay a fee before work starts", because that statement was false and a false
statement in a contract is worse than an unattractive one. The mechanism itself
is still to be settled; until it is, do not tighten the wording.

---

## What we will never say

Regulators in this sector use these as red flags, and the CFTC, SEC, FINRA, FTC
and FBI publish them explicitly. We hold ourselves to the same list, which is
the only reason our own copy is credible.

**Forbidden outright:**

- Any success rate, or any "typical" amount recovered.
- That a fee buys a result, or that we can get money back.
- "Guaranteed", "insured", "risk-free", "protected", "secure" used as a
  protection claim.
- "Chargeback crypto" as an offer. There is no chargeback on the blockchain side
  of a payment. The FBI IC3 is explicit that these transactions are irrevocable,
  and two published FOS decisions (`DRN-3920585`, `DRN-4718186`) failed for the
  same underlying reason: the exchange supplied the service.
- Any implication of a regulator, law-enforcement, or bank endorsement.
- "Escrow", unless a real escrow account exists. It does not.
- A security certification grade we have not been audited for.

**Forbidden as empty filler:** leverage, facilitate, utilise, robust, seamless,
cutting-edge, institutional-grade, world-class, one-stop, turnkey, bespoke,
"tailored solutions", "financial solutions", "trust and security".

**Also load-bearing:** the UK national reporting body is **Report Fraud**
(`reportfraud.police.uk`, 0300 123 2040), not "Action Fraud". Using the old name
sends people to a body that no longer exists under that name.

---

## Before you publish anything

1. Does the product actually do this, today? If not, it does not ship.
2. Would this pass the fraud-warning list above — applied to us, not to a
   competitor? This is rule 8 of the editorial plan in
   `research/journal-content-source-report.md` and it is not optional.
3. Is every number date-stamped? £85,000, £120,000 and the FOS limits were all
   different six months ago.
4. Is it consistent with `src/lib/site.ts`? That file ships; a page that
   contradicts it is the defect.
5. Simple English. If a clause needs a lawyer to read it, it is written wrongly.

---

## Engineering constraints that exist for a reason

These are not style preferences. Removing them reintroduces a known defect.

| Guard | Why |
| --- | --- |
| `npm run check:api-auth` | There is no `src/middleware.ts`, so auth is opt-in per route. That is the root cause of the original systemic authentication defect, and this script is what catches the next one. |
| `0px` radius in `tailwind.config.js` | Brand. Do not reintroduce rounded corners. |
| `navy-900` and `primary-500` stay dark | Roughly 2,000 dashboard call sites use the legacy colour scales. They were recoloured in place rather than rewritten, and those two are load-bearing for text contrast. |
| `daily_gain` transaction type | Kept deliberately. `fix-balances` recalculates `balances.main` from it, so removing the type would silently reduce real users' balances. It is data, not a feature. |
| `SITE_URL` defaults to `http://localhost:3000` | Never point SEO at a domain we do not own. Every canonical URL, OG tag, sitemap entry and JSON-LD `@id` derives from it. |
| `balances.investment` removed from types | Existing non-zero values need a decision — fold into `balances.main`, or write off. Until then those users see a reduced total. |
