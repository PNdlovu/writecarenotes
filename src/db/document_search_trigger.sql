-- Function to update tsvector column
CREATE OR REPLACE FUNCTION documents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
     to_tsvector('english',
        coalesce(NEW.title,'') || ' ' ||
        coalesce(NEW.content,'')
     );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger before insert or update
DROP TRIGGER IF EXISTS documents_search_vector_trigger ON "Document";
CREATE TRIGGER documents_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Document"
  FOR EACH ROW
  EXECUTE FUNCTION documents_search_vector_update();
