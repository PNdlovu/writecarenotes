'use client';

/**
 * @writecarenotes.com
 * @fileoverview Blog post card component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Card component for displaying blog post previews with responsive
 * images, category tags, and regional indicators.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/features/blog/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';

interface PostCardProps {
  post: Post;
  formatDate: (date: Date | string) => string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, formatDate }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured Image */}
        <div className="relative h-48 bg-gray-100">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Region Badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {post.regions.map(region => (
              <Badge
                key={region}
                variant="secondary"
                className="text-xs"
              >
                {region}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-2">
            {post.categories.map(category => (
              <Badge
                key={category.id}
                variant="primary"
                className="text-xs"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-600">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.content.slice(0, 150)}...
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{post.author.name}</span>
            </div>

            {/* Date */}
            <time dateTime={post.publishedAt?.toISOString()}>
              {formatDate(post.publishedAt || new Date())}
            </time>
          </div>

          {/* Regulatory Bodies */}
          {post.regulatoryBodies && post.regulatoryBodies.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {post.regulatoryBodies.map(body => (
                  <Badge
                    key={body}
                    variant="outline"
                    className="text-xs"
                  >
                    {body}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}; 