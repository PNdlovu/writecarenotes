import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, from, cc, bcc, replyTo } = options;

  try {
    const result = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'noreply@writecarenotes.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
      ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
      ...(replyTo && { reply_to: replyTo }),
    });

    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export default resend 
