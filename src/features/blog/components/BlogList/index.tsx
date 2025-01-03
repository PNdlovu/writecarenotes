/**
 * @writecarenotes.com
 * @fileoverview Blog list component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a list of blog posts with filtering
 * by category and search functionality.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface BlogPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
}

interface BlogListProps {
  posts: BlogPost[];
  category?: string;
}

export function BlogList({ posts, category }: BlogListProps) {
  const filteredPosts = category 
    ? posts.filter(post => post.category === category)
    : posts;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredPosts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`}>
          <Card className="h-full p-6 hover:bg-accent/5 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge>{post.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(post.date), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="mt-auto">
                <div className="text-sm">By {post.author}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 