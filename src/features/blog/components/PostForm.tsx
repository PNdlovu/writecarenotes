/**
 * @writecarenotes.com
 * @fileoverview Blog post form component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Form component for creating and editing blog posts with validation,
 * rich text editing, and image uploads.
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post, CategoryType, Region, RegulatoryBody } from '@/app/api/blog/types';
import { postSchema } from '@/app/api/blog/validation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Editor } from './Editor';
import { useImageUpload } from '../hooks/useImageUpload';

interface PostFormProps {
  post?: Partial<Post>;
  onSubmit: (data: Post) => Promise<void>;
  isSubmitting?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({
  post,
  onSubmit,
  isSubmitting = false,
}) => {
  const { uploadImage } = useImageUpload();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<Post>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      status: post?.status || 'draft',
      categories: post?.categories || [],
      region: post?.region || [],
      regulatoryBodies: post?.regulatoryBodies || [],
      featuredImage: post?.featuredImage || '',
      ...post,
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImage(file);
      return url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Input
          {...register('title')}
          placeholder="Post title"
          error={errors.title?.message}
        />
      </div>

      {/* Content */}
      <div>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Editor
              content={field.value}
              onChange={field.onChange}
              placeholder="Write your post content here..."
            />
          )}
        />
        {errors.content?.message && (
          <p className="mt-1 text-sm text-red-500">
            {errors.content.message}
          </p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <Input
          {...register('excerpt')}
          placeholder="Post excerpt"
          error={errors.excerpt?.message}
        />
      </div>

      {/* Featured Image */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = await handleImageUpload(file);
              if (url) {
                register('featuredImage').onChange({
                  target: { value: url },
                });
              }
            }
          }}
          className="hidden"
          id="featured-image"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('featured-image')?.click()}
        >
          Upload Featured Image
        </Button>
        {watch('featuredImage') && (
          <img
            src={watch('featuredImage')}
            alt="Featured"
            className="mt-2 max-w-xs rounded"
          />
        )}
        {errors.featuredImage?.message && (
          <p className="mt-1 text-sm text-red-500">
            {errors.featuredImage.message}
          </p>
        )}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            {...register('categories')}
            multiple
            error={errors.categories?.message}
          >
            <option value="">Select Categories</option>
            {Object.values(CategoryType).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        {/* Regions */}
        <div>
          <Select
            {...register('region')}
            multiple
            error={errors.region?.message}
          >
            <option value="">Select Regions</option>
            {Object.values(Region).map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </div>

        {/* Regulatory Bodies */}
        <div>
          <Select
            {...register('regulatoryBodies')}
            multiple
            error={errors.regulatoryBodies?.message}
          >
            <option value="">Select Regulatory Bodies</option>
            {Object.values(RegulatoryBody).map(body => (
              <option key={body} value={body}>
                {body}
              </option>
            ))}
          </Select>
        </div>

        {/* Status */}
        <div>
          <Select
            {...register('status')}
            error={errors.status?.message}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}; 