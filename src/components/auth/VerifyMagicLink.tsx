/**
 * WriteCareNotes.com
 * @fileoverview Magic Link Verification Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function VerifyMagicLink() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        toast({
          title: 'Error',
          description: 'Invalid or missing token.',
          variant: 'destructive',
        })
        router.push('/signin')
        return
      }

      try {
        // TODO: Implement token verification logic
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated delay
        toast({
          title: 'Success',
          description: 'You have been signed in successfully.',
        })
        router.push('/dashboard')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify magic link. Please try again.',
          variant: 'destructive',
        })
        router.push('/signin')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [router, searchParams, toast])

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Verifying your magic link...
        </p>
      </div>
    )
  }

  return null
} 