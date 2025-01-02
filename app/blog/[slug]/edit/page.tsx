/**
 * @writecarenotes.com
 * @fileoverview Blog post edit page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Page component for editing existing blog posts with rich text editing,
 * image uploads, and validation.
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PostForm } from '@/features/blog/components/PostForm';

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
    title: `Edit: ${post.title} - Write Care Notes`,
    description: `Edit blog post: ${post.title}`,
  };
}

// Get post data
async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: {
        slug,
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
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function EditPostPage({ params }: PageProps) {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/blog/${params.slug}/edit`);
  }

  // Get post data
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Check authorization
  const isAuthor = post.author.id === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  const isEditor = session.user.role === 'EDITOR';

  if (!isAuthor && !isAdmin && !isEditor) {
    redirect(`/blog/${params.slug}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Edit Blog Post
        </h1>
        <p className="text-gray-600 mt-2">
          Make changes to your blog post and save when ready.
        </p>
      </header>

      {/* Post Form */}
      <PostForm
        post={post}
        onSubmit={async (data) => {
          'use server';
          
          try {
            const response = await fetch('/api/blog', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...data,
                id: post.id,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to update post');
            }

            const updatedPost = await response.json();
            redirect(`/blog/${updatedPost.slug}`);
          } catch (error) {
            console.error('Error updating post:', error);
            throw error;
          }
        }}
      />
    </div>
  );
} 