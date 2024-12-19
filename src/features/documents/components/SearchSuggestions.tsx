import { useTranslation } from 'next-i18next';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isPopular?: boolean;
}

export default function SearchSuggestions({
  suggestions,
  onSuggestionClick,
  isPopular = false,
}: SearchSuggestionsProps) {
  const { t } = useTranslation('documents');

  if (!suggestions?.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm text-gray-600 mb-2">
        {isPopular ? t('search.popular') : t('search.suggestions')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}


