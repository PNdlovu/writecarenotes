import { usePathname } from 'next/navigation'

export function useRegion() {
  const pathname = usePathname()
  const region = pathname?.split('/')[1] || 'england'
  return region
}


