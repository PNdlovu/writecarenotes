/**
 * WriteCareNotes.com
 * @fileoverview Assessments Overview Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AssessmentList } from '@/features/assessments/components/assessment-list';
import { fetchAssessments } from '@/features/assessments/api/assessment-service';

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', searchQuery, selectedCategory],
    queryFn: () => fetchAssessments({ search: searchQuery, category: selectedCategory }),
  });

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
  };

  return (
    <AssessmentList
      assessments={assessments}
      isLoading={isLoading}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      onSearchChange={setSearchQuery}
      onCategoryChange={setSelectedCategory}
      onReset={handleReset}
    />
  );
} 