'use client';

import React, { Suspense } from 'react';
import { PostList } from '@/features/blog/components/PostList';
import { CategoryType, Region, RegulatoryBody } from '@/features/blog/types';
import { ErrorBoundary } from '@/error/components/ErrorBoundary';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    category?: CategoryType;
    region?: Region;
    regulatory?: RegulatoryBody;
  };
}

// Loading component
function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="mb-12 text-center">
        <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Error component
function BlogError({ error }: { error: Error }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Blog
        </h1>
        <p className="text-gray-600 mb-4">
          We're having trouble loading the blog posts. Please try again later.
        </p>
        <p className="text-sm text-gray-500">
          Error: {error.message}
        </p>
      </div>
    </div>
  );
}

export default function BlogPage({ searchParams }: PageProps) {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const page = Number(searchParams.page) || 1;
        const limit = 12;

        const response = await fetch('/api/posts?' + new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...searchParams
        }));

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [searchParams]);

  return (
    <ErrorBoundary fallback={BlogError}>
      <Suspense fallback={<BlogLoading />}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Care Home Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest care home regulations, best practices,
              and industry insights.
            </p>
          </header>

          {/* Post List */}
          {isLoading ? (
            <BlogLoading />
          ) : (
            <PostList initialPosts={posts} />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
} 