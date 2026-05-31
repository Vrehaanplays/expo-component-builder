-- 1. Create policy to allow users to delete their own sessions (required for Reset Stats button)
create policy "Users can delete their own sessions" on public.sessions
  for delete using (auth.uid() = user_id);

-- 2. Create helper function to seed mock leaderboard data
create or replace function public.seed_leaderboard()
returns void as $$
declare
  new_id uuid;
  usernames text[] := array['logic_ninja', 'steelman_pro', 'bias_hunter', 'fallacy_cop', 'reason_king', 'dialect_queen', 'judgment_day', 'sharp_thinker', 'mind_gym_guy', 'rational_prime'];
  shards integer[] := array[12500, 8400, 6200, 4800, 3100, 2400, 1850, 1200, 750, 300];
  streaks integer[] := array[14, 9, 7, 12, 4, 6, 8, 3, 5, 2];
  accuracies double precision[] := array[92.5, 87.0, 81.2, 85.5, 76.0, 78.4, 80.0, 69.5, 72.0, 60.0];
  sessions integer[] := array[45, 32, 28, 25, 18, 15, 12, 10, 8, 5];
  i integer;
begin
  -- Clear previous mock users if any
  delete from auth.users where email like '%@mock.gmj.com';

  for i in 1..10 loop
    new_id := gen_random_uuid();
    -- Insert user into auth.users (to satisfy foreign key)
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
    values (
      new_id,
      usernames[i] || '@mock.gmj.com',
      '$2a$10$abcdefghijklmnopqrstuv', -- placeholder encrypted password
      now(),
      jsonb_build_object('username', usernames[i]),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
    
    -- The trigger public.handle_new_user() will automatically insert a row in public.profiles.
    -- We update that profile with our desired mock stats.
    update public.profiles
    set
      username = usernames[i],
      total_shards = shards[i],
      current_streak = streaks[i],
      longest_streak = streaks[i] + 2,
      sessions_played = sessions[i],
      accuracy_percent = accuracies[i]
    where id = new_id;
  end loop;
end;
$$ language plpgsql security definer;
