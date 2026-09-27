import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { issueUploadGrant } from '@/lib/upload-grant';

/**
 * Mints a short-lived single-use grant for POST /api/upload.
 *
 * The public recovery report form calls this immediately before uploading
 * evidence, so an anonymous visitor can attach a screenshot without holding
 * an account. Signed-in users do not need a grant at all.
 *
 * Rate limited, because a grant is only as good as its scarcity.
 */

const limit = rateLimit({
  scope: 'upload-grant',
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many upload requests. Please try again later.'
});

export async function POST(request: NextRequest) {
  const limited = limit(request);
  if (limited) return limited;

  return NextResponse.json({ success: true, grant: issueUploadGrant() });
}
