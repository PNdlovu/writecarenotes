'use client';

import { useTranslation } from 'next-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AssessmentCard } from './assessment-card';
import type { Assessment } from '../types';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface AssessmentListProps {
  assessments?: Assessment[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export function AssessmentList({
  assessments,
  isLoading,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onReset,
}: AssessmentListProps) {
  const { t } = useTranslation('assessments');
  const router = useRouter();

  const handleNewAssessment = () => {
    router.push('/assessments/new');
  };

  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    
    return assessments.filter(assessment => {
      const matchesSearch = assessment.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assessment.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || assessment.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [assessments, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <Button onClick={handleNewAssessment}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('newAssessment')}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>{selectedCategory}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">{t('allCategories')}</SelectItem>
            <SelectItem value="Care Needs">{t('categories.careNeeds')}</SelectItem>
            <SelectItem value="Mental Health">{t('categories.mentalHealth')}</SelectItem>
            <SelectItem value="Physical Health">{t('categories.physicalHealth')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onReset}>
          {t('filter')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
