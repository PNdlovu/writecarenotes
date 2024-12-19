import * as z from 'zod'

const passwordRegex = {
  number: /\d/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  special: /[^A-Za-z0-9]/,
}

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpCode: z.string().optional(),
})

export const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex.number, 'Password must contain at least one number')
    .regex(passwordRegex.uppercase, 'Password must contain at least one uppercase letter')
    .regex(passwordRegex.lowercase, 'Password must contain at least one lowercase letter')
    .regex(passwordRegex.special, 'Password must contain at least one special character'),
  organizationName: z.string().min(2, 'Care home name must be at least 2 characters'),
  organizationType: z.enum(['CARE_HOME', 'DOMICILIARY', 'NURSING_HOME']),
  region: z.enum(['ENGLAND', 'WALES', 'SCOTLAND', 'NORTHERN_IRELAND', 'IRELAND']),
  enable2FA: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  preferredAuthMethod: z.enum(['EMAIL', 'SMS', 'AUTHENTICATOR_APP']).optional(),
})

export const setup2FASchema = z.object({
  userId: z.string(),
  authMethod: z.enum(['EMAIL', 'SMS', 'AUTHENTICATOR_APP']),
  phoneNumber: z.string().optional(),
})

export const verify2FASchema = z.object({
  userId: z.string(),
  code: z.string(),
  method: z.enum(['EMAIL', 'SMS', 'AUTHENTICATOR_APP']),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex.number, 'Password must contain at least one number')
    .regex(passwordRegex.uppercase, 'Password must contain at least one uppercase letter')
    .regex(passwordRegex.lowercase, 'Password must contain at least one lowercase letter')
    .regex(passwordRegex.special, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type Setup2FAFormData = z.infer<typeof setup2FASchema>
export type Verify2FAFormData = z.infer<typeof verify2FASchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type NewPasswordFormData = z.infer<typeof newPasswordSchema> 


