/*
Seed script to initialize the relevant DB tables locally for promptle. This is dummy data for your testing purposes
Each time this file is updated, you need to run "supabase db reset" and spin up your local instance
*/

-- 1. CLEANUP challenges and guesses table
-- TRUNCATE in postgres is an efficient "delete all rows" and we use CASCADE to dependent tables with foreign
-- key references
TRUNCATE TABLE public.guesses CASCADE;
TRUNCATE TABLE public.challenges CASCADE;

-- 2. CREATE REAL LOGIN USER
DO $$
DECLARE
  user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
    -- A. Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      'test@example.com',
      crypt('password123', gen_salt('bf')), -- Hashes the password 'password123'
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- B. Insert into auth.identities (Required for login to work)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      format('{"sub":"%s","email":"test@example.com"}', user_id)::jsonb,
      'email',
      user_id::text,
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- 3. INSERT CHALLENGES
INSERT INTO public.challenges (
    id, date, unsplash_id, image_url, photographer_name, photographer_profile_url, photo_description, embedding
) VALUES
    -- YESTERDAY
    ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'ukvgqriuOgo', 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'Henning Witzel', 'https://unsplash.com/@henning', 'Los Angeles by Night', array_fill(0.1, ARRAY[512])::vector),
    -- TODAY
    ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE, 'GA2y1XU9bIw', 'https://images.unsplash.com/photo-1766864109448-3cb84647b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzY4MTY1MTA1fA&ixlib=rb-4.1.0&q=80&w=1080', 'Maxim Tolchinskiy', 'https://unsplash.com/@shaikhulud', 'Snowy park path lined with lampposts at night', array_fill(0.2, ARRAY[512])::vector);

-- 4. INSERT GUESSES (Linked to test@example.com)
INSERT INTO public.guesses (
    user_id, challenge_id, prompt, image_url, score
) VALUES
    ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001', 'Neon lights raining', 'https://placehold.co/600x400/png?text=Yesterday+Guess', 0.85),
    ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000002', 'Books on a shelf', 'https://placehold.co/600x400/png?text=Today+Attempt+1', 0.45),
    ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000002', 'Sunlight hitting old books', 'https://placehold.co/600x400/png?text=Today+Attempt+2', 0.92);