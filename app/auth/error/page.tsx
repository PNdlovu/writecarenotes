/**
 * WriteCareNotes.com
 * @fileoverview Auth Error Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button/Button'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          {error || 'An error occurred during authentication'}
        </p>
        <Button asChild>
          <Link href="/auth/signin">
            Try Again
          </Link>
        </Button>
      </div>
    </div>
  )
} 