/**
 * @writecarenotes.com
 * @fileoverview FAQ Panel Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * FAQ panel component providing searchable help content and
 * contextual assistance for the medication module.
 */

import React, { useState, useEffect } from 'react';
import { FAQEntry, FAQCategory, FAQSearchParams } from '../interfaces/FAQTypes';
import { FAQService } from '../services/FAQService';
import { useRegionService } from '../../common/hooks/useRegionService';

interface FAQPanelProps {
    context?: string;
    initialCategory?: FAQCategory;
    onClose?: () => void;
}

export const FAQPanel: React.FC<FAQPanelProps> = ({
    context,
    initialCategory,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FAQCategory | undefined>(initialCategory);
    const [results, setResults] = useState<FAQEntry[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const regionService = useRegionService();
    const faqService = new FAQService(regionService);

    useEffect(() => {
        searchFAQ();
    }, [searchQuery, selectedCategory, selectedTags, context]);

    const searchFAQ = async () => {
        setIsLoading(true);
        try {
            const params: FAQSearchParams = {
                query: searchQuery,
                category: selectedCategory,
                tags: selectedTags,
                context,
                limit: 10
            };

            const result = await faqService.searchFAQ(params);
            setResults(result.entries);
            setSuggestedTags(result.suggestedTags || []);
        } catch (error) {
            console.error('Error searching FAQ:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="faq-panel">
            <div className="faq-header">
                <h2>Help Center</h2>
                {onClose && (
                    <button onClick={onClose} className="close-button">
                        ×
                    </button>
                )}
            </div>

            <div className="search-section">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for help..."
                    className="search-input"
                />
            </div>

            <div className="categories-section">
                {Object.values(FAQCategory).map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {suggestedTags.length > 0 && (
                <div className="tags-section">
                    {suggestedTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            <div className="results-section">
                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : results.length > 0 ? (
                    results.map(entry => (
                        <div key={entry.id} className="faq-entry">
                            <h3>{entry.question}</h3>
                            <p>{entry.answer}</p>
                            {entry.relatedArticles && (
                                <div className="related-articles">
                                    <h4>Related Articles:</h4>
                                    <ul>
                                        {entry.relatedArticles.map(article => (
                                            <li key={article}>{article}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        No results found. Try adjusting your search terms.
                    </div>
                )}
            </div>
        </div>
    );
}; 