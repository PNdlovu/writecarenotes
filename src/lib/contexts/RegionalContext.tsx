import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo
} from 'react'
import { useSession } from 'next-auth/react'
import { notifications } from '@/config/notifications'
import { thresholds } from '@/config/thresholds'

type RegionType = 'CQC' | 'HIQA' | 'CI' | 'RQIA' | 'CSI'

interface RegionalSettings {
  region: RegionType
  language: string
  currency: string
  timezone: string
  dateFormat: string
  measurementSystem: 'metric' | 'imperial'
  regulatoryBody: {
    name: string
    website: string
    contact: {
      phone: string
      email: string
      address: string
    }
    reportingRequirements: {
      type: string
      frequency: string
      deadline: string
      format: string
    }[]
  }
  localAuthority: {
    name: string
    jurisdiction: string
    requirements: string[]
    contact: {
      department: string
      phone: string
      email: string
    }
  }
}

interface RegionalFeatures {
  [key: string]: {
    enabled: boolean
    config?: Record<string, any>
    requirements?: string[]
    restrictions?: string[]
  }
}

interface RegionalValidation {
  rules: {
    category: string
    criteria: string[]
    thresholds: Record<string, number>
    validations: ((value: any) => boolean)[]
  }[]
  customValidators: Record<string, (data: any) => Promise<boolean>>
}

interface RegionalContextType {
  settings: RegionalSettings
  features: RegionalFeatures
  validation: RegionalValidation
  updateSettings: (settings: Partial<RegionalSettings>) => Promise<boolean>
  getRegionalRequirements: (category: string) => Promise<any>
  validateRegionalCompliance: (data: any) => Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
    recommendations: string[]
  }>
  formatRegionalValue: (value: number | string, type: string) => string
  isRegionalFeatureEnabled: (feature: string) => boolean
  getRegionalThresholds: (category: string) => Record<string, number>
  getRegionalNotifications: (type: string) => any
  translateRegionalContent: (content: string, targetLanguage?: string) => Promise<string>
}

const defaultSettings: RegionalSettings = {
  region: 'CQC',
  language: 'en-GB',
  currency: 'GBP',
  timezone: 'Europe/London',
  dateFormat: 'dd/MM/yyyy',
  measurementSystem: 'metric',
  regulatoryBody: {
    name: 'Care Quality Commission',
    website: 'https://www.cqc.org.uk',
    contact: {
      phone: '03000 616161',
      email: 'enquiries@cqc.org.uk',
      address: '151 Buckingham Palace Road, London, SW1W 9SZ'
    },
    reportingRequirements: [
      {
        type: 'Statutory Notifications',
        frequency: 'As needed',
        deadline: 'Within 24 hours',
        format: 'Online form'
      }
    ]
  },
  localAuthority: {
    name: 'Default Local Authority',
    jurisdiction: 'Local Area',
    requirements: ['Local registration', 'Safety compliance'],
    contact: {
      department: 'Adult Social Care',
      phone: '020 0000 0000',
      email: 'care@localauthority.gov.uk'
    }
  }
}

const RegionalContext = createContext<RegionalContextType | undefined>(undefined)

export function RegionalProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<RegionalSettings>(defaultSettings)
  const [features, setFeatures] = useState<RegionalFeatures>({})
  const [validation, setValidation] = useState<RegionalValidation>({
    rules: [],
    customValidators: {}
  })

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/regional/settings')
      if (!response.ok) throw new Error('Failed to load regional settings')
      const data = await response.json()
      setSettings(data)

      // Load features for the region
      const featuresResponse = await fetch(`/api/regional/features/${data.region}`)
      if (featuresResponse.ok) {
        const featuresData = await featuresResponse.json()
        setFeatures(featuresData)
      }

      // Load validation rules
      const validationResponse = await fetch(`/api/regional/validation/${data.region}`)
      if (validationResponse.ok) {
        const validationData = await validationResponse.json()
        setValidation(validationData)
      }
    } catch (error) {
      console.error('Error loading regional settings:', error)
    }
  }, [])

  // Update settings with validation
  const updateSettings = useCallback(async (
    newSettings: Partial<RegionalSettings>
  ): Promise<boolean> => {
    try {
      // Validate changes against regional requirements
      const validationResponse = await fetch('/api/regional/validate-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      if (!validationResponse.ok) {
        throw new Error('Settings validation failed')
      }

      // Apply changes
      const response = await fetch('/api/regional/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) throw new Error('Failed to update regional settings')
      const updatedSettings = await response.json()
      setSettings(updatedSettings)

      // Reload features if region changed
      if (newSettings.region && newSettings.region !== settings.region) {
        const featuresResponse = await fetch(`/api/regional/features/${newSettings.region}`)
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setFeatures(featuresData)
        }
      }

      return true
    } catch (error) {
      console.error('Error updating regional settings:', error)
      return false
    }
  }, [settings.region])

  // Get regional requirements with caching
  const getRegionalRequirements = useCallback(async (category: string) => {
    const cacheKey = `regional_requirements_${settings.region}_${category}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    try {
      const response = await fetch(
        `/api/regional/requirements/${settings.region}/${category}`
      )
      if (!response.ok) throw new Error('Failed to fetch regional requirements')
      const data = await response.json()
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
      return data
    } catch (error) {
      console.error('Error fetching regional requirements:', error)
      return null
    }
  }, [settings.region])

  // Enhanced compliance validation
  const validateRegionalCompliance = useCallback(async (data: any) => {
    try {
      // Apply standard validation rules
      const errors: string[] = []
      const warnings: string[] = []
      const recommendations: string[] = []

      for (const rule of validation.rules) {
        const value = data[rule.category]
        if (!value) continue

        // Check against thresholds
        Object.entries(rule.thresholds).forEach(([level, threshold]) => {
          if (typeof value === 'number') {
            if (level === 'critical' && value < threshold) {
              errors.push(`${rule.category} below critical threshold`)
            } else if (level === 'warning' && value < threshold) {
              warnings.push(`${rule.category} below warning threshold`)
            }
          }
        })

        // Run custom validations
        rule.validations.forEach(validate => {
          if (!validate(value)) {
            errors.push(`${rule.category} failed validation`)
          }
        })
      }

      // Run custom validators
      const customValidations = await Promise.all(
        Object.entries(validation.customValidators).map(async ([key, validator]) => {
          try {
            return await validator(data)
          } catch (error) {
            errors.push(`Custom validation '${key}' failed`)
            return false
          }
        })
      )

      const valid = errors.length === 0 && customValidations.every(result => result)

      // Generate recommendations
      if (warnings.length > 0) {
        recommendations.push('Review and update compliance documentation')
        recommendations.push('Schedule internal audit')
      }

      return {
        valid,
        errors,
        warnings,
        recommendations
      }
    } catch (error) {
      console.error('Error validating regional compliance:', error)
      return {
        valid: false,
        errors: ['Validation process failed'],
        warnings: [],
        recommendations: ['Contact support for assistance']
      }
    }
  }, [validation])

  // Enhanced value formatting
  const formatRegionalValue = useCallback((
    value: number | string,
    type: string
  ): string => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat(settings.language, {
          style: 'currency',
          currency: settings.currency
        }).format(Number(value))

      case 'date':
        return new Intl.DateTimeFormat(settings.language, {
          dateStyle: 'full',
          timeZone: settings.timezone
        }).format(new Date(value))

      case 'measurement':
        if (settings.measurementSystem === 'imperial') {
          // Convert metric to imperial
          return `${(Number(value) * 2.20462).toFixed(2)} lbs`
        }
        return `${value} kg`

      case 'percentage':
        return new Intl.NumberFormat(settings.language, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(Number(value) / 100)

      default:
        return String(value)
    }
  }, [settings])

  // Check if regional feature is enabled with configuration
  const isRegionalFeatureEnabled = useCallback((feature: string): boolean => {
    return features[feature]?.enabled ?? false
  }, [features])

  // Get regional thresholds
  const getRegionalThresholds = useCallback((category: string) => {
    return thresholds[category as keyof typeof thresholds] || {}
  }, [])

  // Get regional notifications
  const getRegionalNotifications = useCallback((type: string) => {
    return notifications.compliance.regulatory[
      settings.region.toLowerCase() as keyof typeof notifications.compliance.regulatory
    ]?.[type as keyof typeof notifications.compliance.regulatory[keyof typeof notifications.compliance.regulatory]]
  }, [settings.region])

  // Translate regional content
  const translateRegionalContent = useCallback(async (
    content: string,
    targetLanguage?: string
  ): Promise<string> => {
    try {
      const response = await fetch('/api/regional/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          source: settings.language,
          target: targetLanguage || settings.language
        }),
      })
      if (!response.ok) throw new Error('Translation failed')
      const { translated } = await response.json()
      return translated
    } catch (error) {
      console.error('Translation error:', error)
      return content
    }
  }, [settings.language])

  // Memoized context value
  const value = useMemo(() => ({
    settings,
    features,
    validation,
    updateSettings,
    getRegionalRequirements,
    validateRegionalCompliance,
    formatRegionalValue,
    isRegionalFeatureEnabled,
    getRegionalThresholds,
    getRegionalNotifications,
    translateRegionalContent,
  }), [
    settings,
    features,
    validation,
    updateSettings,
    getRegionalRequirements,
    validateRegionalCompliance,
    formatRegionalValue,
    isRegionalFeatureEnabled,
    getRegionalThresholds,
    getRegionalNotifications,
    translateRegionalContent,
  ])

  // Load settings on session change
  useEffect(() => {
    if (session) {
      loadSettings()
    }
  }, [session, loadSettings])

  return (
    <RegionalContext.Provider value={value}>
      {children}
    </RegionalContext.Provider>
  )
}

export function useRegional() {
  const context = useContext(RegionalContext)
  if (context === undefined) {
    throw new Error('useRegional must be used within a RegionalProvider')
  }
  return context
} 


