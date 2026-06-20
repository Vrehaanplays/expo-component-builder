-- 1. Extend profiles table to support Gym modes
alter table public.profiles add column if not exists total_depth integer default 0;
alter table public.profiles add column if not exists acuity_score integer default 0;

-- 2. Create gym_sessions table
create table if not exists public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  mode text not null, -- 'debate' | 'steelman' | 'brainstorm' | 'solve'
  topic text not null,
  transcript jsonb not null, -- [{role: 'ai' | 'user', content: '...'}]
  depth_earned integer default 0,
  feedback_rubric jsonb, -- {score: integer, critique: text, strengths: text, gaps: text}
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable RLS on gym_sessions
alter table public.gym_sessions enable row level security;

-- Create RLS Policies for gym_sessions
create policy "Users can view their own gym sessions" on public.gym_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own gym sessions" on public.gym_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own gym sessions" on public.gym_sessions
  for update using (auth.uid() = user_id);

-- 3. Create scenario_feedback_cache table for caching AI-generated feedback
create table if not exists public.scenario_feedback_cache (
  scenario_id uuid references public.scenarios on delete cascade not null,
  choice_index integer not null,
  feedback_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (scenario_id, choice_index)
);

-- Enable RLS on scenario_feedback_cache
alter table public.scenario_feedback_cache enable row level security;

-- Create RLS Policies for scenario_feedback_cache
create policy "Feedback cache is viewable by everyone" on public.scenario_feedback_cache
  for select using (true);

create policy "Anyone can insert feedback cache" on public.scenario_feedback_cache
  for insert with check (true);
