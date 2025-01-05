import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { Document, DocumentType, DocumentStatus } from '@prisma/client';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import {
  ChevronUpDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  filter?: {
    type?: DocumentType;
    status?: DocumentStatus;
    residentId?: string;
  };
}

export default function DocumentList({ onDocumentSelect, filter }: DocumentListProps) {
  const { t } = useTranslation('documents');
  const router = useRouter();
  const { data: session } = useSession();
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', filter, sortField, sortOrder],
    queryFn: async () => {
      const response = await fetch('/api/documents?' + new URLSearchParams({
        ...(filter?.type && { type: filter.type }),
        ...(filter?.status && { status: filter.status }),
        ...(filter?.residentId && { residentId: filter.residentId }),
        sortField,
        sortOrder,
      }));
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!session,
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAction = async (action: string, document: Document) => {
    switch (action) {
      case 'view':
        router.push(`/documents/${document.id}`);
        break;
      case 'edit':
        router.push(`/documents/${document.id}/edit`);
        break;
      case 'duplicate':
        router.push(`/documents/new?template=${document.id}`);
        break;
      case 'delete':
        if (confirm(t('confirmDelete'))) {
          const response = await fetch(`/api/documents/${document.id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            alert(t('deleteError'));
          }
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-1">
                {t('fields.title')}
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-1">
                {t('fields.type')}
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('updatedAt')}
            >
              <div className="flex items-center gap-1">
                {t('fields.lastModified')}
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                {t('fields.status')}
                <ChevronUpDownIcon className="w-4 h-4" />
              </div>
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t('actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents?.map((document: Document) => (
            <tr
              key={document.id}
              className={cn(
                'hover:bg-gray-50 transition-colors',
                onDocumentSelect && 'cursor-pointer'
              )}
              onClick={() => onDocumentSelect?.(document)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {document.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {t(`documentTypes.${document.type}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(document.updatedAt), 'PPp')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={cn(
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    document.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : document.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {t(`status.${document.status.toLowerCase()}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {t('actions')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction('view', document)}>
                      <EyeIcon className="w-4 h-4 mr-2" />
                      {t('actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('edit', document)}>
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('duplicate', document)}>
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                      {t('actions.duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleAction('delete', document)}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


