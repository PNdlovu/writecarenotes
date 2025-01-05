/**
 * @writecarenotes.com
 * @fileoverview FAQ system type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the FAQ system, including entry types,
 * search parameters, and response interfaces.
 */

export interface FAQEntry {
    id: string;
    question: string;
    answer: string;
    category: FAQCategory;
    tags: string[];
    relatedArticles?: string[];
    contextualHints?: string[];
    lastUpdated: Date;
}

export enum FAQCategory {
    GENERAL = 'general',
    SAFETY = 'safety',
    COMPLIANCE = 'compliance',
    TECHNICAL = 'technical',
    INTEGRATION = 'integration',
    TRAINING = 'training',
    TROUBLESHOOTING = 'troubleshooting'
}

export interface FAQSearchParams {
    query?: string;
    category?: FAQCategory;
    tags?: string[];
    context?: string;
    limit?: number;
}

export interface FAQSearchResult {
    entries: FAQEntry[];
    totalCount: number;
    suggestedTags?: string[];
    relatedCategories?: FAQCategory[];
} 