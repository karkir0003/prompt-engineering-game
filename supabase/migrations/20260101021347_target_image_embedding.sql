-- 1. Enable the vector extension (required for embeddings)
create extension if not exists vector with schema public;

-- 2. Add the column to hold the 512-float array
alter table challenges 
add column embedding vector(512);