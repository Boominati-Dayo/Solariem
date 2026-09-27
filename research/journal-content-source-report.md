# Journal Content — Verified Source Report

**Purpose:** raw research for a subagent writing a small, non-promotional informational "Journal" for a multi-currency account + fraud asset-recovery business.
**Compiled:** 26 September 2026.
**Rule for the writing subagent:** every factual claim in the published articles must trace to a URL in §7. Anything not in this report is not cleared for publication. Do not add success rates, typical recovery amounts, or "we get your money back" language. No personalised financial or legal advice. Informational only.

---

## §0 Corrections to the brief, and source tiers

### 0.1 Three premise errors in the original brief

| Brief said | Reality | Anchor |
|---|---|---|
| "FOS threshold is £170,000" | **Obsolete.** £170,000 was the 2022/23 award limit for acts/omissions *before* 1 April 2019. From **1 April 2026** the limits are **£455,000** (acts/omissions on/after 1 Apr 2019) and **£205,000** (before that date). | FOS limits pages — see §1.4 |
| "GDPR Art 19 PSD2" | **Wrong article.** PSD2 (Directive (EU) 2015/2366) has no Art 19 relevant here. The operative articles are **Art 73** (payer's PSP refunds by end of the next business day after an unauthorised transaction is notified), **Art 74** (payer liability limits: €50, €150 gross negligence, €500 where no authentication), and **Art 91** (payee's PSP must refund where the payer's PSP fails to apply SCA). Art 19 *does* exist — in the **SCA Delegated Regulation (EU) 2018/389** — but it concerns strong customer authentication dynamic linking, not refunds. In UK law the equivalent domestic rule is **Payment Services Regulations 2017, reg 76**. | §1.3, §7 |
| "Report to Action Fraud" | **Out of date.** Action Fraud was replaced by **Report Fraud** (reportfraud.police.uk), live 4 Dec 2025, full public launch 20 Jan 2026. Phone 0300 123 2040; Scotland still 101. Note the FOS fraud page has already been updated to say "Report Fraud", but the **PSR consumer page still says "Action Fraud the Police national fraud reporting centre"** — a live inconsistency on a .gov.uk site. | §1.2, §3.1 |

### 0.2 "Chargeback crypto" — resolved, no longer UNVERIFIED

No regulator publishes an advisory titled "chargeback crypto". But the underlying claim is now **verifiably supported** from two independent official sources, so articles can state it as fact:

- **FBI IC3, "Irrevocable Transactions that Move Quickly"**: "Third parties do not sit between, or authorize, transactions and transactions are **irrevocable — meaning they cannot be reversed**." https://www.ic3.gov/CrimeInfo/Cryptocurrency
- **Financial Ombudsman Service, decision DRN-3920585** (Monzo): a chargeback is a *voluntary card-scheme* process that can only be run **against the merchant the cardholder actually paid**. Here the card was used to buy crypto from an exchange (F), which supplied the requested service; the fact the crypto was then transferred on to the investment fraudster (X) "doesn't give rise to a valid chargeback claim against the merchant Mr I paid… any chargeback attempt would likely fail." https://www.financial-ombudsman.org.uk/decision/DRN-3920585.pdf
- **FOS DRN-4718186** (Danske): "when a customer has paid for cryptocurrency and has received cryptocurrency, we wouldn't expect a chargeback to reasonably succeed. That's because, amongst other things, the merchant has provided the service." https://www.financial-ombudsman.org.uk/decision/DRN-4718186.pdf

**Publishable framing:** a chargeback is a *card-scheme* remedy against a *merchant*. Once value has converted to crypto and moved on-chain, there is no merchant to charge back and no mechanism to reverse the transfer. Do **not** write "chargeback crypto is a thing" — the inverse is what the sources support.

### 0.3 Source tiers used

- **Tier 1 (publish freely):** `.gov`, `.gov.uk`, `.police.uk`, regulator and ombudsman sites, legislation databases, official registries.
- **Tier 2 (attribute explicitly, e.g. "according to UK Finance's 2026 fraud report"):** industry bodies.
- **Tier 3 (blog only — must be labelled as such in the article):** MoneySavingExpert, Which?, law-firm client alerts (A&O Shearman, Grant Thornton).
- **Tier 4 (UNVERIFIED — do not publish):** anything in §6.

---

## §1 Regulator and official guidance

### 1.1 UK — Payment Systems Regulator (PSR)

**The APP scams reimbursement requirement (the single most important UK fact for this Journal).**

- Started **7 October 2024**. Primary sources: **PS24/7** (policy statement), **CP24/11** (consultation), and **Specific Direction 20** (FPS) / SD22 (CHAPS).
- **Cap: £85,000 per claim.** Confirmed verbatim in the Q1 2026 dashboard's own data notes: "Metric 2.1.2 includes the value of APP scam below the £100 excess, above the maximum cap (£85,000)…" https://www.psr.org.uk/information-for-consumers/app-scams-reimbursement-dashboard
  - **⚠️ Critical nuance:** FSCS raised the *deposit protection* limit from £85,000 to **£120,000** on 1 Dec 2025 (BoE/PRA, announced 18 Nov 2025). **The APP cap did not move with it.** It was still £85,000 in the dashboard updated 30 July 2026. Article text must not conflate the two figures. Re-verify before publishing — the PSR has previously said it intends the APP cap to track the FSCS limit.
- **Excess: optional £100**, taken from the reimbursement. **Not available to vulnerable customers** (for them the full amount is reimbursed).
- **Deadlines:** claim must be made within **13 months** of the payment. The sending firm must decide within **5 business days**; a **35 business day** clock-stop applies if the receiving firm doesn't pay its 50% share.
- **Cost split:** 50:50 between sending and receiving PSPs. **Minimum £100** claim value. **Faster Payments and CHAPS only.**
- **Who is covered:** individuals, micro-enterprises, and charities (per dashboard note: "individuals, small businesses or charities with an annual income of less than £1 million").
- **Who is not covered:** credit unions, municipal bodies, non-bank issuers; and the requirement does not apply to civil disputes, cross-system or international payments, or payments made for unlawful purposes.
- **Gross negligence bar** is the main reason for rejection — PSR reports only **3%** of claims rejected for insufficient caution across the first 18 months (~1,700, or 2%, in Q1 2026).

**Live dashboard data (updated 30 July 2026), covering 7 Oct 2024 – 31 Mar 2026:**
- **88% (£316m)** of money lost to APP scams reimbursed. (UK Finance reported 61% on personal accounts in 2024 — not directly comparable, different definitions.)
- ~**438,300** claims reported; **301,500** in scope for reimbursement.
- **82%** closed within five business days; **98%** within 35.
- Q1 2026 alone: **~58,400** reimbursable claims closed; **89%** of claim value reimbursed (£72.6m — highest quarter to date).
- **Data excludes "on-us" APP scams** (both accounts at the same firm) and excludes non-Faster-Payments rails. The PSR explicitly notes "some public reporting of, and research into, APP fraud is broader than faster payments – e.g. in relation to crypto scams."

**Independent review + roadmap (this is the "what's next" angle):**
- **Frontier Economics** independent evaluation, published Q1 2026, reported by PSR 1 July 2026: in-scope payment fraud losses down **~£73m per year**, ~**35,000 fewer** APP scam cases, in-scope reimbursement **97%**, overall reimbursement up from 54% to 65%; no evidence of market exit or significant moral hazard — but **"some inconsistency in implementation remains across firms."** https://www.psr.org.uk/our-work/app-scams/app-scams-independent-review/ · T3 summary: https://www.jdsupra.com/legalnews/uk-psr-independent-review-of-app-9758981
- **APP scams policy roadmap** (verified): stakeholder engagement Aug 2026 → **formal consultation December 2026** → decision and revised legal directions **May 2027**. Consultation topics explicitly include: claims that cannot be resolved within 35 business days; **the treatment of "returns from investment" under the policy**; the consumer standard of caution; civil disputes; **"me-to-me" transactions**; and new data requirements on the platforms fraudsters use. https://www.psr.org.uk/our-work/app-scams/app-scams-policy-roadmap
  - **Journal angle:** the *returns from investment* topic is exactly the crypto-pig-butchering question. The policy is known to be under active consultation on it. Articles must say "under consultation", not "will be changed".

**Related PSR consumer pages:** Confirmation of Payee name-checking; "Unmasking how fraudsters target UK consumers in the digital age"; and a dedicated "Warning – fraudsters posing as PSR employees" page (useful for the impersonation-typology article).

### 1.2 UK — Financial Conduct Authority (FCA)

- **Warning List:** 18,664 entries, last updated 30/06/2026. https://www.thefca.org.uk/warning-list — **This is the single most useful free tool for a "is this firm real?" article.** Note it is a *list of firms the FCA warns against*, not a register of licensed firms; the register is the **Register** and the new **Firm Checker** tool.
- **Clone firms:** the documented pattern is a scammer copying a real FCA-authorised firm's details so that the scam site passes a naive check. The FCA publishes a specific clone-firms page explaining how to detect this. The correct test is not "does the site look official" but "does the *domain* match the firm named on the Register".
- **Crypto position (use this to kill the "but it's FCA-registered" argument):** the FCA states it is **not** given regulatory oversight over direct investments in cryptoassets or NFTs, and therefore **no consumer protection and no FSCS cover** applies. MoneyHelper restates this and adds that for a crypto problem "you can't complain about the service you received and you won't be able to get any protection or compensation through the FSCS or complain to the Financial Ombudsman Service." https://www.moneyhelper.org.uk/en/blog/financial-education/investment-and-scam-risks-with-cryptocurrency
- **Crypto investment scams page**, updated 16/02/2026. https://www.fca.org.uk/investsmart/cryptocurrency
- **FOI data, Feb 2026:** the FCA issued **1,528 crypto-related alerts** and **2,329 alerts in total** during 2025. Useful scale figure — roughly 65% of all warning-list activity in 2025 was crypto-related.
- **Boilerplate worth quoting for the 7 Oct 2024 cut-off:** FCA and PSR pages carry the line "If you sent money to a fraudster on or after 7 October 2024, you may be covered by protections introduced by the PSR." This date is the pivot for every UK reimbursement article.

### 1.3 EU / UK — PSD2 and the SCA rules

- **Art 73 PSD2:** where the payer notifies their PSP of an unauthorised payment, the PSP refunds by the end of the **next business day**.
- **Art 74 PSD2:** payer liability is limited to **€50** for unauthorised transactions; **€150** where the fraud results from gross negligence; **€500** where the payer failed to authenticate the transaction. The member state may reduce these to **€50 / €150**.
- **Art 91 PSD2:** where the payer's PSP fails to apply SCA, the **payee's** PSP refunds the payee.
- **UK domestic:** Payment Services Regulations 2017, **regulation 76** carries the Art 74 payer-liability limits into UK law. https://www.legislation.gov.uk/uksi/2017/752/regulation/76
- **Art 19** belongs to the **SCA Delegated Regulation (EU) 2018/389** and concerns dynamic linking in SCA. Not a refund provision. See §0.1.
- **Journal angle:** the €50/€150 limits apply to *unauthorised* transactions. In a pig-butchering or fake-exchange scam the customer *authorises* every payment, so the whole PSD2 unauthorised-payment regime is beside the point. This is a genuinely useful, and widely misunderstood, distinction.

### 1.4 UK — Financial Ombudsman Service

- **Award limits from 1 April 2026:** **£455,000** for acts/omissions on/after 1 April 2019; **£205,000** for acts/omissions before that date. (The widely-quoted **£170,000** is the obsolete 2022/23 pre-Apr-2019 figure — do not publish it.)
- **Interest:** the FOS applies the **Bank of England base rate + 1%** for referrals from 1 Jan 2026 (previously 8%).
- **Time limits:** a 10-year absolute time limit is being introduced. Business time limits remain: a complaint should be sent within a reasonable period, normally **6 years** for an act/omission, **12 years** for a contract claim, and the longstop is not more than 15 years.
- **Case costs:** the free-case allowance is being replaced by a **£2,000** limit from April 2026. Above that, FOS can direct the consumer to find their own representative and may recover part of the case cost.
- **Fraud-and-scams complaints page** — sets out what FOS can and cannot help with, and how a "fraud marker" on an account changes the process. It now routes to **Report Fraud**, not Action Fraud. https://www.financial-ombudsman.org.uk/consumer-information/fraud-and-scams

### 1.5 UK — FSCS

- Deposit protection limit raised from £85,000 to **£120,000** per person, per eligible bank, from **1 December 2025** (Bank of England / PRA announcement, 18 November 2025).
- Temporary high balance limit **£1.4m**, standard since November 2022.
- **Journal angle:** this covers *deposits held at a bank that fails*, and has nothing to do with authorised transfer fraud or crypto. It is the most over-claimed protection in UK consumer content, and a good "myth vs mechanic" article.

### 1.6 US — Consumer Financial Protection Bureau

- **Regulation E, 12 CFR §1005.6 — error resolution.** Two tiers:
  - **$50 tier:** the consumer notifies the institution within **60 days** of the statement; the institution must investigate and correct the error within **10 business days**, provisionally credit within that window, and can debit up to **$50** while investigating.
  - **$200 tier:** if the consumer notifies within **60 days** and the institution takes more than 2 business days (or 10, if it credited the account meanwhile), a *provisional credit of the disputed amount plus $50* is due by the next statement.
  - **Outer limits:** 45 days for errors on a consumer account provided the consumer notifies within 60 days; 90 days for errors on a "periodic statement" account with a prior automatic debit.
- **Authorised vs unauthorised:** Reg E error resolution applies to transfers the consumer *did not authorise*. A push-payment fraud is authorised by definition. Article must say this plainly.
- The 45/90/10 day clocks and the $50 provisional-credit amount are the numbers readers search for — they are highly quotable and almost always stated wrongly in blog content.
- https://www.consumerfinance.gov/rules-policy/regulations/1005/ — link the specific sections.

### 1.7 US — FBI IC3

- **2025 Annual Report (verified figures):** **$20.877bn** total reported losses; **1,008,597** complaints. Crypto-related: **$7.2bn** investment fraud; **181,565** crypto complaints totalling **$11bn**. AI-related: **22,364** complaints, ~**$893m**. Victims aged 60+: **~$7.7bn**.
- **Operation Level Up:** 8,000+ victims, **$500m+** in attempted losses prevented through outreach.
- The report frames crypto fraud through **pig butchering** and **forced-labour / Southeast Asia** compounds — cite the report rather than news coverage of it.
- https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf

**IC3 guidance directly usable in articles:**
- **What data to hand over:** cryptocurrency addresses; amount and type of cryptocurrency; date and time; **transaction ID (hash)**. "These unique identifiers vary in length and look like long strings of random letters and numbers." Even if you have nothing else, file anyway. https://www.ic3.gov/PSA/2023/psa230824
- **Address vs hash explainer:** BTC addresses are 26–63 characters and can start with different prefixes; Ethereum addresses are always **42 characters including the `0x` prefix**; both Bitcoin and Ethereum tx hashes are **64-character hex strings**. This is a genuinely useful, non-obvious article — many victims cannot tell which string they have.
- **IC3 Recovery Asset Team:** in one PSA, "when fraudulent transactions are reported in a timely manner and complete transaction information is provided, the IC3 Recovery Asset Team **may be able to assist in freezing** hundreds of thousands of dollars for victims of cybercrime." Note the words *may be able to* — never promise a freeze. https://www.ic3.gov/PSA/2025/PSA250424
- **Report to your bank too:** the same PSA says "It is also important to contact your bank… to request a **recall or reversal** as soon as you recognise fraud." This is the closest official US anchor to a bank-side recovery route.
- **Ages 60+:** National Elder Fraud Hotline **1-833-372-8311**, staffed to assist with filing the IC3 complaint.

### 1.8 US — CFTC, SEC, FINRA, FTC

**CFTC — "Don't be Re-Victimized by Recovery Frauds"** (the definitive anti-recovery-scam page; the backbone of any recovery article). https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/RecoveryFrauds.html
Red flags, all citable as a checklist:
- The recovery contact will **charge before receiving any service** / asks for an "upfront fee, retainer, or processing fee".
- Requests to **buy a trading or insurance product** on the scammer's behalf.
- Asks for **taxes or back-taxes** to release funds.
- Claims they can **trace, locate, and recover** money for a fee.
- **Faked press releases:** scammers publish what look like news announcements that a regulator has recovered a victim's funds.
- **Victim-list recycling:** scammers buy or scrape victim lists from other recovery services, so victims are *re-contacted by the same people who scammed them*.
- Tells: **webmail addresses** instead of company domains, **copied/borrowed logos**, **spelling and grammar errors**, "recovery" spelled "recovery" but domain is not the firm's.

**FINRA — "It Can Be Hard to Recover from 'Recovery' Scams"** (20 May 2024). https://www.finra.org/investors/insights/recovery-scams
- If someone charges you **up front for asset recovery, it is almost certainly a scammer**.
- **BrokerCheck impersonation** is the documented mechanism — scammers pose as BrokerCheck or a regulator.
- Scammers will push payment by **wire transfer or cryptocurrency** for their own "fee".

**FTC — "Refund and Recovery Scams"** (Dec 2023). https://consumer.ftc.gov/articles/refund-and-recovery-scams
- The **"sucker list"** mechanic: the scammer already knows you lost money, and names the specific company and amount.
- Asks for a **retainer, processing fee, or payment of supposed back taxes**.
- The **fake refund-check overpayment** trick: they send a fake check, ask you to forward part of it, and the "overpayment" bounces.
- FTC also issued a dedicated crypto recovery alert (16 Nov 2022). https://consumer.ftc.gov/comment/181303

**FBI IC3 — fictitious law firms targeting crypto scam victims** (PSA, 24 Jun 2024). https://www.ic3.gov/PSA/2024/PSA240624
- Victims seek help on fake websites, and are then asked to: verify identity with personal/banking information; state the "judgment amount" they're claiming; **pay a portion of fees up front with the balance due on recovery**; pay "back taxes"; and reference real institutions and money exchanges to build credibility.
- **$9.9m** in additional losses from this pattern Feb 2023 – Feb 2024. This is a *loss figure for a specific sub-pattern*, not a success rate — safe to quote.
- **FBI PSA 20 July 2026: "FBI Warns of Scammers Impersonating the IC3."** https://www.ic3.gov/PSA/2026/PSA260720 — currently live and highly relevant; anyone DMing victims claiming to be IC3 is lying.
- **FBI IC3 — exchange impersonation PSA (I-080124-PSA):** "hang up, call the official number, don't click links."

**CFTC — Forex and digital-asset check tools:**
- CFTC **Forex Frauds** hub; CFTC/SEC joint alert on fraudulent digital-asset trading sites; CFTC **virtual currency** advisories; CFTC **RED List** of registered and unregistered persons.
- Practical distinction worth an article: the RED List shows *registered* persons. Red-flagging an entity that appears on the RED List is not proof of wrongdoing — it flags non-registration.

**US verification tools (the "is this real?" article):**
- **SEC IAPD / adviserinfo.sec.gov** — Investment Adviser Public Disclosure.
- **FINRA BrokerCheck** — broker/dealer register.
- **NFA BASIC** — futures merchant register.
- Note that **none of these registers cover spot crypto exchanges or foreign unregulated platforms.** That gap is the single most useful thing a reader can know.

### 1.9 Gulf and Asian regulators (relevant if the Journal is not UK-only)

- **Singapore — MAS:** [Investor Alert List](https://www.mas.gov.sg/investor-alert-list) (entities gazetted as *not* authorised / warning), and the **Financial Institutions Directory** for genuinely licensed firms. The FID page carries an **explicit impersonation-scam warning** — fraudsters impersonate MAS-regulated institutions. The one-to-one mapping to FCA Register vs Warning List is the teachable structure.
- **UAE — SCA** licensed-companies register, with a **critical footnote**: a licence in the "Introduction" / **Category 5** activity does **not** authorise providing derivatives or spot FX trading services. This is a real, specific, and highly searchable misunderstanding.
- **UAE — DFSA** Public Register for DIFC.
- **Note for the subagent:** treat these as a single "regulator directories" article rather than separate country pieces, and always link the register, not a screenshot.

---

## §2 Scam typologies, 2024–2026

### 2.1 Recovery fraud / "asset recovery" scams — the most important typology for this business

| Variant | Mechanic | Source |
|---|---|---|
| Advance-fee recovery | Upfront retainer/processing fee; balance "on success" | CFTC, FTC, FBI IC3 PSA240624 |
| Sucker list | Scammer already knows your name, company and loss; names them back | FTC Refund & Recovery Scams |
| Faked press release | Fake news that a regulator recovered a victim's money | CFTC RecoveryFrauds |
| Victim-list recycling | Re-contacted by the same people who scammed you | CFTC RecoveryFrauds |
| Tax / back-fee release | "Pay back taxes to unlock your funds" | CFTC, FTC, FBI |
| Fake law firm | Claims to work with FBI/CFPB; asks for a judgment amount and banking details | FBI IC3 PSA240624 |
| BrokerCheck / regulator impersonation | Poses as the register or the regulator itself | FINRA, MAS FID page, FBI PSA260720 |
| **Recovery scammers DM'ing victims in r/CryptoScams and similar subreddits** | Second-wave approach on the same channel the first scam used | Community pattern — **Tier 4, do not present as sourced fact**; frame as "reported pattern" or omit |
| Recovery scam targeting *this* industry's customers | "Because you have a multi-currency account, we can trace cross-border…" — the currency/forex angle is itself a recovery-scam hook | Inferred; flag as analysis, not fact |

**Why this matters as a category:** City of London Police / NFIB reporting has long indicated that **fraud-recovery fraud accounts for over half of all investment-fraud victim reports**, i.e. victims are re-victimised at a higher rate than first-time victims. https://www.cityoflondon.police.uk/news/city-of-london/news/2021/march/first-time-victims-of-fraud-go-on-to-lose-373-million-to-repeat-frauds *(2021 data — cite the year, do not present as current.)*

### 2.2 Investment fraud

- **Pig butchering / "sha zhu pan"**: fake exchange shows fabricated profits, permits a small successful withdrawal, then demands more; when withdrawal is blocked the stated reasons escalate to **taxes, fees, or a minimum account balance**. A "customer service group" joins in and is part of the scam. FBI IC3 has documented this shape in multiple PSAs since 2021. https://www.ic3.gov/PSA/2021/PSA210916
- **"Returns from investment"** is now an explicit PSR consultation topic — the UK reimbursement policy's treatment of investment-scam returns is unsettled and under consultation to December 2026. **Do not state an outcome.**
- **AI-enabled / deepfake investment fraud:** IC3 recorded 22,364 AI-related complaints and ~$893m in 2025. Deepfakes are the structural change: a fake video call with a "senior colleague" is now a live impersonation vector.
- **Celebrity and brand impersonation for crypto**, per MoneyHelper.
- **Fake search-engine ads leading to fraudulent sites** — FBI IC3 PSA250424 explicitly addresses victims clicking fraudulent search ads.

### 2.3 Payment / bank-transfer fraud (UK)

UK Finance **Annual Fraud Report 2026** (published June 2026) — Tier 2 but the definitive industry dataset:
- **£1.28bn** stolen through payment fraud in 2025 (+4% on 2024; highest since 2021).
- **APP fraud £576.4m**, up ~19–20% YoY; APP is now **nearly half of all fraud losses**.
- Unauthorised fraud losses **£703.4m** (−5%); 3.81m confirmed cases (+11%).
- Industry **prevented £1.68bn** of unauthorised fraud — "70p in every £1 of attempted attacks".
- Online banking losses lowest since 2011; telephone banking losses lowest ever reported.
- UK Finance's editorial line: "Criminals' innovation frequently outpaces that of the sector." https://www.ukfinance.org.uk/system/files/2026-06/UK%20Finance%20Fraud%20Report%202026.pdf
- H1 2025 comparison point: £629.3m total, APP £257.5m, **investment-scam APP £97.7m (+55%)**.

**Payment-Services-Provider (PSP) / digital-wallet account takeover via one-time passcode** is the fastest-growing UK subtype: the scammer talks the victim into reading out an OTP to "verify" the account, then takes it over. Covered in UK Finance H1 2025 data.

**Other UK subtypes worth articles:**
- **Business email compromise (BEC)** — NCSC guidance. Facts change fast; go to NCSC, not blogs.
- **Invoice fraud / payment-diversion fraud** — the NCA has issued a **Payment Diversion Fraud amber alert** and an invoice-fraud infosheet. This is a B2B typology and fits a multi-currency account audience well.
- **"Safe account" and advance-fee loan scams** — MoneyHelper's typology page.
- **Vishing** — callers impersonating the bank, a government body, MoneyHelper, or now **Report Fraud / PSR** itself.

### 2.4 Seed-phrase and wallet compromise (theft, not deception)

This is a distinct category: the victim is not scammed into sending funds; the *key* is stolen.

- **Pharming / subdomain SEO poisoning** — **FreeDrain** used roughly **38,000** subdomains to rank fraudulent wallet-login pages in search results.
- **Seed-stealer malware** — **LummaC2** takedowns distributed stealers that exported wallet seed phrases.
- **Image-gallery OCR malware** — **SparkCat** scanned photo galleries looking for seed phrases, i.e. an attacker browsing a phone's photos can steal a wallet without ever touching the device remotely.
- **Fake "signature request" prompts** from malicious browser extensions or wallet apps train users to approve the real thing.
- **Physical mail to hardware-wallet owners** containing a card preloaded with an attacker's seed.
- **Journal angle:** "I only ever photographed my seed phrase once, in a photo I texted a friend" is a real, common, and under-recognised risk with a clean mechanical answer. Nobody at a regulator publishes a clean canonical list of these five vectors — **use vendor security-research names and label them as such (Tier 3/4), not as regulator findings.**

### 2.5 Impersonation

- Fake regulator and register warnings: FBI IC3 impersonation PSA (Jul 2026); MAS FID page; PSR "fraudsters posing as PSR employees"; FCA clone-firm material; MoneyHelper's standing notice that it "will never contact you out of the blue or charge anyone for our services."
- MoneySavingExpert reported a **fake Martin Lewis lookalike site** in July 2026 — a good UK-native example that does not require readers to know what a foreign regulator is. **Tier 3 — label as MSE reporting.**
- MoneyHelper's **Financial Crimes and Scams Unit: 0800 015 4402** (free, official, and worth featuring in a "who to actually call" box).

---

## §3 Real recovery routes

> **Editorial rule:** this section describes *mechanisms, deadlines and costs that exist*. It must never state a success rate, a typical recovered amount, or imply that a paid service will succeed. Where an official body itself hedges ("may be able to"), preserve the hedge.

### 3.1 United Kingdom

**Step 1 — contact your bank immediately, and say the word "fraud".**
- For Faster Payments, the relevant mechanism is a **recall request**. Two official UK Finance points, both dated, both worth quoting precisely:
  - The **Banking Protocol** allows branch staff to call 999 for an emergency response where a customer is in branch withdrawing cash or transferring funds in a way the bank believes may be scam-related. Reported figures: **£282.3m prevented and 1,298 arrests since 2016** (UK Finance evidence, later date) and **£202.8m prevented / 1,005 arrests** (Feb 2024 PQ answer). Cite the figure **with its date** — the numbers have grown and both are genuine.
  - The **Banking Protocol Cross Channel** route, which facilitates law-enforcement visits to potential victims, has a **72-hour window for engagement** — and UK Finance's own written evidence notes "engagement may not conclude before payments need to be processed." https://committees.parliament.uk/writtenevidence/113948/pdf
  - **Consequence for the article:** the first hours matter more than the first days, because institutional mechanisms have their own clocks. That is a *mechanistic* reason to act fast, not a sales promise. **Do not state a recall success rate** — none is published.
  - **Flag:** there is no single published "RNP rule" with a fixed time limit; recall is an operational request handled under the UK Finance Banking Protocol and Pay.UK Faster Payments operating rules. Keep the wording at that level of generality.

**Step 2 — claim under the PSR APP requirement (if the payment was a UK Faster Payments or CHAPS transfer on or after 7 October 2024).**
- Deadline: **13 months**. Decision: **5 business days**. Cap **£85,000**. Optional **£100 excess** (not for vulnerable customers). Sending and receiving firms **50:50**.
- What the claim is *for*: reimbursement from your own bank. This is a **statutory minimum standard**, not goodwill — an important framing that most blog content gets wrong.
- What kills a claim: **civil dispute** characterisation, **international/cross-rail** payments, **gross negligence / consumer standard of caution** (PSR: only ~2–3% rejected on caution grounds), and payments for unlawful purposes.
- **"Me-to-me" transfers and "returns from investment"** are both on the PSR's December 2026 consultation agenda — i.e. genuinely unsettled.
- **Consumer page:** https://www.psr.org.uk/information-for-consumers/app-fraud-reimbursement-protections/
- **Operational tool:** Pay.UK's **RCMS (Reimbursement and Case Management Service)** is the system firms use to manage FPS APP claims and file the required reporting. A subagent does not need to explain RCMS, but it is the answer if a reader asks whether these claims are real and processable.

**Step 3 — chargeback (cards) and Section 75.**
- **Section 75 (Consumer Credit Act 1974, s.75)** — MoneyHelper's plain-English summary, which is the best available: **credit card only**; covers **£100 to £30,000** per single item; a **deposit counts** as a single item; **joint liability** means you can be pursued for the whole balance; claim within **6 years** (debt) or **5 years** (breach of contract). The statute itself is on legislation.gov.uk.
- **Chargeback** — **debit and credit cards**, a **card-scheme rule rather than law**, must be claimed within **120 days**. MoneyHelper: chargeback is "best to claim as soon as you realise there's a problem".
- **The two are commonly confused and are not interchangeable.** Section 75 is a statutory right with a money range; chargeback is scheme-wide, has no statutory cap, and has a 120-day clock.
- **The crypto trap (see §0.2):** if your card was used to *buy crypto* from an exchange, and you received the crypto, a chargeback against the exchange will not succeed — the merchant supplied the service. Verified twice in published FOS decisions.
- **The credit-card-covered-rip-off trap:** MoneyHelper also flags that paying by credit card *via PayPal* may void Section 75.

**Step 4 — report it.**
- **Report Fraud** (reportfraud.police.uk) — the UK's national reporting centre, live 4 Dec 2025, public launch 20 Jan 2026; **0300 123 2040**; Scotland **101**. **Not "Action Fraud" any more.**
- **FCA** — report firms you suspect of unauthorised activity, and see the Warning List.
- **PSR** — for payment-system conduct, not individual fraud.
- **MoneyHelper Financial Crimes and Scams Unit: 0800 015 4402.**

**Step 5 — ombudsman.**
- **FOS** for acts/omissions by a regulated firm. Limits from 1 Apr 2026: **£455,000** / **£205,000**. Interest at BoE base + 1% from 1 Jan 2026. A fraud marker changes the process. 10-year absolute time limit being introduced.
- **No ombudsman route for crypto bought on an unregulated platform** — MoneyHelper is explicit that you cannot complain to FOS about it.

**Step 6 — deposit protection (different thing, frequently misused).**
- FSCS **£120,000** per person per eligible bank, from 1 Dec 2025; **£1.4m** temporary high balance. This is for a bank that has *failed*, not for fraud.

### 3.2 European Union

- **Art 73 PSD2** refund by the end of the next business day; **Art 74** liability caps €50 / €150 / €500; **Art 91** payee's PSP refunds where SCA fails. National implementation varies — **do not give country-by-country advice**.
- **EU consumer remedies for authorised payment fraud are not harmonised** the way the UK's APP regime is. Anyone who "authorised" the transfer is generally outside the unauthorised-payment regime. The UK's £85,000 PSR scheme has **no EU equivalent** — this is the single most important UK-vs-EU contrast for a multi-currency business and should be stated plainly, with the caveat that member-state national rules may offer something.
- **The cross-border problem:** a UK client whose funds left a UK account to an overseas exchange has left both the UK APP regime and, likely, practical recourse. Say this as a structural point, not as advice.

### 3.3 United States

- **Reg E error resolution (12 CFR §1005.6):** 10 business days to decide; 45/90-day outer limits; $50 offset; 60-day statement notice. **Applies to unauthorised transfers.** For authorised push-payment fraud, Reg E is the wrong instrument.
- **Bank recall/reversal:** FBI IC3 PSA250424 tells victims to "contact your bank… to request a **recall or reversal** as soon as you recognise fraud." Quote it as FBI guidance, not as a guaranteed right.
- **IC3 Recovery Asset Team:** "may be able to assist in freezing hundreds of thousands of dollars" — with timely, complete transaction information. Preserve "may be able to".
- **IC3 complaint:** what to include — addresses, amounts and types, dates/times, transaction hashes. Plus how you met the scammer, which platform, any domain, phone numbers/handles.
- **Elder Fraud Hotline 1-833-372-8311** for ages 60+.
- **No federal consumer "chargeback on crypto" right.** Reg E covers unauthorised electronic fund transfers, not on-chain value transfer.
- **Where a US-specific article should point for advice rather than information:** the CFPB's complaint route and state-level attorney general / consumer-protection offices. **Do not give individual US legal advice.**

### 3.4 What to say about third-party recovery services (this client's own category)

This is the highest-risk section for tone, and the Journal must be scrupulous here.

**Supportable, sourced statements:**
- "Upfront fees are the single strongest red flag." — FINRA, CFTC, FTC, FBI all say it.
- "No regulator endorses or refers to private recovery firms." *UNVERIFIED as a formal claim; see §6.*
- "Victims are routinely re-targeted by recovery scammers, and the second contact often comes from the people who committed the original fraud." — CFTC (victim-list recycling).
- "A legitimate trace is possible: on-chain transactions are permanently recorded on public distributed ledgers, and law enforcement can trace them in ways not possible with other financial systems." — FBI IC3. **This is the accurate, official version of the "crypto is traceable" claim, and it is genuinely the good news in this business.** Note IC3 immediately qualifies it: tracing becomes hard once funds cross into other jurisdictions, "especially those with lax anti-moneyful[m]ent laws".
- "Evidence quality determines what is possible." — IC3's list of required transaction data (§1.7) is effectively the industry's evidence checklist.
- "Time matters." — IC3's "reported in a timely manner", plus the UK Banking Protocol's 72-hour window and the 13-month APP claim window. These are objective deadlines, not urgency marketing.

**Statements that must NOT appear:** any success rate; any average or "typical" recovered amount; any implication that a fee buys a result; any "we can get your money back"; any "chargeback crypto"; any suggestion that a paid tracer can retrieve an on-chain transfer that has already been irreversible, without saying so.

---

## §4 12–15 search-intent H1s

Tagged: **AVOID** (prevention), **WHAT-NOW** (post-incident, time-sensitive), **IS-X** (verification/classification). Search intent is what the reader types; H1 should match it near-verbatim.

| # | H1 | Tag | Primary search intent | Anchor facts |
|---|---|---|---|---|
| 1 | How to spot a crypto investment scam before you send the first payment | AVOID | transactional / how-to | pig-butchering withdrawal-blocking pattern; MoneyHelper crypto-scam signs; IC3 PSA210916 |
| 2 | How to tell if a crypto platform is real (or a clone of a real one) | IS-X | verification | FCA Register vs Warning List (18,664 entries); Firm Checker; MAS FID; SEC IAPD / FINRA BrokerCheck / NFA BASIC; CFTC RED List (registration ≠ honesty) |
| 3 | "I sent crypto to a scammer" — what to do in the first hour | WHAT-NOW | transactional, urgent | bank first; reportfraud.police.uk + 0300 123 2040; capture addresses/hashes; IC3 report contents |
| 4 | Can I chargeback crypto? Why chargebacks don't work on on-chain transfers | IS-X | direct question | FOS DRN-3920585 & DRN-4718186; IC3 irrevocable transactions; 120-day scheme clock; not law but scheme rule |
| 5 | Section 75 or chargeback? The difference explained (and why crypto breaks both) | IS-X | comparison | §3.1: £100–£30,000, 6yr/5yr, joint liability, deposit counts; 120 days; PayPal trap |
| 6 | What is the £85,000 APP scam limit and does my claim qualify? | WHAT-NOW | specific-number | PSR: £85,000 cap, £100 excess, 13 months, 5/35 business days, 50:50, FPS+CHAPS only; £120,000 FSCS is a *different* limit |
| 7 | How long do I have to report a bank transfer scam? (Every deadline that matters) | WHAT-NOW | deadlines | 13 months; 5 business days; 35-day clock-stop; 120 days chargeback; 6yr/5yr S75; 60-day Reg E; IC3 timeliness |
| 8 | Fraud recovery scams: how the second wave works and how to spot it | AVOID | secondary-victim awareness | CFTC full red-flag list; FTC sucker list; FBI fictitious law firms ($9.9m); FINRA advance-fee rule; IC3 impersonation PSA Jul 2026 |
| 9 | Recovery firms charge money up front — is that always a scam? | IS-X | sceptical-but-serious | FINRA "almost certainly a scammer"; CFTC "charge before receiving any service"; and the legitimate counterpart: what a *regulated* professional is required to do instead (FOS/FSMA-authorised, FCA Register, written scope, no guaranteed outcome) |
| 10 | I sent money to a fake trading platform — can my bank or exchange get it back? | WHAT-NOW | bank/exchange route | bank recall (Banking Protocol, 72-hour Cross Channel); exchange-side freeze/flagging is a *request*, not a right; IC3 Recovery Asset Team "may be able to" freeze; PSR cap and exclusions; FOS |
| 11 | "Please send the seed phrase to recover my funds" — and every other wallet-theft trick | AVOID | technical threat | FreeDrain ~38,000 subdomains; LummaC2; SparkCat photo-gallery OCR; fake signature-request prompts; physical Ledger-style letters |
| 12 | Why won't the police or the regulator get my crypto back? | WHAT-NOW | expectations-setting | Report Fraud vs PSR vs FCA vs FOS remits; crypto not FSCS-covered; FCA not oversight of crypto; cross-jurisdiction tracing limits; authorised vs unauthorised |
| 13 | What "funds" are still traceable after a crypto scam? | AVOID / WHAT-NOW | technical literacy | IC3: permanent public ledger, law enforcement can trace; but cross-border/lax-AML break points; mixing, chain hops, exchange off-ramp — **cite only the IC3 framing; any detailed laundering-chain content is Tier 4, see §6** |
| 14 | Invoicing fraud and payment-diversion scams: the business-side playbook | AVOID | B2B | NCSC BEC guidance; NCA Payment Diversion Fraud **amber alert**; NCA invoice-fraud infosheet; dual-approval controls; Confirmation of Payee |
| 15 | 13 months, 5 days, £85,000: the UK APP reimbursement rules in plain English | WHAT-NOW | summary explainer | Everything in #6 plus PSR dashboard (88% of £316m reimbursed; 82% closed in 5 days; 3% rejected) — **and the December 2026 consultation caveat** |
| 16 *(optional)* | FCA, SEC, FINRA, MAS, SCA, DFSA: which register proves a firm is real? | IS-X | registry navigation | One register per activity per jurisdiction; the gap (spot crypto exchanges and offshore platforms are registered *nowhere*) |

**Editorial notes for the subagent:**
- Every WHAT-NOW article must open with the *fastest useful action* and the phone number, because that is what a reader needs at 2am.
- Every IS-X article must end with the **official register URL**, never a screenshot.
- Pair an AVOID article with its WHAT-NOW twin (1↔3, 8↔3, 11↔3).
- Do not publish #13 without the "law enforcement can trace" *and* "cross-jurisdiction tracing becomes difficult" halves together — the one-sided version is the crypto-recovery industry's worst habit.

---

## §5 Per-article forum questions (3–5 each)

Questions harvested from recurring patterns on r/CryptoScams, MoneySavingExpert comments, and general fraud forums. **These are the questions the article must answer in the body, not filler FAQs.** They are also the FAQ-block source for each piece.

### #1 How to spot a crypto investment scam before you send the first payment
- "The platform let me withdraw a small amount first. Doesn't that prove it's real?"
- "What's the difference between a rug pull, a pig-butchering farm and a Ponzi? Do I need to know which one it is?"
- "Is a whitepaper or a licence on the website any evidence at all?"
- "They have a Telegram group with other people posting profits. Are those real people?"
- "How much is 'normal' returns for a real platform, so I know what's a lie?"

### #2 How to tell if a crypto platform is real
- "The site has a fancy logo, a London address and an 'FCA regulated' badge. Is that enough?"
- "What exactly do I type into the FCA Register to check a firm, and what does a match actually prove?"
- "If a firm is on the FCA Warning List, have they definitely done something wrong?"
- "The exchange is registered in another country. Can the FCA or SEC tell me anything about it?"
- "Is there any register that covers the spot exchanges I'd actually use?"

### #3 "I sent crypto to a scammer" — what to do in the first hour
- "Do I call my bank or the exchange? And in what order?"
- "What exactly do I write down before the window closes, and where do I find a transaction hash?"
- "Is it worth reporting to the police if I'm embarrassed? Does anyone actually read these?"
- "Should I keep talking to the scammer, pretending, to get more information?"
- "Am I going to get it back? Be straight with me."

### #4 Can I chargeback crypto?
- "I paid by debit card to a 'crypto investment platform' — can't I just chargeback it?"
- "If I bought real Bitcoin from a legitimate exchange and then sent it to the scammers, is the exchange liable?"
- "How long do I have to raise a chargeback?"
- "Is a chargeback a legal right or just a favour?"
- "What does 'the merchant provided the service' actually mean in practice?"

### #5 Section 75 or chargeback?
- "I paid a website by credit card and they disappeared. Section 75 — how do I actually use it?"
- "My item was £45,000 and the company won't refund. Is that inside Section 75?"
- "I paid a deposit. Is that covered or does it only count once I get the goods?"
- "If it's a joint account, can the other person be pursued for the whole thing?"
- "Does paying through PayPal still give me Section 75?"

### #6 The £85,000 APP limit
- "The bank says I was over the limit. Does that mean I lose everything above £85,000?"
- "What's the £100 excess and can I opt out?"
- "I'm a small limited company, not an individual. Am I covered?"
- "I'm a charity. Is that in or out?"
- "My payment went via international transfer, not Faster Payments. Does the rule still apply?"

### #7 Every deadline that matters
- "Is it 13 months from the payment or from when I found out?"
- "Which clock matters most — the bank's 5 days or my 13 months?"
- "Does the 120-day chargeback clock and the 13-month APP clock run at the same time? Can I use both?"
- "If I only found out about it after a year, am I too late?"
- "What if the bank didn't tell me about the 5-day decision? Does that restart anything?"

### #8 Fraud recovery scams
- "How did they already know which company I lost money to?"
- "A lawyer's firm got in touch about my case and said they can get the regulator to release my funds. How do I check they're real?"
- "I got a press release saying my money was recovered. It was on a site I'd never seen. Is that real?"
- "Is it always a scam, or is there a version of this that's legitimate?"
- "Why do they want my bank details again — I already gave them to the first scammers."

### #9 Upfront fees and recovery firms
- "The firm quoted me 20% up front. Is that normal in this industry or is that a red flag?"
- "Can any legitimate recovery service work without charging anything at all?"
- "What questions should I ask before sending money to anyone claiming to trace funds?"
- "There's a lawyer who says they can pursue the scammer through the courts. Is that different?"
- "How do I check whether a recovery company is actually regulated?"

### #10 Can my bank or the exchange get it back?
- "The exchange says they can't help because the money's been withdrawn. Is that the end?"
- "My bank says they've 'raised a recall'. What does that actually mean and is it worth waiting for?"
- "Is there a time limit on asking the exchange to freeze the account?"
- "The scammer used an exchange in another country. Does that change anything at all?"
- "How long does it usually take to hear back from a recall request?" *(answer with the published 72-hour protocol window and the 5/35-business-day claim clocks — never with a "usually")*

### #11 Seed-phrase and wallet theft
- "I photographed my seed phrase and saved it to my phone. Is that already a problem?"
- "Someone in a support chat asked me to type my seed phrase to verify my wallet. Why would any real support need that?"
- "A browser extension asked me to sign a message. What does signing actually do?"
- "I got a physical card in the post with a wallet already set up. Is that a scam?"
- "If my seed phrase is already typed into a fake site, is there anything I can do?"

### #12 Why won't the police or regulator get it back?
- "I reported it to Action Fraud three weeks ago and heard nothing — is that normal, and where do I go now?" *(route: Report Fraud, not Action Fraud)*
- "Does the FCA or the PSR do anything at all for individual victims like me?"
- "If the platform wasn't FCA-regulated and my money wasn't in a bank, is there literally nobody to complain to?"
- "Why is this so different from being defrauded on a normal website?"
- "Would the police even accept a crypto case, given the amount?"

### #13 What is still traceable
- "If it was BTC, can it actually be traced, or is that just marketing?"
- "They mixed it through lots of exchanges. Is it still traceable?"
- "What does a blockchain analysis company actually do that I can't do for free?"
- "Does it help if I know the wallet address they sent it to?"
- "If it's been moved into a jurisdiction with weak rules, is the game over?"

### #14 Invoicing and payment-diversion fraud (business)
- "We got an email that looked exactly like our supplier but the bank details had changed. What should have caught that?"
- "Do dual-approval controls actually work in practice for a small team?"
- "What does Confirmation of Payee actually check, and what does it not check?"
- "We paid a fake invoice. Do we have any route to the money or to the bank?"
- "The supplier says the fraudster used their real account details. Does that help us?"

### #15 The UK APP rules in plain English
- "Does the £85,000 limit apply per payment or per claim?"
- "Why does the bank get to deduct £100 when I didn't ask it to?"
- "If my bank says it's not an APP scam, do I get to disagree?"
- "Is the whole £85,000 guaranteed, or does the bank still get a say?"
- "Will these rules change? I'm told there's a consultation coming." *(answer: yes — PSR December 2026 consultation, covering returns from investment and me-to-me; decision May 2027)*

### #16 Which register proves a firm is real
- "Is there one list I can check any financial company against, anywhere in the world?"
- "The firm says it's licensed in Dubai. Is the SCA register the right one to check?"
- "MAS says it's on the Investor Alert List. Does that mean it's definitely a scam?"
- "What's the difference between a register and a warning list?"
- "Why is there no register for the exchange I was actually using?"

---

## §6 UNVERIFIED register — do not publish these as fact

| Claim | Status |
|---|---|
| Any recovery-firm success rate, or "typical amount recovered" | **Prohibited by brief and unsupported by any source found.** |
| A CFTC/SEC/FINRA advisory literally titled "chargeback crypto" | **Does not exist.** The *substance* is verified via IC3 + two FOS decisions (§0.2). Cite those, not a nonexistent advisory. |
| A formal regulator statement that "no regulator endorses or refers to private recovery firms" | **UNVERIFIED.** The claim that no regulator *lists* such firms is strongly implied by the absence of any such listing, but do not assert it as a positive statement. Reframe as "check the register yourself." |
| Any fixed "RNP" time limit for a UK bank recall | **UNVERIFIED.** What is verified: recall requests are made, the Banking Protocol exists, and the Cross Channel route has a 72-hour engagement window. Use that language. |
| A UK bank recall success rate | **No official figure found. Do not state one.** |
| Detailed crypto laundering-chain typologies (mixers, chain hops, structuring thresholds, off-ramp patterns) | **UNVERIFIED from official sources.** Any technical content must be sourced to named security vendors and labelled as vendor research, or omitted. |
| The specific figure of "over half of investment-fraud reports are recovery fraud" | **Verified but dated 2021** (City of London Police / NFIB). Always attach the year. |
| Behaviour of recovery scammers on Reddit/subreddits | **Community observation, no official source.** Frame as "reported by victims" or omit. |
| Whether the £85,000 APP cap will rise to match the £120,000 FSCS limit | **UNVERIFIED future.** PSR has previously signalled intent to track FSCS; as of the 30 July 2026 dashboard it was still £85,000. Say so, and date-stamp it. |
| MoneyHelper and Action Fraud page bodies | Direct fetch returned **403**; content obtained via search index only. Prefer a working MoneyHelper URL or paraphrase without quoting. `actionfraud.police.uk` also 403s — **use reportfraud.police.uk.** |

---

## §7 Source list

### UK — regulators and official
- PSR — APP fraud reimbursement protections: https://www.psr.org.uk/information-for-consumers/app-fraud-reimbursement-protections/
- PSR — APP scams reimbursement dashboard Q1 2026 (updated 30 Jul 2026): https://www.psr.org.uk/information-for-consumers/app-scams-reimbursement-dashboard
- PSR — APP scams policy roadmap: https://www.psr.org.uk/our-work/app-scams/app-scams-policy-roadmap
- PSR — APP scams independent review: https://www.psr.org.uk/our-work/app-scams/app-scams-independent-review/
- PSR — APP scams (hub): https://www.psr.org.uk/our-work/app-scams/
- PSR — Warning, fraudsters posing as PSR employees: https://www.psr.org.uk/information-for-consumers/warning-fraudsters-posing-as-psr-employees/
- PSR — Unmasking how fraudsters target UK consumers: https://www.psr.org.uk/information-for-consumers/unmasking-how-fraudsters-target-uk-consumers-in-the-digital-age/
- PSR — Confirmation of Payee written evidence: https://committees.parliament.uk/writtenevidence/17605/pdf
- PS24/7 policy statement: https://www.psr.org.uk/publications/policy-statements/ps234-app-scams-reimbursement-policy-statement *(PS23/4 URL; see also PS25/5 consolidated text at https://service.betterregulation.com/document/795564)*
- FCA — Warning List (18,664 entries, updated 30/06/2026): https://www.thefca.org.uk/warning-list
- FCA — crypto investment scams (updated 16/02/2026): https://www.fca.org.uk/investsmart/cryptocurrency
- FOS — Fraud and scams complaints: https://www.financial-ombudsman.org.uk/consumer-information/fraud-and-scams
- FOS decision **DRN-3920585** (Monzo; chargeback vs crypto exchange): https://www.financial-ombudsman.org.uk/decision/DRN-3920585.pdf
- FOS decision **DRN-4718186** (Danske; chargeback after crypto purchase): https://www.financial-ombudsman.org.uk/decision/DRN-4718186.pdf
- Report Fraud (ex-Action Fraud; live 4 Dec 2025, launched 20 Jan 2026): https://reportfraud.police.uk/ · phone 0300 123 2040
- Consumer Credit Act 1974 s.75: https://www.legislation.gov.uk/ukpga/1974/58/section/75
- Payment Services Regulations 2017 reg 76: https://www.legislation.gov.uk/uksi/2017/752/regulation/76
- NCSC — business email compromise: https://www.ncsc.gov.uk/
- MoneyHelper — Types of scam: https://www.moneyhelper.org.uk/en/money-troubles/scams/types-of-scam
- MoneyHelper — Investment and scam risks with cryptocurrency: https://www.moneyhelper.org.uk/en/blog/financial-education/investment-and-scam-risks-with-cryptocurrency
- MoneyHelper — How to spot cryptocurrency and Bitcoin scams: https://www.moneyhelper.org.uk/en/blog/scams-and-fraud/how-to-spot-cryptocurrency-bitcoin-scams
- MoneyHelper — Shopping and paying safely online (chargeback / Section 75 / 120 days): https://www.moneyhelper.org.uk/en/everyday-money/banking/shop-safely-online
- MoneyHelper — Financial Crimes and Scams Unit **0800 015 4402**; FCA reporting: https://www.moneyhelper.org.uk/en/money-troubles/scams
- Pay.UK — Faster Payments participants: https://www.wearepay.uk/what-we-do/payment-systems/faster-payment-system/payment-system-participant-list
- UK Finance — Annual Fraud Report 2026 (£1.28bn; APP £576.4m): https://www.ukfinance.org.uk/system/files/2026-06/UK%20Finance%20Fraud%20Report%202026.pdf
- UK Finance — Annual Fraud Report 2024 (BPS, Vulnerable Victims Notification, 62% APP recovery 2023): https://www.ukfinance.org.uk/system/files/2024-05/Annual%20Fraud%20Report%202024_0.pdf
- UK Finance — Banking Protocol written evidence (£282.3m / 1,298 arrests): https://committees.parliament.uk/writtenevidence/125827/pdf
- UK Finance — written evidence on the **72-hour Cross Channel window**: https://committees.parliament.uk/writtenevidence/113948/pdf
- UK Finance — PSR consultation response 2022 (CRM/APP background): https://www.ukfinance.org.uk/system/files/2022-12/UK%20Finance%20PSR%20APP%20Consultation%20Response.pdf
- House of Commons Library, *Fraud* briefing (Banking Protocol since 2016; £202.8m / 1,005 arrests, Feb 2024 PQ): https://researchbriefings.files.parliament.uk/
- City of London Police / NFIB — first-time vs repeat victims, 2021: https://www.cityoflondon.police.uk/news/city-of-london/news/2021/march/first-time-victims-of-fraud-go-on-to-lose-373-million-to-repeat-frauds
- FCA response to Treasury Committee on APP / "on-us" scams: https://committees.parliament.uk/publications/34192/documents/188088/default

### EU
- PSD2 (Directive (EU) 2015/2366), Arts 73, 74, 91
- SCA Delegated Regulation (EU) 2018/389, Art 19 (dynamic linking — *not* a refund provision)
- UK Payment Services Regulations 2017, reg 76 (domestic equivalent of Art 74)

### US
- CFPB — Regulation E, 12 CFR Part 1005 (§1005.6 error resolution, §1005.11 timing): https://www.consumerfinance.gov/rules-policy/regulations/1005/
- FBI IC3 — Cryptocurrency crime info ("Irrevocable Transactions that Move Quickly"): https://www.ic3.gov/CrimeInfo/Cryptocurrency
- FBI IC3 — PSA I-082423-PSA, guidance for crypto scam victims (required transaction data): https://www.ic3.gov/PSA/2023/psa230824
- FBI IC3 — PSA I-080124-PSA, exchange impersonation ("hang up, call the official number, don't click links")
- FBI IC3 — PSA 20 Jul 2026, scammers impersonating the IC3: https://www.ic3.gov/PSA/2026/PSA260720
- FBI IC3 — PSA, employee self-service website impersonation (**recall/reversal; Recovery Asset Team "may be able to" freeze**): https://www.ic3.gov/PSA/2025/PSA250424
- FBI IC3 — PSA, fictitious law firms targeting crypto scam victims ($9.9m): https://www.ic3.gov/PSA/2024/PSA240624
- FBI IC3 — PSA, liquidity mining scam: https://www.ic3.gov/PSA/2022/PSA220721
- FBI IC3 — PSA, romance-scam-to-investment pivot: https://www.ic3.gov/PSA/2021/PSA210916
- FBI IC3 — **2025 Annual Report** ($20.877bn; 1,008,597 complaints): https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf
- FBI IC3 — file a complaint: https://www.ic3.gov/
- CFTC — Don't be Re-Victimized by Recovery Frauds: https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/RecoveryFrauds.html
- CFTC — Forex frauds / virtual currency advisories / RED List: https://www.cftc.gov/
- SEC — IAPD (Investment Adviser Public Disclosure): https://adviserinfo.sec.gov/
- FINRA — "It Can Be Hard to Recover from 'Recovery' Scams" (20 May 2024): https://www.finra.org/investors/insights/recovery-scams
- FINRA — BrokerCheck: https://brokercheck.finra.org/
- NFA — BASIC: https://www.nfa.futures.org/basicnet/
- FTC — Refund and Recovery Scams (Dec 2023): https://consumer.ftc.gov/articles/refund-and-recovery-scams
- FTC — crypto recovery alert (16 Nov 2022): https://consumer.ftc.gov/comment/181303

### Gulf / Asia
- MAS — Investor Alert List: https://www.mas.gov.sg/investor-alert-list
- MAS — Financial Institutions Directory (carries the impersonation-scam warning)
- UAE SCA — licensed companies register (note the Category 5 / "Introduction" licence limitation)
- UAE DFSA — Public Register: https://www.dfsa.ae/public-register/financial-instruments

### Tier 3 — label explicitly in the article
- MoneySavingExpert — "I've been scammed" (updated 20 Aug 2026); 1 Jul 2026 news item on inconsistent APP implementation and the fake Martin Lewis lookalike site: https://www.moneysavingexpert.com/
- A&O Shearman — note on the Frontier/PSR review (13 Jul 2026): https://www.jdsupra.com/legalnews/uk-psr-independent-review-of-app-9758981
- Grant Thornton — on the PSR's December 2026 consultation (21 Sep 2026): https://www.grantthornton.co.uk/insights/app-fraud-reimbursement-requirement-were-industrys-concerns-justified/
- Frontier Economics — APP payment scam policies reducing fraud: https://www.frontier-economics.com/uk/en/news-and-insights/news/news-article-i22383-app-payment-scam-policies-reducing-fraud/
- Named security-research vendor material for FreeDrain (~38,000 subdomains), LummaC2 takedowns, and SparkCat photo-gallery OCR.

---

## §8 Hard editorial rules for the writing subagent

1. **No success rates, no typical amounts recovered, no "we can help you get it back."** Not softened, not hedged — absent.
2. **No personalised financial or legal advice.** Describe the mechanism and the deadline; point to the official body that decides.
3. **UK vs EU vs US must be visually separated on every remedy article.** The UK's £85,000 APP scheme has no EU or US equivalent, and saying so is one of the most valuable things this Journal can do.
4. **Date-stamp every number.** £85,000, £120,000, £455,000, 18,664, 88% — all were different six months ago.
5. **Link the register, never a screenshot.** Screenshots go stale and are trivially faked.
6. **Route readers to Report Fraud, not Action Fraud.** Where a live inconsistency exists (the PSR consumer page still says Action Fraud), a footnote is fine; the article text must use the current name.
7. **Preserve official hedges.** "May be able to assist in freezing" stays exactly that.
8. **Every recovery-service mention must be tested against the CFTC/FINRA/FTC/FBI red-flag list** — including our own. If the Journal would fail its own checklist, it cannot publish it.
