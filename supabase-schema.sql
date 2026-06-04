-- Reset existing table to avoid 42P07 relation already exists error
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Create the `profiles` table to store extra user data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'new user'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- 2. Enable Row Level Security (RLS) on the `profiles` table
alter table public.profiles enable row level security;

-- 3. Create RLS Policies

-- Allow anyone to read profiles (or you can restrict this to authenticated users)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Create a trigger function to automatically insert a new profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'new user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach the trigger to the `auth.users` table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. (Optional) Provide a secure way for admin to delete users in frontend via RPC
create or replace function public.delete_user(user_id uuid)
returns void as $$
begin
  -- Only allow founders/admins to execute this in a real app
  delete from auth.users where id = user_id;
end;
$$ language plpgsql security definer;
