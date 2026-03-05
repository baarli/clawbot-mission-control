-- ============================================================
-- ClawBot Mission Control — Supabase PostgreSQL Schema
-- ============================================================
-- Run this in your Supabase SQL Editor to bootstrap the database.
-- All tables use Row Level Security (RLS) with role-based access.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_stat_statements";

-- ── Enums ───────────────────────────────────────────────────
create type robot_status     as enum ('online', 'offline', 'idle', 'busy', 'error', 'maintenance');
create type task_status      as enum ('pending', 'planned', 'in-progress', 'completed', 'failed', 'aborted');
create type task_priority    as enum ('low', 'medium', 'high', 'critical');
create type command_status   as enum ('queued', 'sent', 'executed', 'failed', 'cancelled');
create type alert_severity   as enum ('info', 'warning', 'critical', 'success');
create type user_role        as enum ('viewer', 'operator', 'admin');

-- ============================================================
-- ROBOTS
-- ============================================================
create table if not exists public.robots (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  model             text not null default 'KimiClaw MK-III',
  firmware_version  text not null default '3.4.1',
  serial_number     text unique not null,
  status            robot_status not null default 'offline',
  battery           numeric(5,2) check (battery >= 0 and battery <= 100),
  location          text,
  ip_address        text,
  connected         boolean not null default false,
  uptime            integer not null default 0,       -- seconds
  last_seen         timestamptz,
  api_key           text unique,                       -- for robot-side auth
  metadata          jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_robots_status on public.robots(status);
create index idx_robots_serial on public.robots(serial_number);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.robots enable row level security;

create policy "viewers can read robots"
  on public.robots for select
  using (auth.role() = 'authenticated');

create policy "operators can update robot status"
  on public.robots for update
  using (auth.role() = 'authenticated');

create policy "robots can upsert themselves via api_key"
  on public.robots for all
  using (api_key = current_setting('request.headers')::json->>'x-robot-key');

-- ============================================================
-- TELEMETRY
-- ============================================================
create table if not exists public.telemetry (
  id                uuid primary key default uuid_generate_v4(),
  robot_id          uuid not null references public.robots(id) on delete cascade,
  timestamp         timestamptz not null default now(),
  battery           numeric(5,2),
  temperature       numeric(5,2),
  cpu_load          numeric(5,2),
  network_latency   numeric(8,2),
  claw_pressure     numeric(8,2),
  joint_positions   jsonb,                             -- {shoulder, elbow, wrist, claw}
  position          jsonb,                             -- {x, y, z}
  errors            jsonb default '[]'::jsonb,
  raw               jsonb                              -- full SDK payload
);

-- Partition by day for large datasets (optional, requires pg_partman)
-- Use a retention policy to auto-delete data older than 30 days
create index idx_telemetry_robot_time on public.telemetry(robot_id, timestamp desc);
create index idx_telemetry_timestamp  on public.telemetry(timestamp desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.telemetry enable row level security;

create policy "authenticated users can read telemetry"
  on public.telemetry for select
  using (auth.role() = 'authenticated');

create policy "robots can insert telemetry"
  on public.telemetry for insert
  with check (true);     -- validated at API/edge function level

-- ── Retention function (call via cron) ──────────────────────
create or replace function public.cleanup_old_telemetry()
returns void language plpgsql as $$
begin
  delete from public.telemetry
  where timestamp < now() - interval '30 days';
end;
$$;

-- ============================================================
-- COMMANDS
-- ============================================================
create table if not exists public.commands (
  id            uuid primary key default uuid_generate_v4(),
  robot_id      uuid not null references public.robots(id) on delete cascade,
  issued_by     uuid references auth.users(id),
  command       text not null,
  payload       jsonb default '{}'::jsonb,
  status        command_status not null default 'queued',
  description   text,
  result        jsonb,
  error         text,
  queued_at     timestamptz not null default now(),
  sent_at       timestamptz,
  executed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_commands_robot_status on public.commands(robot_id, status);
create index idx_commands_created      on public.commands(created_at desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.commands enable row level security;

create policy "authenticated users can read commands"
  on public.commands for select
  using (auth.role() = 'authenticated');

create policy "operators can insert commands"
  on public.commands for insert
  with check (auth.role() = 'authenticated');

create policy "robots can update command status"
  on public.commands for update
  using (true);   -- validated at edge function level

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists public.tasks (
  id                  uuid primary key default uuid_generate_v4(),
  robot_id            uuid not null references public.robots(id) on delete cascade,
  created_by          uuid references auth.users(id),
  title               text not null,
  command             text not null,
  description         text,
  status              task_status not null default 'pending',
  priority            task_priority not null default 'medium',
  tags                text[] default '{}',
  assignee            text,
  estimated_duration  integer,                          -- minutes
  actual_duration     integer,                          -- minutes
  error               text,
  notes               text,
  metadata            jsonb,
  scheduled_at        timestamptz,
  started_at          timestamptz,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_tasks_robot_status   on public.tasks(robot_id, status);
create index idx_tasks_priority       on public.tasks(priority, created_at desc);
create index idx_tasks_scheduled      on public.tasks(scheduled_at) where scheduled_at is not null;

-- ── RLS ─────────────────────────────────────────────────────
alter table public.tasks enable row level security;

create policy "authenticated users can read tasks"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "operators can manage tasks"
  on public.tasks for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- ALERTS
-- ============================================================
create table if not exists public.alerts (
  id              uuid primary key default uuid_generate_v4(),
  robot_id        uuid references public.robots(id) on delete set null,
  severity        alert_severity not null default 'info',
  message         text not null,
  source          text,                                 -- e.g. 'telemetry', 'task', 'system'
  acknowledged    boolean not null default false,
  acknowledged_by uuid references auth.users(id),
  acknowledged_at timestamptz,
  resolved        boolean not null default false,
  resolved_at     timestamptz,
  metadata        jsonb,
  timestamp       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index idx_alerts_severity  on public.alerts(severity, acknowledged);
create index idx_alerts_robot     on public.alerts(robot_id, timestamp desc);
create index idx_alerts_timestamp on public.alerts(timestamp desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.alerts enable row level security;

create policy "authenticated users can read alerts"
  on public.alerts for select
  using (auth.role() = 'authenticated');

create policy "system can insert alerts"
  on public.alerts for insert
  with check (true);

create policy "operators can acknowledge alerts"
  on public.alerts for update
  using (auth.role() = 'authenticated');

-- ============================================================
-- VOICE LOGS
-- ============================================================
create table if not exists public.voice_logs (
  id          uuid primary key default uuid_generate_v4(),
  robot_id    uuid references public.robots(id) on delete set null,
  user_id     uuid references auth.users(id),
  transcript  text not null,
  command     text,
  confidence  numeric(4,3),                            -- 0.0 – 1.0
  executed    boolean not null default false,
  response    text,
  duration_ms integer,
  timestamp   timestamptz not null default now()
);

create index idx_voice_logs_robot     on public.voice_logs(robot_id, timestamp desc);
create index idx_voice_logs_timestamp on public.voice_logs(timestamp desc);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.voice_logs enable row level security;

create policy "authenticated users can read voice logs"
  on public.voice_logs for select
  using (auth.role() = 'authenticated');

create policy "authenticated users can insert voice logs"
  on public.voice_logs for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- USER PROFILES & ROLES
-- ============================================================
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role        user_role not null default 'viewer',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "users can read all profiles"
  on public.user_profiles for select
  using (auth.role() = 'authenticated');

create policy "users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "admins can update any profile"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── Auto-create profile on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime on key tables
-- ============================================================
alter publication supabase_realtime add table public.telemetry;
alter publication supabase_realtime add table public.commands;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.robots;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_robots_updated_at
  before update on public.robots
  for each row execute procedure public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- VIEWS
-- ============================================================

-- Latest telemetry per robot
create or replace view public.latest_telemetry as
select distinct on (robot_id) *
from public.telemetry
order by robot_id, timestamp desc;

-- Fleet summary
create or replace view public.fleet_summary as
select
  r.id,
  r.name,
  r.status,
  r.battery,
  r.location,
  r.last_seen,
  count(t.id)   filter (where t.status = 'completed') as tasks_completed,
  count(t.id)   filter (where t.status = 'failed')    as tasks_failed,
  count(t.id)   filter (where t.status in ('pending','in-progress','planned')) as tasks_active,
  count(a.id)   filter (where a.acknowledged = false and a.severity = 'critical') as critical_alerts
from public.robots r
left join public.tasks  t on t.robot_id = r.id
left join public.alerts a on a.robot_id = r.id
group by r.id;

-- ============================================================
-- SEED DATA (Development only — delete before production)
-- ============================================================
-- insert into public.robots (name, model, serial_number, status, battery, location, ip_address, connected)
-- values ('ClawBot Alpha', 'KimiClaw MK-III', 'KB-2024-001', 'online', 78, 'Lab 1 — Bay A', '192.168.1.45', true);
