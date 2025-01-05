import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMobileOptimized } from '../hooks/useMobileOptimized'

interface MobileContextType {
  isOffline: boolean
  isInstallable: boolean
  installPrompt: () => Promise<void>
  vibrate: (pattern: number | number[]) => void
  shareContent: (data: ShareData) => Promise<void>
}

const MobileContext = createContext<MobileContextType>({
  isOffline: false,
  isInstallable: false,
  installPrompt: async () => {},
  vibrate: () => {},
  shareContent: async () => {},
})

export const useMobileContext = () => useContext(MobileContext)

interface MobileProviderProps {
  children: React.ReactNode
}

export function MobileProvider({ children }: MobileProviderProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const { isMobile } = useMobileOptimized()

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(pattern)
    }
  }

  const shareContent = async (data: ShareData) => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share(data)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing content:', error)
        }
      }
    }
  }

  return (
    <MobileContext.Provider
      value={{
        isOffline,
        isInstallable: !!deferredPrompt,
        installPrompt,
        vibrate,
        shareContent,
      }}
    >
      {children}
    </MobileContext.Provider>
  )
}


