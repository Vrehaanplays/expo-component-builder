-- Create public.profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  total_shards integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  sessions_played integer default 0,
  accuracy_percent double precision default 0,
  rank_position integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create public.scenarios
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  difficulty text not null,
  scenario_text text not null,
  options jsonb not null,
  correct_option integer not null,
  explanation text not null,
  is_daily boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on scenarios
alter table public.scenarios enable row level security;

create policy "Scenarios are viewable by everyone" on public.scenarios
  for select using (true);

-- Create public.sessions (user game plays)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  scenario_id uuid references public.scenarios on delete cascade not null,
  answer_index integer not null,
  is_correct boolean not null,
  shards_earned integer not null,
  response_time_ms integer not null,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on sessions
alter table public.sessions enable row level security;

create policy "Users can view their own sessions" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions" on public.sessions
  for insert with check (auth.uid() = user_id);

-- Create public.daily_challenges
create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  scenario_ids jsonb not null
);

-- Enable RLS on daily_challenges
alter table public.daily_challenges enable row level security;

create policy "Daily challenges are viewable by everyone" on public.daily_challenges
  for select using (true);

-- Automatically create profile row when user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, total_shards, current_streak, longest_streak, sessions_played, accuracy_percent)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    0,
    0,
    0,
    0,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
