

-- Create embedding similarity search functions
create or replace function "public"."match_document_sections"(embedding vector(1536), search_document uuid, match_threshold float, match_count int, min_content_length int)
returns table (id uuid, document_id uuid, heading text, heading_level smallint, content text, similarity float)
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select
    document_section.id,
    document_section.document_id,
    document_section.heading,
    document_section.heading_level,
    document_section.content,
    (document_section.embedding <#> embedding) * -1 as similarity
  from document_section

  -- We only care about sections that have a useful amount of content
  where length(document_section.content) >= min_content_length

  -- Only the document asked for should be searched through
  and document_section.document_id=search_document

  -- The dot product is negative because of a Postgres limitation, so we negate it
  and (document_section.embedding <#> embedding) * -1 > match_threshold

  -- OpenAI embeddings are normalized to length 1, so
  -- cosine similarity and dot product will produce the same results.
  -- Using dot product which can be computed slightly faster.
  --
  -- For the different syntaxes, see https://github.com/pgvector/pgvector
  order by document_section.embedding <#> embedding
  
  limit match_count;
end;
$$;

--- Create function to update isRealHeading field
CREATE OR REPLACE FUNCTION update_is_real_heading(p_document_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE document_section
  SET "isRealHeading" = TRUE
  WHERE id IN (
    SELECT hr.id
    FROM section_relation sr
    INNER JOIN document_section ds ON sr.section_id = ds.id
    INNER JOIN document_section hr ON sr.heading_id = hr.id
    WHERE hr.document_id = p_document_id
    GROUP BY sr.heading_id, hr.heading, hr.content_index, hr.id
    HAVING SUM(LENGTH(ds.content)) > 600
  );
END;
$$ LANGUAGE plpgsql;

--- Create function to get real headings
CREATE OR REPLACE FUNCTION get_real_headings()
RETURNS TABLE (
  document_id uuid,
  document_name TEXT,
  section_id uuid,
  section_heading TEXT,
  heading_level SMALLINT,
  content_index BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id, d.name, ds.id as "section_id", ds.heading as "section_heading", ds.heading_level, ds.content_index
  FROM
    public.documents d
  INNER JOIN public.document_section ds ON d.id = ds.document_id
  WHERE
    ds."isRealHeading" = TRUE
  ORDER BY d.id, ds.content_index;
END;
$$ LANGUAGE plpgsql;


--- Create function to get section details by heading
CREATE
OR REPLACE FUNCTION public.get_section_details_by_heading (p_heading_id UUID) RETURNS TABLE (
  heading_id UUID,
  section_id UUID,
  document_id UUID,
  heading TEXT,
  CONTENT TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.heading_id,
        sr.section_id,
        ds.document_id,
        ds.heading,
        ds.content
    FROM
        public.section_relation sr
    INNER JOIN 
        public.document_section ds ON sr.section_id = ds.id
    WHERE 
        sr.heading_id = p_heading_id
    ORDER BY 
        ds.content_index;
END;
$$ LANGUAGE plpgsql;