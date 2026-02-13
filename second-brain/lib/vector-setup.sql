-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table for memories with vector support
create table if not exists memories (
  id uuid default gen_random_uuid() primary key,
  file_path text not null unique,
  content text not null,
  embedding vector(1536), -- Dimension for OpenAI/Gemini embeddings
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to search for memories by embedding similarity
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  file_path text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.file_path,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
