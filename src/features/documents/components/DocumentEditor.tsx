import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Document, DocumentType, DocumentStatus } from '@prisma/client';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface DocumentEditorProps {
  documentId?: string;
  templateId?: string;
}

export default function DocumentEditor({ documentId, templateId }: DocumentEditorProps) {
  const { t } = useTranslation('documents');
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('editor');
  const [editor] = useState(() =>
    new Editor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: t('editor.placeholder'),
        }),
      ],
      content: '',
      autofocus: true,
    })
  );

  // Fetch document categories
  const { data: categories } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: async () => {
      const response = await fetch('/api/document-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch document tags
  const { data: tags } = useQuery({
    queryKey: ['documentTags'],
    queryFn: async () => {
      const response = await fetch('/api/document-tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
  });

  // Fetch existing document if editing
  const { data: document, isLoading: isLoadingDocument } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json();
    },
    enabled: !!documentId,
  });

  // Fetch template if creating from template
  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await fetch(`/api/document-templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json();
    },
    enabled: !!templateId,
  });

  // Initialize editor content
  useEffect(() => {
    if (document) {
      editor.commands.setContent(document.versions[0].content);
    } else if (template) {
      editor.commands.setContent(template.content);
    }
  }, [document, template, editor]);

  // Save document mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Document>) => {
      const response = await fetch(
        documentId ? `/api/documents/${documentId}` : '/api/documents',
        {
          method: documentId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            content: editor.getHTML(),
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to save document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('editor.saveSuccess'),
        description: documentId
          ? t('editor.documentUpdated')
          : t('editor.documentCreated'),
      });
      router.push('/documents');
    },
    onError: () => {
      toast({
        title: t('editor.saveError'),
        description: t('editor.tryAgain'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: Partial<Document>) => {
    await saveMutation.mutateAsync(data);
  };

  if (isLoadingDocument || isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form
        onSubmit={handleSubmit}
        defaultValues={{
          title: document?.title || template?.name || '',
          type: document?.type || DocumentType.STANDARD,
          status: document?.status || DocumentStatus.DRAFT,
          categoryId: document?.categoryId || '',
          tags: document?.tags?.map((tag) => tag.id) || [],
        }}
      >
        <div className="space-y-4">
          <FormField
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.title')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.type')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`documentTypes.${type.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.status')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`status.${status.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.category')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.tags')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    multiple
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.selectTags')} />
                    </SelectTrigger>
                    <SelectContent>
                      {tags?.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="editor">{t('tabs.editor')}</TabsTrigger>
            <TabsTrigger value="preview">{t('tabs.preview')}</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="min-h-[500px]">
            <div className="border rounded-lg p-4">
              <EditorContent editor={editor} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="min-h-[500px]">
            <div
              className="prose max-w-none border rounded-lg p-4"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/documents')}
          >
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
}


