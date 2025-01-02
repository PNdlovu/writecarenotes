'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    const verifyEmail = async () => {
      setIsVerifying(true)
      try {
        // Verify the email
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify email')
        }

        // Check if we have pending setup data
        const hasPendingSetup = sessionStorage.getItem('pendingCareHomeData')

        toast({
          title: "Email verified!",
          description: hasPendingSetup 
            ? "Let's complete your care home setup."
            : "Your email has been verified. You can now sign in.",
        })

        // Redirect based on whether we have pending setup
        if (hasPendingSetup) {
          router.push('/auth/setup-pending')
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        toast({
          title: "Verification failed",
          description: error instanceof Error ? error.message : "Something went wrong during verification",
          variant: "destructive",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, router, toast])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Email
          </h1>
          {!searchParams.get('token') ? (
            <>
              <p className="text-sm text-muted-foreground">
                We've sent you a verification email. Please check your inbox and click the verification link.
              </p>
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/auth/signin')}
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isVerifying 
                ? "Verifying your email..." 
                : "Verification complete! You can now sign in."}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
