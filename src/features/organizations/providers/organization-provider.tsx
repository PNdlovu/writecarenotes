'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Organization } from '@/features/organizations/lib/organization.server'
import { OrganizationContext } from '@/features/organizations/lib/organization'

export function OrganizationProvider({
  children,
  initialOrganization,
}: {
  children: React.ReactNode
  initialOrganization?: Organization
}) {
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(
    initialOrganization || null
  )
  const [isLoading, setIsLoading] = useState(!initialOrganization)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchOrganization() {
      if (!session?.user) {
        setOrganization(null)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/organization')
        if (!response.ok) {
          throw new Error('Failed to fetch organization')
        }
        const data = await response.json()
        setOrganization(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialOrganization) {
      fetchOrganization()
    }
  }, [session, initialOrganization])

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        isLoading,
        error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}


