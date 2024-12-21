/**
 * WriteCareNotes.com
 * @fileoverview Magic Link Verification Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/icons'

export default function VerifyMagicLinkPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const { verifyMagicLink } = useAuth()

  useEffect(() => {
    async function verifyToken() {
      try {
        const token = searchParams.get('token')
        if (!token) {
          throw new Error('No verification token found')
        }
        await verifyMagicLink(token)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to verify magic link')
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, verifyMagicLink])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verifying magic link</CardTitle>
          <CardDescription>
            Please wait while we verify your magic link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                Successfully verified! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 