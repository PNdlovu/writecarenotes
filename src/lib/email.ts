import { Resend } from 'resend'
import { env } from '@/env.mjs'

const resend = new Resend(env.RESEND_API_KEY)

const emailTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Care Home Management System</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #0070f3;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border: 1px solid #eaeaea;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Care Home Management System</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Care Home Management System. All rights reserved.</p>
          <p>This email was sent securely from our care management platform.</p>
        </div>
      </div>
    </body>
  </html>
`

export async function sendVerificationEmail({
  email,
  token,
  name,
}: {
  email: string
  token: string
  name: string
}) {
  const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`

  const content = `
    <h2>Welcome to Your Care Home Management Platform</h2>
    <p>Dear ${name},</p>
    <p>Thank you for choosing our platform to manage your care home operations. To ensure the security of your account and comply with data protection regulations, please verify your email address.</p>
    <p>
      <a href="${confirmLink}" class="button">Verify Email Address</a>
    </p>
    <p><strong>Important Security Information:</strong></p>
    <ul>
      <li>This link will expire in 24 hours</li>
      <li>If you didn't create this account, please ignore this email</li>
      <li>Never share your login credentials with anyone</li>
    </ul>
    <p>Need help? Contact our support team for assistance.</p>
  `

  await resend.emails.send({
    from: 'Care Home Management <noreply@writecarenotes.com>',
    to: email,
    subject: 'Verify Your Care Home Management Account',
    html: emailTemplate(content),
  })
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string
  token: string
}) {
  const resetLink = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`

  const content = `
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password for your Care Home Management account.</p>
    <p>
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p><strong>Security Notice:</strong></p>
    <ul>
      <li>This link will expire in 1 hour</li>
      <li>If you didn't request this reset, please contact support immediately</li>
      <li>For security, use a strong password that you haven't used before</li>
    </ul>
    <p>If you're having trouble, our support team is here to help.</p>
  `

  await resend.emails.send({
    from: 'Care Home Management <noreply@writecarenotes.com>',
    to: email,
    subject: 'Reset Your Care Home Management Password',
    html: emailTemplate(content),
  })
}

export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  const content = `
    <h2>Welcome to Your Care Home Management Platform</h2>
    <p>Dear ${name},</p>
    <p>Thank you for verifying your email address. Your account is now active and ready to use!</p>
    <h3>Getting Started</h3>
    <ul>
      <li>Complete your care home profile</li>
      <li>Set up your staff accounts</li>
      <li>Configure your care home settings</li>
      <li>Review our compliance guidelines</li>
    </ul>
    <p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
    </p>
    <p><strong>Need Help?</strong></p>
    <p>Our support team is available to assist you with:</p>
    <ul>
      <li>Platform navigation</li>
      <li>Staff management</li>
      <li>Compliance requirements</li>
      <li>Technical support</li>
    </ul>
    <p>Contact us anytime at support@writecarenotes.com</p>
  `

  await resend.emails.send({
    from: 'Care Home Management <noreply@writecarenotes.com>',
    to: email,
    subject: 'Welcome to Your Care Home Management Platform',
    html: emailTemplate(content),
  })
}

export async function send2FACode({
  email,
  code,
  name,
}: {
  email: string
  code: string
  name: string
}) {
  const content = `
    <h2>Your Two-Factor Authentication Code</h2>
    <p>Dear ${name},</p>
    <p>You requested a two-factor authentication code. Use the following code to complete your sign-in:</p>
    <div style="text-align: center; margin: 30px 0;">
      <h1 style="font-size: 36px; letter-spacing: 5px; font-family: monospace;">${code}</h1>
    </div>
    <p><strong>Security Notice:</strong></p>
    <ul>
      <li>This code will expire in 10 minutes</li>
      <li>Never share this code with anyone</li>
      <li>Our staff will never ask for this code</li>
    </ul>
    <p>If you didn't request this code, please secure your account and contact support immediately.</p>
  `

  await resend.emails.send({
    from: 'Care Home Management <noreply@writecarenotes.com>',
    to: email,
    subject: 'Your Security Code - Care Home Management',
    html: emailTemplate(content),
  })
} 


