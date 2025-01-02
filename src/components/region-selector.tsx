/**
 * @writecarenotes.com
 * @fileoverview Enterprise-grade region and language selector component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive region and language selector that integrates with:
 * - App's i18n system for multi-language support
 * - Regional configuration for location-specific features
 * - Offline-first capabilities for region/language persistence
 */

'use client'

import { useRegion } from '@/hooks/use-region'
import { useTranslation } from '@/i18n'
import { REGIONAL_CONFIG, type Region } from '@/types/regional'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RegionSelector() {
  const { region, setRegion } = useRegion()
  const { t, i18n } = useTranslation()

  const handleRegionChange = (value: Region) => {
    setRegion(value)
    // Update language based on region's default language
    const defaultLang = REGIONAL_CONFIG[value].defaultLanguage
    i18n.changeLanguage(defaultLang)
  }

  return (
    <Select value={region} onValueChange={handleRegionChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('common.selectRegion')} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(REGIONAL_CONFIG).map(([key, config]) => (
          <SelectItem key={key} value={key as Region}>
            {t(`regions.${key}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}