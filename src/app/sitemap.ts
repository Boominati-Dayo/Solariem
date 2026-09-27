import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Sitemap.
 *
 * The list is an explicit allowlist rather than being generated from the
 * filesystem on purpose. A generated sitemap will cheerfully list /login,
 * /dashboard and every /reset-password/[token] variant it can find, which is
 * exactly the outcome this file exists to prevent. Because it is an allowlist,
 * every session-gated or transactional route is excluded by default, and
 * adding a page here is a deliberate act.
 *
 * NOTE: SITE_URL defaults to http://localhost:3000 until NEXT_PUBLIC_SITE_URL
 * is set. Do not deploy this without it — it would advertise a localhost URL to
 * every search engine that reads the sitemap.
 */
type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

const ENTRIES: Entry[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/asset-recovery', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/banking', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/asset-recovery/report', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ENTRIES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
