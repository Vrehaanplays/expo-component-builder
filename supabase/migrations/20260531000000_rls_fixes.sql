-- 1. Allow public scenario insertion (for client-side Gemini generation)
create policy "Anyone can insert scenarios" on public.scenarios
  for insert with check (true);

-- 2. Allow public daily challenges mapping insertion
create policy "Anyone can insert daily challenges" on public.daily_challenges
  for insert with check (true);

-- 3. Create helper function to safely delete mock users from client (security definer)
create or replace function public.clear_mock_users()
returns void as $$
begin
  delete from auth.users where email like '%@mock.gmj.com';
end;
$$ language plpgsql security definer;
