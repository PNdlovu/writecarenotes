'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ClinicalSafetyProvider } from '../medications/safety/ClinicalSafetyProvider'

interface SessionProviderProps {
  children: React.ReactNode
  session?: any
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      <ClinicalSafetyProvider>
        {children}
      </ClinicalSafetyProvider>
    </NextAuthSessionProvider>
  )
}


