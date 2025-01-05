/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base feature module entry point
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Entry point for the Knowledge Base feature module. Exports all components,
 * hooks, and utilities needed for the knowledge base functionality.
 */

// Components
export * from './components/ArticleView'
export * from './components/ArticleEditor'
export * from './components/CategoryTree'
export * from './components/SearchInterface'

// Hooks
export * from './hooks/useArticle'
export * from './hooks/useCategory'
export * from './hooks/useSearch'
export * from './hooks/useKBSync'

// Services
export * from './services/articleService'
export * from './services/categoryService'
export * from './services/searchService'
export * from './services/syncService'

// Types
export * from './types'
