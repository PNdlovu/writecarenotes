'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast/use-toast'

export default function SetupPending() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSettingUp, setIsSettingUp] = useState(false)

  useEffect(() => {
    // Check if user is verified but setup is pending
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/auth/status')
        const data = await response.json()
        
        if (!data.isVerified) {
          // If not verified, redirect to verify email page
          router.push('/auth/verify-email')
        }
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }

    checkStatus()
  }, [router])

  const handleSetup = async () => {
    setIsSettingUp(true)
    try {
      // Get the stored care home data
      const storedData = sessionStorage.getItem('pendingCareHomeData')
      if (!storedData) {
        throw new Error('Care home setup data not found. Please sign up again.')
      }

      const careHomeData = JSON.parse(storedData)

      // Create the care home
      const careHomeResponse = await fetch('/api/care-homes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careHomeData),
      })

      if (!careHomeResponse.ok) {
        throw new Error('Failed to create care home')
      }

      // Clear the stored data
      sessionStorage.removeItem('pendingCareHomeData')

      toast({
        title: "Setup complete!",
        description: "Your care home has been created successfully.",
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Something went wrong during setup",
        variant: "destructive",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            Your email has been verified. Let's finish setting up your care home.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full bg-[#34B5B5] hover:opacity-90"
            onClick={handleSetup}
            disabled={isSettingUp}
          >
            {isSettingUp ? "Setting up..." : "Complete Setup"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/auth/signin')}
          >
            Back to Sign In
          </Button>
        </div>
      </Card>
    </div>
  )
}
