import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import { CarePlan } from '../types'

interface UseAccessibilityProps {
    onSave?: () => void
    onReview?: () => void
    onPrint?: () => void
}

export function useAccessibility({
    onSave,
    onReview,
    onPrint
}: UseAccessibilityProps = {}) {
    const { t } = useTranslation()

    // Keyboard shortcuts
    useHotkeys('ctrl+s', (e) => {
        e.preventDefault()
        onSave?.()
    }, { enableOnFormTags: true })

    useHotkeys('ctrl+r', (e) => {
        e.preventDefault()
        onReview?.()
    })

    useHotkeys('ctrl+p', (e) => {
        e.preventDefault()
        onPrint?.()
    })

    // Screen reader announcements
    const announceStatus = useCallback((carePlan: CarePlan) => {
        const announcement = t('carePlan.accessibility.screenReader.carePlanStatus', {
            status: t(`carePlan.status.${carePlan.status}`)
        })
        announceToScreenReader(announcement)
    }, [t])

    const announceRisk = useCallback((level: string) => {
        const announcement = t('carePlan.accessibility.screenReader.riskLevel', {
            level: level
        })
        announceToScreenReader(announcement)
    }, [t])

    const announceToScreenReader = (message: string) => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', 'polite')
        announcement.setAttribute('role', 'status')
        announcement.style.position = 'absolute'
        announcement.style.height = '1px'
        announcement.style.width = '1px'
        announcement.style.overflow = 'hidden'
        announcement.style.clip = 'rect(1px, 1px, 1px, 1px)'
        announcement.textContent = message
        document.body.appendChild(announcement)
        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 3000)
    }

    return {
        announceStatus,
        announceRisk,
        announceToScreenReader
    }
}

// Accessibility helper functions
export const getAriaLabel = (field: string, value: string) => `${field}: ${value}`

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const elements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    return Array.from(elements) as HTMLElement[]
}

export const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus()
                e.preventDefault()
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus()
                e.preventDefault()
            }
        }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
}

// ARIA roles and states
export const ariaRoles = {
    carePlan: 'article',
    section: 'region',
    navigation: 'navigation',
    button: 'button',
    dialog: 'dialog',
    alert: 'alert',
    status: 'status',
    tab: 'tab',
    tabPanel: 'tabpanel',
    list: 'list',
    listItem: 'listitem'
} as const

export const ariaStates = {
    selected: 'aria-selected',
    expanded: 'aria-expanded',
    pressed: 'aria-pressed',
    checked: 'aria-checked',
    hidden: 'aria-hidden',
    invalid: 'aria-invalid',
    required: 'aria-required',
    disabled: 'aria-disabled',
    busy: 'aria-busy'
} as const


