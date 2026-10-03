'use client';

import { useState } from 'react';
import { FAQS } from '@/lib/site';
import MarkWatermark from '@/components/MarkWatermark';

/**
 * Answer-first FAQ. Copy is phrased as the question in the H2 and opens with
 * the answer, which is what search engines and voice assistants both want.
 * Uppercase eyebrows are gone; the disclosure affordance is a CSS chevron.
 */
export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    // `isolate overflow-hidden` are the watermark's requirements, not the
    // section's: the left rail below this heading is empty for the height of
    // the accordion beside it, which is the one place on the homepage with room
    // for a mark this size.
    <section className="section section-rule relative isolate overflow-hidden" id="faq">
      <MarkWatermark edge="left" surface="light" />
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <header className="section-head lg:col-span-5">
            <h2 className="text-h2 text-foreground">Common questions, answered plainly.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              If your question is not here, ask us directly. We would rather answer it before you
              commit than after.
            </p>
          </header>

          <div className="lg:col-span-7">
            <dl className="border-t border-border">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-border">
                    <dt>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-150 hover:text-accent"
                      >
                        <span className="text-h4 text-foreground">{f.q}</span>
                        <span
                          aria-hidden="true"
                          className="relative mt-2 inline-block h-3 w-3 shrink-0"
                        >
                          <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                          <span
                            className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-200 ${
                              isOpen ? 'scale-y-0' : 'scale-y-100'
                            }`}
                          />
                        </span>
                      </button>
                    </dt>
                    {isOpen && (
                      <dd className="pb-7 pr-9">
                        <p className="max-w-measure text-body text-muted-foreground">{f.a}</p>
                      </dd>
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
