/**
 * @writecarenotes.com
 * @fileoverview Contextual Help Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing context-sensitive help triggers and keyboard shortcuts
 * throughout the medication module.
 */

import { FAQEntry } from '../interfaces/FAQTypes';
import { FAQService } from './FAQService';

export interface ContextTrigger {
    id: string;
    context: string;
    element: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export class ContextualHelpService {
    private static readonly HELP_SHORTCUT = 'F1';
    private static readonly SEARCH_SHORTCUT = 'Ctrl+H';
    private readonly faqService: FAQService;
    private activeContext: string | null = null;
    private triggers: Map<string, ContextTrigger> = new Map();

    constructor(faqService: FAQService) {
        this.faqService = faqService;
        this.initializeKeyboardShortcuts();
        this.initializeDefaultTriggers();
    }

    private initializeKeyboardShortcuts(): void {
        document.addEventListener('keydown', (event) => {
            // F1 for immediate contextual help
            if (event.key === 'F1') {
                event.preventDefault();
                this.showContextHelp();
            }
            // Ctrl+H for help search
            if (event.key === 'h' && event.ctrlKey) {
                event.preventDefault();
                this.openHelpSearch();
            }
        });
    }

    private initializeDefaultTriggers(): void {
        // Medication Administration Triggers
        this.addTrigger({
            id: 'mar-chart',
            context: 'medication-administration',
            element: '[data-testid="mar-chart"]',
            description: 'MAR Chart Help',
            priority: 'high'
        });

        this.addTrigger({
            id: 'drug-interaction',
            context: 'medication-safety',
            element: '[data-testid="interaction-warning"]',
            description: 'Drug Interaction Information',
            priority: 'high'
        });

        this.addTrigger({
            id: 'prn-admin',
            context: 'prn-medication',
            element: '[data-testid="prn-form"]',
            description: 'PRN Administration Guide',
            priority: 'high'
        });
    }

    public addTrigger(trigger: ContextTrigger): void {
        this.triggers.set(trigger.id, trigger);
        this.attachTriggerListener(trigger);
    }

    private attachTriggerListener(trigger: ContextTrigger): void {
        const elements = document.querySelectorAll(trigger.element);
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.setActiveContext(trigger.context);
            });

            element.addEventListener('focus', () => {
                this.setActiveContext(trigger.context);
            });
        });
    }

    public setActiveContext(context: string): void {
        this.activeContext = context;
    }

    public async getContextualHelp(): Promise<FAQEntry[]> {
        if (!this.activeContext) return [];
        return await this.faqService.getContextualHelp(this.activeContext);
    }

    private async showContextHelp(): Promise<void> {
        const helpEntries = await this.getContextualHelp();
        if (helpEntries.length > 0) {
            // Trigger help display through event system
            const event = new CustomEvent('showContextHelp', {
                detail: { entries: helpEntries }
            });
            document.dispatchEvent(event);
        }
    }

    private openHelpSearch(): void {
        // Trigger help search through event system
        const event = new CustomEvent('openHelpSearch', {
            detail: { context: this.activeContext }
        });
        document.dispatchEvent(event);
    }

    public getKeyboardShortcuts(): { [key: string]: string } {
        return {
            'Show Context Help': ContextualHelpService.HELP_SHORTCUT,
            'Open Help Search': ContextualHelpService.SEARCH_SHORTCUT
        };
    }
} 