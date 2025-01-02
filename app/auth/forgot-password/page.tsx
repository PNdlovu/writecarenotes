import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingFooter } from '@/components/marketing/Footer'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <MarketingNavbar />
      
      <main className="flex-1">
        <div className="container relative min-h-[calc(100vh-14rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
          <div className="mx-auto w-full sm:w-[450px]">
            <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100">
              <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Reset your password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>
              <ForgotPasswordForm />
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <a
                  href="/auth/signin"
                  className="text-[#34B5B5] hover:underline"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
