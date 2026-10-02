'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import React from 'react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * Decides what chrome a page gets.
 *
 * The auth pages share one treatment deliberately: site header, no footer. They
 * used to be split three ways — `/login` and `/signup` got a header, while
 * `/reset-password`, `/verify-email` and `/activate-email` got nothing at all
 * and `/reset-password/[token]` fell through to the full header-and-footer
 * branch because it is not an exact string match on `/reset-password`. So the
 * two halves of a single password reset looked like two different products, and
 * the half a reader lands on from an email was the barest one.
 *
 * `/reset-password/` is matched with a prefix rather than `===` so the token
 * route lands on the same layout as the request route.
 *
 * These pages render their own `<main>`: `AuthShell` in
 * `src/components/AuthForm.tsx` owns the landmark. The header is above it and
 * the skip link points at `id="main"` inside it.
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthForm =
    pathname === '/activate-email' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/verify-email' ||
    pathname === '/reset-password' ||
    pathname?.startsWith('/reset-password/');
  const isReferral = pathname?.startsWith('/ref/');

  // No chrome at all: the dashboard supplies its own sidebar and header, and a
  // referral landing page is a single call to action.
  if (isDashboard || isReferral) {
    return <>{children}</>;
  }

  // Auth forms: header to orient, no footer — a reader who has just asked to
  // reset a password should not be offered the whole site underneath.
  if (isAuthForm) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // All other pages: Header + Footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-24 mobile:pb-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}
