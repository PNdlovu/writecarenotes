import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupSearch() {
  try {
    // Create the function for updating search vectors
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_document_search_vector()
      RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, ''));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Create the trigger
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS document_search_vector_update ON documents;
      CREATE TRIGGER document_search_vector_update
      BEFORE INSERT OR UPDATE ON documents
      FOR EACH ROW
      EXECUTE FUNCTION update_document_search_vector();
    `;

    console.log('Successfully created search function and trigger');
  } catch (error) {
    console.error('Error setting up search:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSearch();
