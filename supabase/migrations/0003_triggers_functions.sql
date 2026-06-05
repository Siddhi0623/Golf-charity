-- =============================================================
-- 0003_triggers_functions.sql
-- Business logic encoded in the database:
--  - profile bootstrap on signup
--  - cap scores at 5 newest per user
--  - subscription lifecycle (auto-expire)
--  - draw publish RPC (winner detection + prize allocation)
-- =============================================================

-- VALIDATE winning_numbers on draws ---------------------------
-- Postgres forbids subqueries in CHECK constraints, so we
-- enforce range (1–45) and uniqueness in a BEFORE INSERT/UPDATE
-- trigger instead.
create or replace function validate_winning_numbers()
returns trigger
language plpgsql
as $$
begin
  if new.winning_numbers is null then
    return new;
  end if;

  -- Range check
  if exists (
    select 1 from unnest(new.winning_numbers) n where n < 1 or n > 45
  ) then
    raise exception 'winning_numbers must be between 1 and 45';
  end if;

  -- Uniqueness check
  if (
    select count(*) from unnest(new.winning_numbers) n
  ) <> (
    select count(distinct n) from unnest(new.winning_numbers) n
  ) then
    raise exception 'winning_numbers must be unique';
  end if;

  return new;
end $$;

drop trigger if exists trg_validate_winning_numbers on draws;
create trigger trg_validate_winning_numbers
  before insert or update of winning_numbers on draws
  for each row execute function validate_winning_numbers();

-- AUTO-PROFILE on signup --------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- TRIM SCORES to latest 5 per user ----------------------------
create or replace function trim_scores_to_five()
returns trigger
language plpgsql
as $$
begin
  delete from scores
  where id in (
    select id from scores
    where user_id = new.user_id
    order by created_at desc, id desc
    offset 5
  );
  return new;
end $$;

drop trigger if exists trg_trim_scores on scores;
create trigger trg_trim_scores
  after insert on scores
  for each row execute function trim_scores_to_five();

-- SUBSCRIPTION AUTO-EXPIRE ------------------------------------
-- Lightweight: called on read paths via the app. For a stricter
-- guarantee, schedule this with pg_cron daily.
create or replace function expire_subscriptions()
returns int
language sql
as $$
  with updated as (
    update subscriptions
       set status = 'EXPIRED'
     where status = 'ACTIVE'
       and expiry_date < now()
     returning 1
  )
  select count(*)::int from updated;
$$;

-- PUBLISH DRAW: compute winners + prize allocation ------------
-- Inputs: p_draw_id. The draw row must already have
-- winning_numbers set and status='DRAFT'.
--
-- Algorithm:
--  1. Capture the prize pool already stored on the draw row
--     (pool_total + jackpot_carry_in). The pool is computed by
--     the application before calling this function — see
--     lib/draw/prize.ts — because it depends on subscription
--     prices and snapshotted contribution_pct values.
--  2. For each user with at least 1 of their scores in the
--     winning_numbers array, classify match_count as
--     3 / 4 / 5 (exactly).
--  3. Allocate tier pools: 5=40%, 4=35%, 3=25%.
--     - If no 5-match winners: 5-tier rolls to jackpot_carry_out
--       (and 4- and 3-tier still pay).
--     - Within a tier, split equally.
--  4. Insert winner rows; create PENDING payouts for each.
--  5. Mark draw PUBLISHED, set published_at.
-- =============================================================
create or replace function publish_draw(p_draw_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draw          draws%rowtype;
  v_pool          numeric(12,2);
  v_tier5_pool    numeric(12,2);
  v_tier4_pool    numeric(12,2);
  v_tier3_pool    numeric(12,2);
  v_count5        int;
  v_count4        int;
  v_count3        int;
  v_carry_out     numeric(12,2) := 0;
  v_prize5_each   numeric(12,2) := 0;
  v_prize4_each   numeric(12,2) := 0;
  v_prize3_each   numeric(12,2) := 0;
begin
  -- Admin check is enforced in the calling server action
  -- (requireRole("ADMIN")). Skipped here because the RPC is invoked
  -- via the service_role key, which has no auth.uid() — is_admin()
  -- would always return false.

  select * into v_draw from draws where id = p_draw_id for update;
  if not found then
    raise exception 'publish_draw: draw % not found', p_draw_id;
  end if;
  if v_draw.status <> 'DRAFT' then
    raise exception 'publish_draw: draw % is not DRAFT (status=%)', p_draw_id, v_draw.status;
  end if;
  if v_draw.winning_numbers is null then
    raise exception 'publish_draw: draw % has no winning_numbers', p_draw_id;
  end if;

  v_pool := coalesce(v_draw.pool_total, 0) + coalesce(v_draw.jackpot_carry_in, 0);

  -- Build per-user match counts using a temp set.
  create temp table _matches on commit drop as
  select
    s.user_id,
    count(*)::int as match_n
  from scores s
  where s.score = any (v_draw.winning_numbers)
    -- Each distinct winning number contributes at most once per user.
    -- DISTINCT ensures multiple scores with the same value don't double-count.
  group by s.user_id;

  -- Recompute with DISTINCT semantics (count distinct winning numbers matched
  -- per user, not total score rows). The query above can over-count if a user
  -- has duplicate score values, so collapse via DISTINCT score.
  delete from _matches;
  insert into _matches(user_id, match_n)
  select
    s.user_id,
    count(distinct s.score)::int as match_n
  from scores s
  where s.score = any (v_draw.winning_numbers)
  group by s.user_id
  having count(distinct s.score) >= 3;

  -- Tier pool allocation.
  v_tier5_pool := v_pool * 0.40;
  v_tier4_pool := v_pool * 0.35;
  v_tier3_pool := v_pool * 0.25;

  select count(*) into v_count5 from _matches where match_n = 5;
  select count(*) into v_count4 from _matches where match_n = 4;
  select count(*) into v_count3 from _matches where match_n = 3;

  if v_count5 > 0 then
    v_prize5_each := round(v_tier5_pool / v_count5, 2);
  else
    -- No 5-match: that tier rolls over.
    v_carry_out := v_carry_out + v_tier5_pool;
  end if;

  if v_count4 > 0 then
    v_prize4_each := round(v_tier4_pool / v_count4, 2);
  end if;

  if v_count3 > 0 then
    v_prize3_each := round(v_tier3_pool / v_count3, 2);
  end if;

  -- Insert winner rows.
  insert into winners (draw_id, user_id, match_count, prize_amount)
  select
    p_draw_id,
    m.user_id,
    case m.match_n when 5 then 'FIVE'::match_count
                   when 4 then 'FOUR'::match_count
                   else 'THREE'::match_count end,
    case m.match_n when 5 then v_prize5_each
                   when 4 then v_prize4_each
                   else v_prize3_each end
  from _matches m;

  -- Auto-create PENDING payouts.
  insert into payouts (winner_id, amount, status)
  select id, prize_amount, 'PENDING'
  from winners
  where draw_id = p_draw_id;

  -- Persist results on the draw row.
  update draws
     set status            = 'PUBLISHED',
         jackpot_carry_out = v_carry_out,
         published_at      = now()
   where id = p_draw_id;

  -- Notifications fan-out for winners.
  insert into notifications (user_id, kind, payload)
  select
    w.user_id,
    'YOU_WON',
    jsonb_build_object(
      'draw_id', p_draw_id,
      'match_count', w.match_count,
      'prize_amount', w.prize_amount
    )
  from winners w
  where w.draw_id = p_draw_id;
end $$;
