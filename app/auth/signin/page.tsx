/**
 * WriteCareNotes.com
 * @fileoverview Sign In Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { SignInForm } from '@/components/auth/SignInForm'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingFooter } from '@/components/marketing/Footer'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <MarketingNavbar />
      
      <main className="flex-1">
        <div className="container relative min-h-[calc(100vh-14rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
          <div className="mx-auto w-full sm:w-[450px]">
            <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100">
              <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back
                </p>
              </div>
              <SignInForm />
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
} 