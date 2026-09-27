import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { PRIVATE_PREFIXES } from '@/lib/noindex';

/**
 * robots.txt
 *
 * This is a crawl hint, not an access control. Nothing here is secret and
 * nothing sensitive is reachable merely because a crawler was told to skip a
 * path — every route in the application is authenticated in its own handler,
 * and `scripts/check-api-auth.mjs` fails the build if one is not. This file
 * exists so we do not spend crawl budget on pages that cannot be indexed
 * anyway, and so private paths do not accumulate as discoverable URLs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE_PREFIXES],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
