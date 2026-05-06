-- Migration 004: Admin permissions table
-- Allows super_admin to grant specific permissions to admin users

create table if not exists admin_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  permission text not null check (permission in (
    'manage_orders',
    'manage_products',
    'manage_stock',
    'manage_users',
    'view_analytics',
    'manage_withdrawals',
    'manage_referrers'
  )),
  granted_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(user_id, permission)
);

alter table admin_permissions enable row level security;

-- Super admin can manage all permissions
drop policy if exists "super_admin_manage_permissions" on admin_permissions;
create policy "super_admin_manage_permissions"
on admin_permissions
for all
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
);

-- Admins can read their own permissions
drop policy if exists "admins_read_own_permissions" on admin_permissions;
create policy "admins_read_own_permissions"
on admin_permissions
for select
using (user_id = auth.uid());
