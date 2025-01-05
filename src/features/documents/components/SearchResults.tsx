import { useTranslation } from 'next-i18next';
import { Document } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';

interface SearchResultsProps {
  results: Document[];
  isLoading: boolean;
  error?: Error;
  searchTime?: number;
}

export default function SearchResults({
  results,
  isLoading,
  error,
  searchTime,
}: SearchResultsProps) {
  const { t } = useTranslation('documents');
  const router = useRouter();

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <span>{t('search.error')}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-4 border rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/5 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/5 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="mt-4 text-center text-gray-500">
        {t('search.noResults')}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {searchTime && (
        <p className="text-sm text-gray-500 mb-4">
          {t('search.results', {
            count: results.length,
            time: searchTime.toFixed(2),
          })}
        </p>
      )}

      <div className="space-y-4">
        {results.map((doc) => (
          <button
            key={doc.id}
            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => router.push(`/documents/${doc.id}`)}
          >
            <h3 className="text-lg font-medium mb-2">
              {doc.title}
            </h3>
            {doc.description && (
              <p className="text-gray-600 mb-3 line-clamp-2">
                {doc.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {t(`documentTypes.${doc.type}`)}
              </span>
              <span className={cn(
                "px-2 py-1 rounded-full",
                doc.status === 'PUBLISHED'
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              )}>
                {t(`status.${doc.status.toLowerCase()}`)}
              </span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


