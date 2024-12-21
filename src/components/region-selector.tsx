/**
 * @fileoverview Region Selector Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * A dropdown component for selecting the operating region of the application
 */

'use client'

import { useRegion } from '@/hooks/use-region'
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

  return (
    <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select region" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(REGIONAL_CONFIG).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            {config.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 