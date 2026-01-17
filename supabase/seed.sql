/*
Seed script to initialize the relevant DB tables locally for promptle. 
Note: Each time this file is updated, run "supabase db reset" and spin up your local instance.

Test credentials:
- Email: test@example.com
- Password: password123
*/

-- CLEANUP challenges and guesses table
-- TRUNCATE in postgres is an efficient "delete all rows" and we use CASCADE to delete dependent tables with foreign
-- key references
TRUNCATE TABLE public.guesses CASCADE;
TRUNCATE TABLE public.challenges CASCADE;

-- CREATE TEST USERS
DO $$
DECLARE
  -- Using deterministic UUIDs for easy reference in tests
  user_id_1 uuid := '00000000-0000-0000-0000-000000000001';
  user_id_2 uuid := '00000000-0000-0000-0000-000000000002';
  user_id_3 uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- User 1: Primary test user with guesses
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
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
      user_id_1,
      'authenticated',
      'authenticated',
      'test@example.com',
      crypt('password123', gen_salt('bf')),
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
      user_id_1,
      format('{"sub":"%s","email":"test@example.com"}', user_id_1)::jsonb,
      'email',
      user_id_1::text,
      now(),
      now(),
      now()
    );
  END IF;

  -- User 2: Test user with no guesses (for testing empty states)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'newuser@example.com') THEN
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
      user_id_2,
      'authenticated',
      'authenticated',
      'newuser@example.com',
      crypt('password123', gen_salt('bf')),
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
      user_id_2,
      format('{"sub":"%s","email":"newuser@example.com"}', user_id_2)::jsonb,
      'email',
      user_id_2::text,
      now(),
      now(),
      now()
    );
  END IF;

  -- User 3: Additional test user for leaderboard/social features
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'competitor@example.com') THEN
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
      user_id_3,
      'authenticated',
      'authenticated',
      'competitor@example.com',
      crypt('password123', gen_salt('bf')),
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
      user_id_3,
      format('{"sub":"%s","email":"competitor@example.com"}', user_id_3)::jsonb,
      'email',
      user_id_3::text,
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- INSERT CHALLENGES
INSERT INTO public.challenges (
    id, date, unsplash_id, image_url, photographer_name, photographer_profile_url, photo_description, embedding
) VALUES
    -- YESTERDAY'S CHALLENGE
    (
      'c0000000-0000-0000-0000-000000000001',
      CURRENT_DATE - 1,
      'ukvgqriuOgo',
      'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'Henning Witzel',
      'https://unsplash.com/@henning',
      'Los Angeles by Night',
      (SELECT array_agg((0.1 + (i::float / 1000))::float4)::vector FROM generate_series(1, 512) AS i)
    ),
    -- TODAY'S CHALLENGE
    (
      'c0000000-0000-0000-0000-000000000002',
      CURRENT_DATE,
      'GA2y1XU9bIw',
      'https://images.unsplash.com/photo-1766864109448-3cb84647b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzY4MTY1MTA1fA&ixlib=rb-4.1.0&q=80&w=1080',
      'Maxim Tolchinskiy',
      'https://unsplash.com/@shaikhulud',
      'Snowy park path lined with lampposts at night',
      (SELECT array_agg((0.2 + (i::float / 1000))::float4)::vector FROM generate_series(1, 512) AS i)
    ),
    -- TOMORROW'S CHALLENGE (for testing date edge cases)
    (
      'c0000000-0000-0000-0000-000000000003',
      CURRENT_DATE + 1,
      'abcdefghijk',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop',
      'Future Photographer',
      'https://unsplash.com/@future',
      'Mountain landscape at sunset',
      (SELECT array_agg((0.3 + (i::float / 1000))::float4)::vector FROM generate_series(1, 512) AS i)
    );

-- INSERT GUESSES
-- User 2 (newuser@example.com) has no guesses - testing empty state
INSERT INTO public.guesses (
    id, user_id, challenge_id, prompt, image_url, score, attempt_number
) VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, 'Neon lights raining', 'https://placehold.co/600x400/png?text=Yesterday+Guess', 85, 1),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'Books on a shelf', 'https://placehold.co/600x400/png?text=Today+Attempt+1', 45, 1),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'Winter evening with street lamps', 'https://placehold.co/600x400/png?text=Today+Attempt+2', 67, 2),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'Snowy park at night with lampposts', 'https://placehold.co/600x400/png?text=Today+Attempt+3', 92, 3),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000003'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, 'City lights at night', 'https://placehold.co/600x400/png?text=Competitor+Yesterday', 76, 1),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000003'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'Night scene with snow', 'https://placehold.co/600x400/png?text=Competitor+Today', 96, 1);