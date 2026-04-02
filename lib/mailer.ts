/**
 * Email sending stub.
 *
 * In development (or when no email provider is configured) the reset link is
 * logged to the console. To wire up a real provider, replace the body of
 * `sendPasswordResetEmail` with your preferred SDK call (Resend, SendGrid,
 * nodemailer, etc.).
 */

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[mailer] Password reset link for ${to}: ${resetUrl}`)
    return
  }

  // TODO: replace with a real email provider.
  // Example using Resend:
  //   const resend = new Resend(process.env.RESEND_API_KEY)
  //   await resend.emails.send({
  //     from: 'noreply@your-domain.com',
  //     to,
  //     subject: 'Reset your password',
  //     html: `<p>Click the link below to reset your password (valid for 1 hour):</p>
  //            <p><a href="${resetUrl}">${resetUrl}</a></p>`,
  //   })
  console.warn('[mailer] No email provider configured. Reset link:', resetUrl)
}
