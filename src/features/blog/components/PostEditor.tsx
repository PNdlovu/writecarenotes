/**
 * @writecarenotes.com
 * @fileoverview Blog post editor component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Rich text editor component for creating and editing blog posts.
 * Uses TipTap editor with custom extensions for regulatory content,
 * image handling, and markdown support.
 */

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormControl } from '@/components/ui/Form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post, PostStatus, Region, RegulatoryBody } from '@/app/api/blog/types';
import { postSchema } from '@/app/api/blog/validation';
import { useCategories } from '../hooks/useCategories';
import { useImageUpload } from '../hooks/useImageUpload';
import { EditorToolbar } from './EditorToolbar';

interface PostEditorProps {
  post?: Partial<Post>;
  onSave: (data: Partial<Post>) => Promise<void>;
  onPublish: (data: Post) => Promise<void>;
  onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  onSave,
  onPublish,
  onCancel,
}) => {
  const { categories } = useCategories();
  const { uploadImage } = useImageUpload();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      status: post?.status || PostStatus.DRAFT,
      categoryIds: post?.categoryIds || [],
      tags: post?.tags || [],
      region: post?.region || [Region.ALL],
      regulatoryBodies: post?.regulatoryBodies || [],
      seoMetadata: post?.seoMetadata || {},
      relatedResources: post?.relatedResources || {},
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const onSubmit = async (data: Partial<Post>) => {
    if (editor) {
      const content = editor.getHTML();
      await onSave({ ...data, content });
    }
  };

  const handlePublish = async (data: Post) => {
    if (editor) {
      const content = editor.getHTML();
      await onPublish({ ...data, content, status: PostStatus.PUBLISHED });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.title}>
          <TextField
            {...register('title')}
            label="Title"
            error={!!errors.title}
            helperText={errors.title?.message}
            required
          />
        </FormControl>

        <FormControl error={!!errors.slug}>
          <TextField
            {...register('slug')}
            label="Slug"
            error={!!errors.slug}
            helperText={errors.slug?.message}
            required
          />
        </FormControl>
      </div>

      <FormControl error={!!errors.excerpt}>
        <TextField
          {...register('excerpt')}
          label="Excerpt"
          multiline
          rows={2}
          error={!!errors.excerpt}
          helperText={errors.excerpt?.message}
        />
      </FormControl>

      <div className="border rounded-lg">
        <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
        <EditorContent editor={editor} className="p-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.categoryIds}>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                label="Categories"
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                error={!!errors.categoryIds}
                helperText={errors.categoryIds?.message}
                required
              />
            )}
          />
        </FormControl>

        <FormControl error={!!errors.tags}>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tags"
                placeholder="Enter tags separated by commas"
                error={!!errors.tags}
                helperText={errors.tags?.message}
                required
              />
            )}
          />
        </FormControl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl error={!!errors.region}>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                label="Regions"
                options={Object.values(Region).map(region => ({
                  value: region,
                  label: region.replace(/_/g, ' '),
                }))}
                error={!!errors.region}
                helperText={errors.region?.message}
                required
              />
            )}
          />
        </FormControl>

        <FormControl error={!!errors.regulatoryBodies}>
          <Controller
            name="regulatoryBodies"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                label="Regulatory Bodies"
                options={Object.values(RegulatoryBody).map(body => ({
                  value: body,
                  label: body,
                }))}
                error={!!errors.regulatoryBodies}
                helperText={errors.regulatoryBodies?.message}
              />
            )}
          />
        </FormControl>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outlined"
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          onClick={handleSubmit(handlePublish)}
          variant="contained"
          disabled={isSubmitting}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}; 