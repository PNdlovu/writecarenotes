/**
 * @writecarenotes.com
 * @fileoverview Elasticsearch setup script
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Script to set up Elasticsearch indices and reindex all articles.
 */

import { initializeIndex } from '@/lib/elasticsearch'

async function main() {
  try {
    console.log('Setting up Elasticsearch...')

    // Initialize index with mappings
    console.log('Initializing index...')
    await initializeIndex()

    console.log('Setup complete! Elasticsearch index has been created.')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

main()
