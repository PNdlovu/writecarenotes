import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdated: Date;
  views: number;
  helpful: number;
  attachments?: { id: string; name: string; url: string }[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}

export const KnowledgeBase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories } = useQuery<Category[]>(
    ['kb-categories'],
    () => scheduleAPI.getKnowledgeBaseCategories(),
  );

  const { data: articles } = useQuery<Article[]>(
    ['kb-articles', selectedCategory, searchQuery],
    () => scheduleAPI.getKnowledgeBaseArticles(selectedCategory, searchQuery),
  );

  const filteredArticles = articles?.filter((article) =>
    searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
              <span className="ml-2 text-sm">({category.articleCount})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles?.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>By {article.author}</div>
                <div>
                  Updated {new Date(article.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-4">
                  <span>👁️ {article.views}</span>
                  <span>👍 {article.helpful}</span>
                </div>
                {article.attachments && article.attachments.length > 0 && (
                  <div className="flex gap-2">
                    {article.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t px-6 py-4">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No articles found matching your criteria</div>
        </div>
      )}
    </div>
  );
};
