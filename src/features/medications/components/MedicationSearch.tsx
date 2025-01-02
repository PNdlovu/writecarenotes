/**
 * @writecarenotes.com
 * @fileoverview Medication Search Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for searching medications with advanced filtering
 * and auto-complete capabilities.
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Search, Filter, X } from 'lucide-react';
import { useMedicationSearch } from '@/features/medications/hooks/useMedicationSearch';
import type { Medication } from '@/features/medications/types';

interface Props {
  onSelect?: (medication: Medication) => void;
  placeholder?: string;
}

export function MedicationSearch({ onSelect, placeholder = 'Search medications...' }: Props) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    form: '',
    route: '',
    controlled: false
  });

  const { 
    data: results,
    isLoading,
    error 
  } = useMedicationSearch(query, filters);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelect = (medication: Medication) => {
    if (onSelect) {
      onSelect(medication);
    }
    setQuery('');
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleSearch}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Form</label>
              <Input
                type="text"
                value={filters.form}
                onChange={e => handleFilterChange('form', e.target.value)}
                placeholder="e.g. Tablet"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Route</label>
              <Input
                type="text"
                value={filters.route}
                onChange={e => handleFilterChange('route', e.target.value)}
                placeholder="e.g. Oral"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Controlled</label>
              <input
                type="checkbox"
                checked={filters.controlled}
                onChange={e => handleFilterChange('controlled', e.target.checked)}
                className="ml-2"
              />
            </div>
          </div>
        </Card>
      )}

      {query && results && results.length > 0 && (
        <Card className="absolute w-full mt-1 z-10">
          <ul className="py-2">
            {results.map((medication, index) => (
              <li
                key={medication.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(medication)}
              >
                <div className="font-medium">{medication.name}</div>
                <div className="text-sm text-gray-500">
                  {medication.form} • {medication.strength}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isLoading && (
        <div className="text-center py-2 text-gray-500">
          Searching...
        </div>
      )}

      {error && (
        <div className="text-center py-2 text-red-500">
          Error searching medications
        </div>
      )}
    </div>
  );
} 