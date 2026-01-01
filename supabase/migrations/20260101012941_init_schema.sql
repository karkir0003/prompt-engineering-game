-- 1. CHALLENGES TABLE for each daily challenge
create table challenges (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  
  -- Compliance Fields
  unsplash_id text not null,
  image_url text not null,
  photographer_name text not null,
  photographer_profile_url text not null,
  photo_description text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GUESSES TABLE for user guesses on a daily challenge
create table guesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  challenge_id uuid references challenges(id) not null,
  
  -- Validation Rule
  prompt text not null check (char_length(prompt) <= 100), -- enforce 100 character limit at DB layer
  image_url text not null,
  score numeric,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INDEXES for common access patterns
create index idx_challenges_date on challenges(date);
create index idx_guesses_user_challenge on guesses(user_id, challenge_id);

-- 4. RLS to ensure user specific data is modified only by that user
alter table challenges enable row level security;
alter table guesses enable row level security;

create policy "Public challenges are viewable by everyone" 
  on challenges for select using (true);

create policy "Users can view their own guesses" 
  on guesses for select using (auth.uid() = user_id);

create policy "Users can insert their own guesses" 
  on guesses for insert with check (auth.uid() = user_id);