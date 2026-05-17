create extension if not exists "uuid-ossp";

-- Plans table (static catalog)
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_cents integer not null,
  interval text not null check (interval in ('month','year')),
  stripe_price_id text not null unique,
  description text,
  features jsonb,
  trial_days integer default 14   -- 14‑day trial for all plans
);

-- Subscriptions table tracking user plans
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  plan_id uuid references public.plans(id) not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for fast lookup
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
