import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/noindex';

// The page itself is a client component and cannot export metadata, so the
// directive lives here. A reset link is also a bearer credential: anything that
// indexes it would put a working password reset in a search result.
export const metadata: Metadata = NOINDEX;

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
