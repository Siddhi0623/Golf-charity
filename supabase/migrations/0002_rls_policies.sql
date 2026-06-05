-- =============================================================
-- 0002_rls_policies.sql
-- Row-Level Security policies. Defense in depth: app code AND
-- database enforce the same rules.
-- =============================================================

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- PROFILES ----------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (auth.uid() = id or is_admin());

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

create policy "profiles_admin_update_any"
  on profiles for update
  using (is_admin())
  with check (is_admin());

-- CHARITIES ---------------------------------------------------
alter table charities enable row level security;

create policy "charities_public_read_active"
  on charities for select
  using (is_active or is_admin());

create policy "charities_admin_write"
  on charities for all
  using (is_admin())
  with check (is_admin());

-- USER_CHARITIES ----------------------------------------------
alter table user_charities enable row level security;

create policy "user_charities_select_own_or_admin"
  on user_charities for select
  using (auth.uid() = user_id or is_admin());

create policy "user_charities_insert_own"
  on user_charities for insert
  with check (auth.uid() = user_id);

create policy "user_charities_update_own"
  on user_charities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_charities_delete_own"
  on user_charities for delete
  using (auth.uid() = user_id);

-- SUBSCRIPTIONS -----------------------------------------------
-- Reads: own or admin. Writes: service_role only (server actions
-- using the admin client, or future Stripe webhook).
alter table subscriptions enable row level security;

create policy "subs_select_own_or_admin"
  on subscriptions for select
  using (auth.uid() = user_id or is_admin());

create policy "subs_admin_write"
  on subscriptions for all
  using (is_admin())
  with check (is_admin());

-- SCORES ------------------------------------------------------
alter table scores enable row level security;

create policy "scores_select_own_or_admin"
  on scores for select
  using (auth.uid() = user_id or is_admin());

create policy "scores_insert_own"
  on scores for insert
  with check (auth.uid() = user_id);

create policy "scores_update_own"
  on scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "scores_delete_own"
  on scores for delete
  using (auth.uid() = user_id);

-- DRAWS -------------------------------------------------------
alter table draws enable row level security;

create policy "draws_public_read_published"
  on draws for select
  using (status = 'PUBLISHED' or is_admin());

create policy "draws_admin_write"
  on draws for all
  using (is_admin())
  with check (is_admin());

-- WINNERS -----------------------------------------------------
alter table winners enable row level security;

create policy "winners_select_own_or_admin"
  on winners for select
  using (auth.uid() = user_id or is_admin());

-- Winners are inserted by SECURITY DEFINER function (compute_winners)
-- so only proof uploads update the row from the user side.
create policy "winners_update_proof_own"
  on winners for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    -- user may not change critical fields
    and verification = (select verification from winners w where w.id = winners.id)
    and match_count  = (select match_count  from winners w where w.id = winners.id)
    and prize_amount = (select prize_amount from winners w where w.id = winners.id)
  );

create policy "winners_admin_write"
  on winners for all
  using (is_admin())
  with check (is_admin());

-- PAYOUTS -----------------------------------------------------
alter table payouts enable row level security;

create policy "payouts_select_own_or_admin"
  on payouts for select
  using (
    is_admin()
    or exists(
      select 1 from winners w
      where w.id = payouts.winner_id and w.user_id = auth.uid()
    )
  );

create policy "payouts_admin_write"
  on payouts for all
  using (is_admin())
  with check (is_admin());

-- NOTIFICATIONS ----------------------------------------------
alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own_read"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- STORAGE policies -------------------------------------------
-- The buckets themselves are created via the Supabase dashboard
-- (or `supabase storage create`). These policies apply once they exist.
--
-- charity-images: public read, admin write
-- winner-proofs:  owner+admin read, owner+admin write
-- user-avatars:   public read, owner write

-- charity-images
create policy "charity_images_public_read"
  on storage.objects for select
  using (bucket_id = 'charity-images');

create policy "charity_images_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'charity-images' and is_admin());

create policy "charity_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'charity-images' and is_admin());

create policy "charity_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'charity-images' and is_admin());

-- winner-proofs (object name prefix should be <user_id>/...)
create policy "winner_proofs_owner_or_admin_read"
  on storage.objects for select
  using (
    bucket_id = 'winner-proofs'
    and (is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

create policy "winner_proofs_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'winner-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "winner_proofs_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'winner-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- user-avatars (object name prefix should be <user_id>/...)
create policy "user_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "user_avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
