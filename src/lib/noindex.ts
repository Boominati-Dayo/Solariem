import type { Metadata } from 'next';

/**
 * Shared robots directive for routes that must never be indexed.
 *
 * Most of these pages are `'use client'` components, which cannot export
 * `metadata` — so each one gets a tiny server `layout.tsx` that re-exports
 * this instead. That is the only mechanism Next.js offers for suppressing
 * indexing on a client page.
 *
 * These routes are session-gated, transactional, or single-purpose: a login
 * form, a password reset, a verification landing, an admin screen. None of
 * them carry indexable content, and a search result pointing a stranger at
 * someone's password reset is worse than no result at all.
 */
export const NOINDEX: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Used by robots.ts as well as by the layouts above. Kept here so the two
 * cannot drift: a path added to one but not the other is a silent SEO defect.
 */
export const PRIVATE_PREFIXES = [
  '/account',
  '/admin',
  '/api',
  '/activate-email',
  '/dashboard',
  '/login',
  '/ref',
  '/reset-password',
  '/signup',
  '/verify-email',
] as const;
