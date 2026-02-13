-- Create a table for memories
CREATE TABLE IF NOT EXISTS memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a table for tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'completed'
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at timestamptz DEFAULT now()
);

-- Enable full-text search on memories
CREATE INDEX IF NOT EXISTS memories_content_idx ON memories USING GIN (to_tsvector('english', content));
