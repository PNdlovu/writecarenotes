/**
 * WriteCareNotes.com
 * @fileoverview Authentication Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { SignInFormData, SignUpFormData, MagicLinkFormData } from '../validations/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn({ email, password, region }: SignInFormData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)

    // Verify user's region access
    const { data: profile } = await supabase
      .from('profiles')
      .select('region, role, organization_id')
      .eq('id', data.user.id)
      .single()

    if (profile?.region !== region) {
      await this.signOut()
      throw new Error('You do not have access to this region')
    }

    return {
      user: data.user,
      profile,
    }
  }

  /**
   * Sign up new user and organization
   */
  async signUp(formData: SignUpFormData) {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    })

    if (error) throw new Error(error.message)
    if (!user) throw new Error('Failed to create user')

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: formData.organization,
        region: formData.region,
      })
      .select()
      .single()

    if (orgError) throw new Error(orgError.message)

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        organization_id: org.id,
        region: formData.region,
        role: 'ADMIN',
      })

    if (profileError) throw new Error(profileError.message)

    return { user, organization: org }
  }

  /**
   * Send magic link email
   */
  async sendMagicLink({ email, region }: MagicLinkFormData) {
    // Verify user exists and has access to region
    const { data: profile } = await supabase
      .from('profiles')
      .select('region')
      .eq('email', email)
      .single()

    if (!profile) throw new Error('No account found with this email')
    if (profile.region !== region) throw new Error('You do not have access to this region')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-magic-link`,
      },
    })

    if (error) throw new Error(error.message)
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink',
    })

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Sign out user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return session
  }

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw new Error(error.message)
    return user
  }

  /**
   * Update user password
   */
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }
} 