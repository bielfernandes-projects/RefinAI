-- ============================================================
-- RefinAI - Supabase Schema
-- Projeto: bccjuxdwpgqhicgohtgi
-- Regiao: sa-east-1 (Sao Paulo)
-- ============================================================

-- Habilitar extensao necessaria
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROJECTS
-- ============================================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  context_json jsonb default '{
    "nicho": null,
    "stack": null,
    "team_size": null,
    "has_qa": false,
    "methodology": "scrum"
  }'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS: Apenas o dono acessa seus projetos
alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Trigger: updated_at automatico
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 2. PROJECT_STATUSES (Kanban customizavel por projeto)
-- ============================================================
create table public.project_statuses (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  name text not null,
  "order" int default 0 not null,
  color text default '#6366f1'::text not null,
  phase text check (phase in ('draft', 'refining', 'finished')) null,
  is_default boolean default false not null,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.project_statuses enable row level security;

create policy "Users can view own project statuses"
  on public.project_statuses for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_statuses.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage own project statuses"
  on public.project_statuses for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_statuses.project_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. DEMANDS (Unidade atomica: story, bug, task, epic)
-- ============================================================
create table public.demands (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  parent_demand_id uuid references public.demands on delete set null null,
  type text check (type in ('epic', 'story', 'bug', 'task')) default 'story' not null,
  status_id uuid references public.project_statuses not null,
  raw_input text null,
  refined_answers jsonb null,
  final_spec_markdown text null,
  rule_logic text null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.demands enable row level security;

create policy "Users can view own demands"
  on public.demands for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = demands.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage own demands"
  on public.demands for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = demands.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Trigger: updated_at
create trigger set_updated_at
  before update on public.demands
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4. PRIORITIZATION_SCORES (RICE + GUT paralelos)
-- ============================================================
create table public.prioritization_scores (
  id uuid default gen_random_uuid() primary key,
  demand_id uuid references public.demands on delete cascade not null unique,
  
  -- RICE (1-5 para reach/impact/confidence/effort)
  rice_reach int check (rice_reach between 1 and 5) null,
  rice_impact int check (rice_impact between 1 and 5) null,
  rice_confidence int check (rice_confidence between 1 and 100) null,
  rice_effort int check (rice_effort between 1 and 5) null,
  rice_score numeric generated always as 
    ((rice_reach * rice_impact * rice_confidence) / nullif(rice_effort, 0)) stored null,
  
  -- GUT (1-5 para gravity/urgency/tendency)
  gut_gravity int check (gut_gravity between 1 and 5) null,
  gut_urgency int check (gut_urgency between 1 and 5) null,
  gut_tendency int check (gut_tendency between 1 and 5) null,
  gut_score int generated always as 
    (gut_gravity * gut_urgency * gut_tendency) stored null,
  
  -- Sugestoes IA
  ai_justification jsonb null,
  
  created_at timestamptz default now() not null
);

-- RLS
alter table public.prioritization_scores enable row level security;

create policy "Users can view own priority scores"
  on public.prioritization_scores for select
  using (
    exists (
      select 1 from public.demands
      join public.projects on projects.id = demands.project_id
      where demands.id = prioritization_scores.demand_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage own priority scores"
  on public.prioritization_scores for all
  using (
    exists (
      select 1 from public.demands
      join public.projects on projects.id = demands.project_id
      where demands.id = prioritization_scores.demand_id
      and projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. ROADMAPS (Now/Next/Later + OKRs)
-- ============================================================
create table public.roadmaps (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  objective text not null,
  key_results text[] default '{}'::text[] not null,
  timeline jsonb default '{"now":[],"next":[],"later":[]}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.roadmaps enable row level security;

create policy "Users can view own roadmaps"
  on public.roadmaps for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = roadmaps.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage own roadmaps"
  on public.roadmaps for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = roadmaps.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Trigger: updated_at
create trigger set_updated_at
  before update on public.roadmaps
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 6. SIMULATOR_QUESTIONS (PSPO I/II seed)
-- ============================================================
create table public.simulator_questions (
  id uuid default gen_random_uuid() primary key,
  level text check (level in ('PSPO I', 'PSPO II')) not null,
  topic text check (topic in ('events', 'artifacts', 'roles', 'ebm', 'stakeholders', 'scaling')) not null,
  question_type text check (question_type in ('single_choice', 'multiple_choice')) not null,
  question_text text not null,
  options jsonb not null,
  explanation text not null,
  created_at timestamptz default now() not null
);

-- RLS (apenas leitura autenticada)
alter table public.simulator_questions enable row level security;

create policy "Authenticated users can read questions"
  on public.simulator_questions for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- 7. SIMULATOR_RESULTS
-- ============================================================
create table public.simulator_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  level text check (level in ('PSPO I', 'PSPO II')) not null,
  mode text check (mode in ('study', 'exam')) not null,
  score numeric not null,
  passed boolean not null,
  history_log jsonb not null default '[]'::jsonb,
  completed_at timestamptz default now() not null
);

-- RLS
alter table public.simulator_results enable row level security;

create policy "Users can view own results"
  on public.simulator_results for select
  using (auth.uid() = user_id);

create policy "Users can create own results"
  on public.simulator_results for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 8. USER_SETTINGS (BYOK, preferencias)
-- ============================================================
create table public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  gemini_api_key text null,
  openai_api_key text null,
  anthropic_api_key text null,
  default_project_id uuid references public.projects on delete set null null,
  theme text check (theme in ('dark', 'light', 'system')) default 'dark' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for all
  using (auth.uid() = user_id);

-- Trigger: updated_at
create trigger set_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 9. INDEXES (performance)
-- ============================================================
create index idx_projects_user_id on public.projects(user_id);
create index idx_demands_project_id on public.demands(project_id);
create index idx_demands_parent_id on public.demands(parent_demand_id);
create index idx_demands_status_id on public.demands(status_id);
create index idx_project_statuses_project_id on public.project_statuses(project_id);
create index idx_prioritization_demand_id on public.prioritization_scores(demand_id);
create index idx_roadmaps_project_id on public.roadmaps(project_id);
create index idx_simulator_results_user_id on public.simulator_results(user_id);
create index idx_simulator_results_level on public.simulator_results(level);
create index idx_user_settings_user_id on public.user_settings(user_id);
