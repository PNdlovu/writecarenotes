# File Header Guidelines

## Standard Header Template
```typescript
/**
 * @writecarenotes.com
 * @fileoverview [Brief one-line description of the file's purpose]
 * @version [major.minor.patch]
 * @created [YYYY-MM-DD]
 * @updated [YYYY-MM-DD]
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * [Detailed multi-line description of the file's functionality,
 * features, and relationships with other modules. Include key
 * capabilities and supported frameworks if applicable.]
 *
 * Features:
 * - [List key features]
 * - [Mobile/responsive features]
 * - [Offline capabilities]
 * - [Regional/language support]
 *
 * Mobile-First Considerations:
 * - Responsive design patterns
 * - Touch interactions
 * - Screen size adaptations
 * - Performance optimizations
 *
 * Enterprise Features:
 * - Security measures
 * - Compliance standards
 * - Error handling
 * - Logging strategy
 */

// Import Organization
// 1. React and Framework imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// 3. Global state management
import { useStore } from '@/stores/rootStore';
import { observer } from 'mobx-react-lite';

// 4. Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 5. Hooks and utilities
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDate } from '@/utils/dateUtils';

// 6. Types and interfaces
import type { ComponentProps } from '@/types/components';
import type { Theme } from '@/types/theme';

// 7. Constants and configurations
import { API_ENDPOINTS } from '@/config/api';
import { THEMES } from '@/config/themes';

// 8. Styles
import styles from './Component.module.css';
```

## Header Fields Guide

1. **@writecarenotes.com**
   - Must be the first line
   - Company domain identifier

2. **@fileoverview**
   - Brief, one-line description
   - Should clearly indicate the file's primary purpose
   - Use clear, action-oriented language

3. **@version**
   - Format: major.minor.patch (e.g., 1.0.0)
   - Follow semantic versioning principles
   - Major: Breaking changes
   - Minor: New features, backward compatible
   - Patch: Bug fixes, backward compatible

4. **@created**
   - Format: YYYY-MM-DD
   - Initial file creation date
   - Must be a valid date

5. **@updated**
   - Format: YYYY-MM-DD
   - Last modification date
   - Must be a valid date
   - Should be updated with each significant change

6. **@author**
   - Must be "Write Care Notes team"
   - Represents collective ownership

7. **@copyright**
   - Must be "Phibu Cloud Solutions Ltd"
   - Legal copyright holder

8. **Description Section**
   - Must start with "Description:"
   - Detailed explanation of functionality
   - Multiple lines for complex features
   - Include relationships with other modules
   - List key capabilities
   - Mention supported frameworks if applicable

## Formatting Rules

1. Start with `/**` on its own line
2. Each line starts with a single space after `*`
3. One blank line before the Description section
4. Consistent indentation throughout
5. End with `*/` on its own line
6. No trailing spaces
7. Use proper line breaks for readability

## Examples by File Type

### Service Files
```typescript
/**
 * @writecarenotes.com
 * @fileoverview Core incident service for basic incident operations
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core incident service for managing basic incident operations including
 * reporting, status updates, action tracking, and lessons learned.
 * Handles the fundamental CRUD operations for incidents and provides
 * basic notification capabilities.
 */
```

### Advanced Service Files
```typescript
/**
 * @writecarenotes.com
 * @fileoverview Advanced incident management and analytics service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Advanced incident service providing complex incident management features
 * including medication incident handling, trend analysis, and preventive
 * measures generation. Extends core incident functionality with advanced
 * reporting capabilities and integration with other care services.
 */
```

### Enterprise Service Files
```typescript
/**
 * @writecarenotes.com
 * @fileoverview Enterprise incident management and compliance service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive incident management service for handling all aspects of
 * care home incidents. Provides functionality for incident creation,
 * investigation, reporting, analytics, compliance reporting, and
 * integration with external systems. Supports multiple regulatory
 * frameworks including CQC, OFSTED, CIW, CI, and RQIA. Implements
 * advanced security measures and offline capabilities.
 */
```

## Mobile-First Design Guidelines

1. **Responsive Design**
   - Use relative units (rem, em, %)
   - Implement fluid typography
   - Design for smallest screen first
   - Use breakpoints strategically

2. **Touch Interactions**
   - Minimum touch target size: 44x44px
   - Adequate spacing between interactive elements
   - Touch feedback states
   - Gesture support

3. **Performance**
   - Lazy loading implementation
   - Image optimization
   - Code splitting
   - Bundle size management

4. **Offline Support**
   - Service worker implementation
   - Data persistence strategy
   - Sync mechanisms
   - Error handling

## Import Organization Guidelines

1. **Import Order**
   - React and framework imports
   - Third-party libraries
   - Global state management
   - Components
   - Hooks and utilities
   - Types and interfaces
   - Constants and configurations
   - Styles

2. **Import Rules**
   - Use absolute imports with aliases
   - Group related imports
   - Maintain consistent ordering
   - Remove unused imports

3. **Best Practices**
   - Avoid circular dependencies
   - Use named imports
   - Implement code splitting
   - Document complex imports

## Enterprise-Level Features

1. **Internationalization**
   - Language support
   - Regional formatting
   - RTL support
   - Cultural considerations

2. **Security**
   - Authentication
   - Authorization
   - Data encryption
   - Input validation

3. **Error Handling**
   - Global error boundary
   - Error logging
   - User feedback
   - Recovery strategies

4. **Performance Monitoring**
   - Analytics integration
   - Performance metrics
   - Error tracking
   - User behavior analysis

5. **Compliance**
   - GDPR compliance
   - HIPAA compliance
   - Accessibility (WCAG)
   - Security standards

6. **Testing Strategy**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

## Best Practices

1. **Version Updates**
   - Increment version number with each significant change
   - Update the @updated date
   - Document changes in CHANGELOG.md

2. **Description Writing**
   - Be specific and clear
   - Include key features and capabilities
   - Mention integrations and dependencies
   - List supported standards or frameworks
   - Explain the file's role in the larger system

3. **Maintenance**
   - Review headers during code reviews
   - Keep descriptions up to date
   - Ensure dates are accurate
   - Validate version numbers

4. **Automation**
   - Consider using tools to validate header format
   - Automate date updates in CI/CD pipeline
   - Use linting rules to enforce header presence