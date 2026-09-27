/* eslint-disable */
/**
 * Verify the configured SMTP credentials, and optionally send a real message.
 *
 *   node scripts/test-email.js          # verify only, sends nothing
 *   node scripts/test-email.js --send   # also send a test message to the mailbox
 *
 * Runs in two stages on purpose. `verify()` calls transporter.verify(), which
 * performs the full TLS handshake and AUTH exchange without delivering
 * anything, so a broken credential is reported immediately without putting a
 * test message in a real inbox. Only then does --send deliver anything.
 */
const nodemailer = require('nodemailer');

import('./load-env.mjs').then(async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  // See the note in src/lib/email.ts: Google shows app passwords in four groups
  // of four, and pasting them as displayed must still authenticate.
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : rawPass;
  const from = process.env.EMAIL_FROM || `"Solariem" <${user}>`;
  const wantsSend = process.argv.includes('--send');

  console.log('Host      :', host);
  console.log('Port      :', port, port === 465 ? '(implicit SSL)' : '(STARTTLS)');
  console.log('User      :', user);
  console.log('Pass      :', pass ? `set, ${pass.length} chars` : 'MISSING');
  console.log('From      :', from);
  console.log('');

  if (!user || !pass) {
    console.error('Missing SMTP_USER or SMTP_PASS. Check .env.local.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    const ok = await transporter.verify();
    console.log('AUTH OK —', ok);
  } catch (error) {
    console.error('AUTH FAILED:', error.message);
    if (/535|invalid|auth/i.test(error.message)) {
      console.error('');
      console.error('Most likely causes:');
      console.error('  - the app password has spaces in it (this script strips them, so not this)');
      console.error('  - 2-Step Verification is not enabled on the Google Account');
      console.error('  - the app password was revoked at myaccount.google.com/apppasswords');
      console.error('  - SMTP_USER is the wrong account');
    }
    process.exit(1);
  }

  if (!wantsSend) {
    console.log('\nCredentials verified. Nothing sent. Pass --send to deliver a test message.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: 'Solariem — SMTP test',
      text: "This is a test message from Solariem's mailer. If you received it, sending works.",
      html: "<p>This is a test message from Solariem's mailer. If you received it, sending works.</p>",
    });
    console.log('\nSent:', info.messageId);
    console.log('Accepted:', info.accepted?.join(', ') || '(none reported)');
    console.log('Rejected:', info.rejected?.join(', ') || '(none)');
  } catch (error) {
    console.error('\nSEND FAILED:', error.message);
    process.exit(1);
  }
});
