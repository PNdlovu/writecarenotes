'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BlogSearchProps {
  categories: string[];
  regions: string[];
  regulatoryBodies: string[];
}

export function BlogSearch({ categories, regions, regulatoryBodies }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  // Local state for form inputs
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [regulatory, setRegulatory] = useState(searchParams.get('regulatory') || '');

  // Handle search and filter changes
  const handleSearch = (value: string) => {
    setSearch(value);
    updateUrl({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateUrl({ category: value });
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    updateUrl({ region: value });
  };

  const handleRegulatoryChange = (value: string) => {
    setRegulatory(value);
    updateUrl({ regulatory: value });
  };

  // Update URL with search params
  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/blog?${newParams.toString()}`);
  };

  // Fetch posts when search params change
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(search && { search }),
          ...(category && { category }),
          ...(region && { region }),
          ...(regulatory && { regulatory })
        });

        const response = await fetch(`/api/posts?${params}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [search, category, region, regulatory]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
        />
        <select 
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="">All Regions</option>
          {regions.map((reg) => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>
        <select
          value={regulatory}
          onChange={(e) => handleRegulatoryChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="">All Regulatory Bodies</option>
          {regulatoryBodies.map((reg) => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600">
          No posts found
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
              {/* Post content */}
            </div>
          ))}
        </div>
      )}
    </>
  );
} 