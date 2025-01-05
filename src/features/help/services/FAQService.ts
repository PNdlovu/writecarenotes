/**
 * @writecarenotes.com
 * @fileoverview FAQ service implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core FAQ service providing search, retrieval, and contextual help
 * functionality for the medication module help system.
 */

import { FAQEntry, FAQCategory, FAQSearchParams, FAQSearchResult } from '../interfaces/FAQTypes';
import { fuzzySearch } from '../../common/utils/searchUtils';
import { RegionService } from '../../common/services/RegionService';
import { HelpAnalyticsService } from './HelpAnalyticsService';

interface CacheEntry {
    data: FAQEntry[];
    timestamp: number;
}

export class FAQService {
    private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    private static readonly PRELOAD_CONTEXTS = [
        'medication-administration',
        'drug-interaction',
        'prn-medication',
        'allergy-check',
        'medication-stock'
    ];

    private faqData: FAQEntry[] = [];
    private readonly regionService: RegionService;
    private readonly analyticsService: HelpAnalyticsService;
    private contextCache: Map<string, CacheEntry> = new Map();
    private preloadPromise: Promise<void> | null = null;

    constructor(regionService: RegionService, analyticsService: HelpAnalyticsService) {
        this.regionService = regionService;
        this.analyticsService = analyticsService;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadFAQData();
        this.startPreloading();
    }

    private async loadFAQData(): Promise<void> {
        const region = await this.regionService.getCurrentRegion();
        // TODO: Load from API/database based on region
    }

    private startPreloading(): void {
        this.preloadPromise = this.preloadContexts();
    }

    private async preloadContexts(): Promise<void> {
        try {
            const preloadPromises = FAQService.PRELOAD_CONTEXTS.map(context =>
                this.preloadContext(context)
            );
            await Promise.all(preloadPromises);
        } catch (error) {
            console.error('Error preloading FAQ contexts:', error);
        }
    }

    private async preloadContext(context: string): Promise<void> {
        try {
            const entries = await this.fetchContextEntries(context);
            this.cacheContextData(context, entries);
        } catch (error) {
            console.error(`Error preloading context ${context}:`, error);
        }
    }

    private async fetchContextEntries(context: string): Promise<FAQEntry[]> {
        // TODO: Implement actual API call to fetch context-specific entries
        return this.faqData.filter(entry => entry.contextualHints?.includes(context));
    }

    private cacheContextData(context: string, entries: FAQEntry[]): void {
        this.contextCache.set(context, {
            data: entries,
            timestamp: Date.now()
        });
    }

    private isCacheValid(cacheEntry: CacheEntry): boolean {
        return Date.now() - cacheEntry.timestamp < FAQService.CACHE_DURATION;
    }

    public async searchFAQ(params: FAQSearchParams): Promise<FAQSearchResult> {
        // Wait for preloading if it's still in progress
        if (this.preloadPromise) {
            await this.preloadPromise;
        }

        let results = this.faqData;
        const startTime = Date.now();

        try {
            // Try to use cached data for context
            if (params.context) {
                const cached = this.contextCache.get(params.context);
                if (cached && this.isCacheValid(cached)) {
                    results = cached.data;
                } else {
                    results = await this.fetchContextEntries(params.context);
                    this.cacheContextData(params.context, results);
                }
            }

            // Apply filters
            if (params.category) {
                results = results.filter(entry => entry.category === params.category);
            }

            if (params.tags?.length) {
                results = results.filter(entry => 
                    params.tags!.some(tag => entry.tags.includes(tag))
                );
            }

            if (params.query) {
                results = fuzzySearch(results, params.query, ['question', 'answer']);
            }

            // Get metadata
            const suggestedTags = this.getSuggestedTags(results);
            const relatedCategories = this.getRelatedCategories(results);

            // Apply limit
            if (params.limit) {
                results = results.slice(0, params.limit);
            }

            // Track analytics
            this.analyticsService.trackSearch(
                params.query || '',
                results.length > 0
            );

            return {
                entries: results,
                totalCount: results.length,
                suggestedTags,
                relatedCategories
            };
        } catch (error) {
            console.error('Error searching FAQ:', error);
            this.analyticsService.trackSearch(params.query || '', false);
            throw error;
        } finally {
            const duration = Date.now() - startTime;
            if (params.context) {
                this.analyticsService.trackHelpView(params.context, duration);
            }
        }
    }

    public async getContextualHelp(context: string): Promise<FAQEntry[]> {
        const cached = this.contextCache.get(context);
        if (cached && this.isCacheValid(cached)) {
            this.analyticsService.trackTrigger('cache-hit', context);
            return cached.data;
        }

        this.analyticsService.trackTrigger('cache-miss', context);
        const entries = await this.fetchContextEntries(context);
        this.cacheContextData(context, entries);
        return entries;
    }

    private getSuggestedTags(entries: FAQEntry[]): string[] {
        const tagCounts = new Map<string, number>();
        entries.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });
        
        return Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);
    }

    private getRelatedCategories(entries: FAQEntry[]): FAQCategory[] {
        const categories = new Set(entries.map(entry => entry.category));
        return Array.from(categories);
    }

    public clearCache(): void {
        this.contextCache.clear();
    }
} 