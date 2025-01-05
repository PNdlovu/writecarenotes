/**
 * @writecarenotes.com
 * @fileoverview Contextual Help Tooltip Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying context-sensitive help tooltips
 * triggered by user interactions or keyboard shortcuts.
 */

import React, { useEffect, useState, useRef } from 'react';
import { FAQEntry } from '../interfaces/FAQTypes';
import { ContextualHelpService } from '../services/ContextualHelpService';
import { HelpAnalyticsService } from '../services/HelpAnalyticsService';
import '../styles/ContextualHelpTooltip.css';

interface ContextualHelpTooltipProps {
    contextualHelpService: ContextualHelpService;
    analyticsService: HelpAnalyticsService;
}

export const ContextualHelpTooltip: React.FC<ContextualHelpTooltipProps> = ({
    contextualHelpService,
    analyticsService
}) => {
    const [entries, setEntries] = useState<FAQEntry[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const viewStartTime = useRef<number | null>(null);

    useEffect(() => {
        const handleContextHelp = (event: CustomEvent<{ entries: FAQEntry[] }>) => {
            setEntries(event.detail.entries);
            setIsVisible(true);
            viewStartTime.current = Date.now();
            
            // Position tooltip near the cursor or focused element
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) {
                const rect = activeElement.getBoundingClientRect();
                setPosition({
                    x: rect.right + 10,
                    y: rect.top
                });
            }

            // Track help trigger
            analyticsService.trackTrigger('contextual-help', 'tooltip-view');
        };

        const handleHelpSearch = (event: CustomEvent<{ context?: string }>) => {
            analyticsService.trackShortcut('search', event.detail.context);
        };

        // Listen for events
        document.addEventListener('showContextHelp', handleContextHelp as EventListener);
        document.addEventListener('openHelpSearch', handleHelpSearch as EventListener);

        return () => {
            document.removeEventListener('showContextHelp', handleContextHelp as EventListener);
            document.removeEventListener('openHelpSearch', handleHelpSearch as EventListener);
        };
    }, [analyticsService]);

    const handleClose = () => {
        if (viewStartTime.current && entries.length > 0) {
            const duration = Date.now() - viewStartTime.current;
            analyticsService.trackHelpView('tooltip', duration);
        }
        setIsVisible(false);
        viewStartTime.current = null;
    };

    if (!isVisible || entries.length === 0) return null;

    return (
        <div 
            className="contextual-help-tooltip"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
        >
            <div className="tooltip-header">
                <h3>Help</h3>
                <button 
                    className="close-button"
                    onClick={handleClose}
                >
                    ×
                </button>
            </div>
            <div className="tooltip-content">
                {entries.map(entry => (
                    <div key={entry.id} className="help-entry">
                        <h4>{entry.question}</h4>
                        <p>{entry.answer}</p>
                        {entry.contextualHints?.map((hint, index) => (
                            <div key={index} className="contextual-hint">
                                💡 {hint}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="tooltip-footer">
                <span className="keyboard-hint">
                    Press F1 for more help
                </span>
            </div>
        </div>
    );
}; 