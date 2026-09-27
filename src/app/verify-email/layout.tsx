import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/noindex';

// The page itself is a client component and cannot export metadata, so the
// directive lives here. See src/lib/noindex.ts.
export const metadata: Metadata = NOINDEX;

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
