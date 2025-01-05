import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button/Button"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select/Select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/Badge/Badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { FilterIcon, XIcon } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useDebounce } from '@/hooks/useDebounce'

interface ComplianceFilters {
  search: string
  status: string[]
  category: string[]
  riskLevel: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  assignedTo: string[]
}

interface ComplianceFiltersProps {
  onFiltersChange: (filters: ComplianceFilters) => void
}

export function ComplianceFilters({ onFiltersChange }: ComplianceFiltersProps) {
  const t = useTranslations('compliance.filters')
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ComplianceFilters>({
    search: '',
    status: [],
    category: [],
    riskLevel: [],
    dateRange: {
      start: null,
      end: null
    },
    assignedTo: []
  })

  const debouncedSearch = useDebounce(filters.search, 300)

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch, filters, onFiltersChange])

  const handleFilterChange = (key: keyof ComplianceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      category: [],
      riskLevel: [],
      dateRange: {
        start: null,
        end: null
      },
      assignedTo: []
    })
  }

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search' && value) return count + 1
    if (key === 'dateRange' && (value.start || value.end)) return count + 1
    if (Array.isArray(value) && value.length > 0) return count + 1
    return count
  }, 0)

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder={t('searchPlaceholder')}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            {t('filters')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('filterTitle')}</SheetTitle>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('status')}</Label>
              <Select
                value={filters.status[0] || ''}
                onValueChange={(value) => handleFilterChange('status', [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">{t('compliant')}</SelectItem>
                  <SelectItem value="partially">{t('partiallyCompliant')}</SelectItem>
                  <SelectItem value="non-compliant">{t('nonCompliant')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('dateRange')}</Label>
              <div className="grid gap-2">
                <DatePicker
                  selected={filters.dateRange.start}
                  onSelect={(date) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: date
                    })
                  }
                  placeholderText={t('startDate')}
                />
                <DatePicker
                  selected={filters.dateRange.end}
                  onSelect={(date) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: date
                    })
                  }
                  placeholderText={t('endDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('riskLevel')}</Label>
              <Select
                value={filters.riskLevel[0] || ''}
                onValueChange={(value) => handleFilterChange('riskLevel', [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRiskLevel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('high')}</SelectItem>
                  <SelectItem value="medium">{t('medium')}</SelectItem>
                  <SelectItem value="low">{t('low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              {t('clearFilters')}
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              {t('applyFilters')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
