'use client';

import { useEffect, useState } from 'react';

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  picture: string;
};

/**
 * Testimonials are read from the database, not hard-coded. If no testimonials
 * have been published through the admin panel the section renders nothing,
 * which is deliberate: the previous version shipped invented quotes with
 * invented recovery figures, and in this category that is a deceptive-practice
 * problem as well as a design one.
 */
export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/testimonials');
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) setItems(json.data);
      } catch {
        // A testimonials failure must never break the page.
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">What clients said afterwards.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            Names are shortened at the client's request. Outcomes vary, and none of these is a
            promise of what your case will do.
          </p>
        </header>

        <dl className="mt-16 divide-y divide-border border-y border-border">
          {items.map((t) => (
            <div key={t._id} className="grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-3">
                <dt className="text-h4 text-foreground">{t.name}</dt>
                <p className="mt-1 text-caption text-muted-foreground">{t.role}</p>
              </div>
              <dd className="max-w-measure text-body text-muted-foreground md:col-span-9">
                {t.content}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
