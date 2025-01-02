/**
 * @writecarenotes.com
 * @fileoverview Blog Post List Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a list of blog posts with filtering and pagination
 */

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Post, CategoryType, Region, RegulatoryBody } from '@/features/blog/types';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useLocalization } from '@/hooks/useLocalization';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Form/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

interface PostListProps {
  initialPosts?: Post[];
}

export function PostList({ initialPosts = [] }: PostListProps) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = React.useState<Post[]>(initialPosts);
  const [page, setPage] = React.useState(Number(searchParams.get('page')) || 1);
  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [category, setCategory] = React.useState<CategoryType | string>(
    searchParams.get('category') || 'all'
  );
  const [region, setRegion] = React.useState<Region | string>(
    searchParams.get('region') || 'all'
  );
  const [regulatoryBody, setRegulatoryBody] = React.useState<RegulatoryBody | string>(
    searchParams.get('regulatory') || 'all'
  );

  const { data, isLoading, saveLocally } = useOfflineSync<Post[]>({
    key: 'blog-posts',
    initialData: initialPosts,
  });

  const { formatDate } = useLocalization(
    region === 'all' ? Region.ENGLAND : region as Region
  );

  React.useEffect(() => {
    if (data) {
      setPosts(data);
    }
  }, [data]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || post.categories.some(cat => cat === category);
    const matchesRegion = region === 'all' || post.regions.includes(region as Region);
    const matchesRegBody = regulatoryBody === 'all' || post.regulatoryBodies.includes(regulatoryBody as RegulatoryBody);
    return matchesSearch && matchesCategory && matchesRegion && matchesRegBody;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Input
          type="search"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-72"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.values(CategoryType) as CategoryType[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {(Object.values(Region) as Region[]).map((reg) => (
              <SelectItem key={reg} value={reg}>
                {reg.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={regulatoryBody} onValueChange={setRegulatoryBody}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="All Regulatory Bodies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regulatory Bodies</SelectItem>
            {(Object.values(RegulatoryBody) as RegulatoryBody[]).map((body) => (
              <SelectItem key={body} value={body}>
                {body.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center">Loading posts...</div>
      ) : paginatedPosts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <PostCard key={post.id} post={post} formatDate={formatDate} />
          ))}
        </div>
      ) : (
        <div className="text-center">No posts found</div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
} 