import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { consumeUploadGrant } from '@/lib/upload-grant';
import { authenticateRequest } from '@/middleware/auth';

/**
 * Evidence upload.
 *
 * @optional-auth anonymous callers are served, but only with a single-use
 * grant from /api/upload/grant; everyone else needs a session.
 *
 * Public by necessity: the recovery report form at /asset-recovery/report is
 * the lead-capture funnel and holds no session. That makes this an open upload
 * path, so it is fenced in:
 *  - rate limited per IP (was unlimited: anyone could spend our quota)
 *  - images/PDF only, identified by magic bytes rather than the caller's claim
 *  - 5MB cap enforced here, not only in the browser
 *  - a short-lived single-use grant from /api/upload/grant, so this is not a
 *    general-purpose proxy for our Cloudinary API secret
 *
 * Signed-in callers (dashboard, admin) skip the grant.
 *
 * Note the auth check is deliberately optional rather than requireAuth: an
 * anonymous caller is legitimate here, and requireAuth would reject them
 * before the grant could be considered.
 */

const MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_SIGNATURES: Array<{ mime: string; ext: string; test: (b: Buffer) => boolean }> = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    ext: 'png',
    test: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  { mime: 'image/gif', ext: 'gif', test: (b) => b.subarray(0, 3).toString('latin1') === 'GIF' },
  {
    mime: 'image/webp',
    ext: 'webp',
    test: (b) => b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP'
  },
  {
    mime: 'application/pdf',
    ext: 'pdf',
    test: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-'
  },
];

function detectType(buffer: Buffer) {
  return IMAGE_SIGNATURES.find((sig) => sig.test(buffer));
}

const limit = rateLimit({
  scope: 'upload',
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Upload limit reached. Please try again later, or email your evidence to us.'
});

export async function POST(request: NextRequest) {
  try {
    const limited = limit(request);
    if (limited) return limited;

    const auth = await authenticateRequest(request);
    if (!auth.success && !consumeUploadGrant(request.headers.get('x-upload-grant'))) {
      return NextResponse.json(
        { success: false, error: 'Upload authorisation required. Request a grant first.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'File is empty' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'File is larger than 5MB.' }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectType(bytes);

    if (!detected) {
      return NextResponse.json(
        { success: false, error: 'Only images or PDF documents are accepted.' },
        { status: 415 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Upload service is not configured' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${apiSecret}`).digest('hex');

    // Re-wrap under a random name in a dedicated folder, using the type we
    // detected, so nothing arbitrary lands in the site's public asset folders.
    const safeName = `${crypto.randomBytes(12).toString('hex')}.${detected.ext}`;
    const outgoing = new FormData();
    outgoing.append('file', new Blob([bytes], { type: detected.mime }), safeName);
    outgoing.append('api_key', apiKey);
    outgoing.append('timestamp', timestamp);
    outgoing.append('signature', signature);
    outgoing.append('folder', 'solariem/evidence');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: outgoing
    });

    const data = await response.json();

    if (data.secure_url) {
      return NextResponse.json({ success: true, url: data.secure_url });
    }

    console.error('Cloudinary upload error:', data);
    return NextResponse.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 502 });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
