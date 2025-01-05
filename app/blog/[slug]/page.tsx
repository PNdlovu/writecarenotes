/**
 * @writecarenotes.com
 * @fileoverview Blog post detail page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Page component for displaying blog post details, comments, and
 * related content.
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Post } from '@/app/api/blog/types';
import { Badge } from '@/components/ui/Badge/Badge';
import { CommentList } from '@/features/blog/components/CommentList';
import { CommentForm } from '@/features/blog/components/CommentForm';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      type: 'article',
      authors: [post.author.name],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

// Get post data
async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            expertise: true,
          },
        },
        categories: true,
        comments: {
          where: {
            status: 'APPROVED',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Get related posts
async function getRelatedPosts(post: Post) {
  try {
    return await prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: 'PUBLISHED',
        OR: [
          { categories: { some: { id: { in: post.categories.map(c => c.id) } } } },
          { region: { hasSome: post.region } },
          { regulatoryBodies: { hasSome: post.regulatoryBodies } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: true,
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {/* Categories and Regions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map(category => (
            <Badge key={category.id} variant="primary">
              {category.name}
            </Badge>
          ))}
          {post.region.map(region => (
            <Badge key={region} variant="secondary">
              {region}
            </Badge>
          ))}
          {post.regulatoryBodies?.map(body => (
            <Badge key={body} variant="outline">
              {body}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          {post.title}
        </h1>

        {/* Author and Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="font-medium">
                {post.author.name}
              </div>
              <div className="text-sm text-gray-500">
                {post.author.expertise.join(', ')}
              </div>
            </div>
          </div>
          <div className="text-gray-500">
            {post.publishedAt?.toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments Section */}
      <section className="mt-12 pt-12 border-t">
        <CommentList
          comments={post.comments}
          postId={post.id}
        />
        <div className="mt-8">
          <CommentForm
            postId={post.id}
            onSubmit={async () => {}}
          />
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-6">
            Related Posts
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map(relatedPost => (
              <div
                key={relatedPost.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {relatedPost.featuredImage && (
                  <img
                    src={relatedPost.featuredImage}
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-2">
                    {relatedPost.title}
                  </h3>
                  <div className="text-sm text-gray-500">
                    By {relatedPost.author.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
} 