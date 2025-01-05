import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingFooter } from '@/components/marketing/Footer'

export default function ForgotPasswordConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <MarketingNavbar />
      
      <main className="flex-1">
        <div className="container relative min-h-[calc(100vh-14rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
          <div className="mx-auto w-full sm:w-[450px]">
            <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Check your email
                </h1>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent you a password reset link. Click the link in the email to reset your password.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  The link will expire in 1 hour. If you don&apos;t see the email, check your spam folder.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/auth/signin'}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
