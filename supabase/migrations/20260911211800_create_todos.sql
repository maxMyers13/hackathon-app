create table if not exists public.todos (
  id bigint generated always as identity primary key,
  title text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "Allow public read access"
  on public.todos for select
  using (true);

create policy "Allow public insert access"
  on public.todos for insert
  with check (true);

insert into public.todos (title, is_complete) values
  ('Set up Supabase', true),
  ('Build something great', false);
