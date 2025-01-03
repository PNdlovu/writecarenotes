/**
 * @writecarenotes.com
 * @fileoverview Blog post creation page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Page component for creating new blog posts with rich text editing,
 * image uploads, and validation.
 */

import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PostForm } from '@/features/blog/components/PostForm';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Create Blog Post - Write Care Notes',
  description: 'Create a new blog post for Write Care Notes',
};

export default async function CreatePostPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/blog/create');
  }

  // Check authorization
  if (!['ADMIN', 'AUTHOR', 'EDITOR'].includes(session.user.role)) {
    redirect('/blog');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Create New Blog Post
        </h1>
        <p className="text-gray-600 mt-2">
          Share your insights and expertise with the care home community.
        </p>
      </header>

      {/* Post Form */}
      <PostForm
        onSubmit={async (data) => {
          'use server';
          
          try {
            const response = await fetch('/api/blog', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...data,
                authorId: session.user.id,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to create post');
            }

            const post = await response.json();
            redirect(`/blog/${post.slug}`);
          } catch (error) {
            console.error('Error creating post:', error);
            throw error;
          }
        }}
      />
    </div>
  );
} 
