-- ==============================================================================
-- Phonics Practice - Supabase Schema
-- 在 Supabase Dashboard -> SQL Editor 中直接粘贴并运行此脚本
-- ==============================================================================

-- 1. 创建练习集表 (practice_sets)
create table if not exists public.practice_sets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image text,
  words jsonb not null default '[]'::jsonb,
  completed_count integer default 0,
  created_at bigint not null,
  updated_at bigint not null
);

-- 2. 创建索引以优化用户查询性能
create index if not exists idx_practice_sets_user_id on public.practice_sets(user_id);
create index if not exists idx_practice_sets_updated_at on public.practice_sets(updated_at desc);

-- 3. 启用 Row Level Security (行级安全)
alter table public.practice_sets enable row level security;

-- 4. 配置 RLS 访问策略（确保每个登录用户只能读写删除自己的练习集）
drop policy if exists "Users can view own practice sets" on public.practice_sets;
create policy "Users can view own practice sets"
  on public.practice_sets
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own practice sets" on public.practice_sets;
create policy "Users can insert own practice sets"
  on public.practice_sets
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own practice sets" on public.practice_sets;
create policy "Users can update own practice sets"
  on public.practice_sets
  for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own practice sets" on public.practice_sets;
create policy "Users can delete own practice sets"
  on public.practice_sets
  for delete
  using (auth.uid() = user_id);

-- 5. 注释说明
comment on table public.practice_sets is '用户自建或保存的拼读练习集';
comment on column public.practice_sets.words is '练习集中的单词数组（包含音标、拆音、词义等 JSON 结构）';
