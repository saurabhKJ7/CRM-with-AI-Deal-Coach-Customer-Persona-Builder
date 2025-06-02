-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUM types
create type deal_stage as enum ('lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
create type activity_type as enum ('call', 'email', 'meeting', 'task');
create type priority_type as enum ('low', 'medium', 'high');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Companies table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  industry text,
  website text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  description text,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contacts table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  company_id uuid references public.companies(id) on delete set null,
  status text,
  source text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deals table
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  amount numeric(12, 2),
  stage deal_stage not null default 'lead'::deal_stage,
  probability integer default 0,
  expected_close_date date,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activities table
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  subject text not null,
  type activity_type not null,
  due_date timestamp with time zone,
  completed boolean default false,
  priority priority_type default 'medium'::priority_type,
  description text,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes table (for both contacts and deals)
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index idx_contacts_email on public.contacts(email);
create index idx_contacts_company_id on public.contacts(company_id);
create index idx_deals_contact_id on public.deals(contact_id);
create index idx_deals_company_id on public.deals(company_id);
create index idx_activities_contact_id on public.activities(contact_id);
create index idx_activities_deal_id on public.activities(deal_id);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.notes enable row level security;

-- Helper function to check if user is authenticated
create or replace function public.is_authenticated()
returns boolean as $$
begin
  return auth.role() = 'authenticated';
end;
$$ language plpgsql security definer;

-- Helper function to check if user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user is owner or admin
create or replace function public.is_owner_or_admin(record_user_id uuid)
returns boolean as $$
begin
  return (
    auth.uid() = record_user_id or 
    public.is_admin()
  );
end;
$$ language plpgsql security definer;

-- Set up RLS policies for each table...
-- (We'll add these in the next step)

-- Create a trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up storage for file uploads
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Public Access" 
on storage.objects for select 
using (bucket_id = 'attachments');

create policy "Users can upload files"
on storage.objects for insert
with check (
  bucket_id = 'attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own files"
on storage.objects for update
using (
  bucket_id = 'attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own files"
on storage.objects for delete
using (
  bucket_id = 'attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);
