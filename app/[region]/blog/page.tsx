/**
 * @writecarenotes.com
 * @fileoverview Blog page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main blog page displaying a list of blog posts with filtering
 * and search capabilities.
 */

import React from 'react';
import { BlogList } from '@/features/blog/components/BlogList';
import { Card } from '@/components/ui/Card';

// This would typically come from your CMS or API
const posts = [
  {
    slug: 'understanding-cqc-ratings',
    title: 'Understanding CQC Ratings: A Guide for Care Home Residents and Families',
    author: 'Write Care Notes Team',
    date: '2024-03-21',
    category: 'Compliance',
    tags: ['CQC', 'Care Quality', 'Ratings', 'Care Homes', 'Compliance'],
    excerpt: 'A comprehensive guide to understanding how the Care Quality Commission (CQC) rates care homes and what these ratings mean for residents and families.'
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground">
            Insights and guides for care home management and compliance
          </p>
        </div>

        <Card className="p-6">
          <BlogList posts={posts} />
        </Card>
      </div>
    </div>
  );
} 