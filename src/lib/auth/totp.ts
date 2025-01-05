import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// Configure authenticator
authenticator.options = {
  window: 1, // Allow 30 seconds before/after for time drift
  step: 30,  // 30-second time step
}

export interface GenerateTOTPSecretOptions {
  email: string
  organizationName: string
}

export interface TOTPSecretResponse {
  secret: string
  uri: string
  qrCodeDataUrl: string
}

/**
 * Generates a TOTP secret and QR code for 2FA setup
 * 
 * @param options - Configuration options
 * @returns Object containing secret, URI, and QR code data URL
 */
export async function generateTOTPSecret(
  options: GenerateTOTPSecretOptions
): Promise<TOTPSecretResponse> {
  // Generate a random secret
  const secret = authenticator.generateSecret()

  // Create an otpauth URL (used by authenticator apps)
  // Format: otpauth://totp/Label:Account?secret=SECRET&issuer=Issuer
  const uri = authenticator.keyuri(
    options.email,
    options.organizationName,
    secret
  )

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(uri, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  return {
    secret,
    uri,
    qrCodeDataUrl,
  }
}

/**
 * Verifies a TOTP token against a secret
 * 
 * @param token - The token to verify
 * @param secret - The secret to verify against
 * @returns boolean indicating if token is valid
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

/**
 * Generates a current TOTP token from a secret
 * Useful for testing or sending email/SMS codes
 * 
 * @param secret - The secret to generate a token from
 * @returns The current token
 */
export function generateCurrentToken(secret: string): string {
  return authenticator.generate(secret)
} 


