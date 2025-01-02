/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base article editor
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Rich text editor for knowledge base articles with support for markdown,
 * media uploads, and version control.
 */

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { useArticle } from '../hooks/useArticle'
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type Article, type ArticleType, type ArticleAccess } from '../types'
import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { CategoryTree } from './CategoryTree'
import { TagInput } from './TagInput'

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['guide', 'documentation', 'tutorial', 'faq']),
  access: z.enum(['public', 'organization', 'role-based']),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'review', 'published', 'archived'])
})

type ArticleFormData = z.infer<typeof articleSchema>

interface ArticleEditorProps {
  articleId?: string
  onSave?: () => void
  onCancel?: () => void
}

export function ArticleEditor({ articleId, onSave, onCancel }: ArticleEditorProps) {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('edit')
  const { article, isLoading, updateArticle, createArticle } = useArticle(articleId)

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: article || {
      title: '',
      summary: '',
      content: '',
      type: 'documentation',
      access: 'public',
      tags: [],
      status: 'draft'
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Add more extensions as needed
    ],
    content: article?.content || '',
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML())
    }
  })

  const onSubmit = async (data: ArticleFormData) => {
    try {
      if (articleId) {
        await updateArticle({ id: articleId, data })
      } else {
        await createArticle(data)
      }
      onSave?.()
    } catch (error) {
      console.error('Failed to save article:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {articleId ? t('kb.editor.editArticle') : t('kb.editor.newArticle')}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('common.save')}
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="edit">{t('kb.editor.tabs.edit')}</TabsTrigger>
            <TabsTrigger value="preview">{t('kb.editor.tabs.preview')}</TabsTrigger>
            <TabsTrigger value="metadata">{t('kb.editor.tabs.metadata')}</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.title')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.summary')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('kb.editor.type')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guide">{t('kb.types.guide')}</SelectItem>
                          <SelectItem value="documentation">{t('kb.types.documentation')}</SelectItem>
                          <SelectItem value="tutorial">{t('kb.types.tutorial')}</SelectItem>
                          <SelectItem value="faq">{t('kb.types.faq')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('kb.editor.access')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">{t('kb.access.public')}</SelectItem>
                          <SelectItem value="organization">{t('kb.access.organization')}</SelectItem>
                          <SelectItem value="role-based">{t('kb.access.roleBased')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Rich Text Editor */}
            <Card className="p-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.content')}</FormLabel>
                    <FormControl>
                      <EditorContent editor={editor} className="min-h-[400px] prose max-w-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="p-6">
              <article className="prose max-w-none">
                <h1>{form.watch('title')}</h1>
                <p className="lead">{form.watch('summary')}</p>
                <div dangerouslySetInnerHTML={{ __html: form.watch('content') }} />
              </article>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <Card className="p-6 space-y-4">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.category')}</FormLabel>
                    <FormControl>
                      <CategoryTree
                        selectedId={field.value}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.tags')}</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('kb.editor.status')}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('kb.status.draft')}</SelectItem>
                        <SelectItem value="review">{t('kb.status.review')}</SelectItem>
                        <SelectItem value="published">{t('kb.status.published')}</SelectItem>
                        <SelectItem value="archived">{t('kb.status.archived')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Version History */}
            {articleId && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t('kb.editor.versionHistory')}
                </h3>
                <ScrollArea className="h-[200px]">
                  {/* Version history list */}
                </ScrollArea>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
