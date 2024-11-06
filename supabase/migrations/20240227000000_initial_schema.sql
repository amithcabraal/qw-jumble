-- Drop existing objects if they exist
drop function if exists public.update_game_status;
drop function if exists public.submit_guess;
drop function if exists public.join_game;
drop table if exists public.games;

-- Create games table
create table public.games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null,
  word text not null check (length(word) = 5),
  status text not null check (status in ('waiting', 'playing', 'finished')),
  players jsonb not null default '[]'::jsonb,
  started_at bigint,
  ended_at bigint,
  winner jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.games enable row level security;

-- Create a single policy for anonymous access
create policy "Enable anonymous access"
  on public.games
  for all
  using (true)
  with check (true);

-- Create functions with proper security
create or replace function public.join_game(
  p_game_id uuid,
  p_player jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.games
  set players = players || p_player
  where id = p_game_id
  and status = 'waiting'
  and jsonb_array_length(players) < 8;
end;
$$;

create or replace function public.submit_guess(
  p_game_id uuid,
  p_player_id text,
  p_guess text,
  p_result jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_index integer;
  v_players jsonb;
  v_is_correct boolean;
begin
  select players into v_players
  from public.games
  where id = p_game_id
  and status = 'playing';

  select ordinality - 1 into v_player_index
  from jsonb_array_elements(v_players) with ordinality
  where value->>'id' = p_player_id;

  v_is_correct := not exists (
    select 1
    from jsonb_array_elements(p_result) r
    where r::text != '"correct"'
  );

  update public.games
  set players = jsonb_set(
    jsonb_set(
      jsonb_set(
        players,
        array[v_player_index::text, 'guesses'],
        coalesce(players->v_player_index->'guesses', '[]'::jsonb) || to_jsonb(p_guess)
      ),
      array[v_player_index::text, 'results'],
      coalesce(players->v_player_index->'results', '[]'::jsonb) || p_result
    ),
    array[v_player_index::text, 'solved'],
    to_jsonb(v_is_correct)
  ),
  winner = case
    when v_is_correct and winner is null
    then players->v_player_index
    else winner
  end
  where id = p_game_id
  and status = 'playing';
end;
$$;

create or replace function public.update_game_status(
  p_game_id uuid,
  p_status text,
  p_started_at bigint default null,
  p_ended_at bigint default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.games
  set status = p_status,
      started_at = coalesce(p_started_at, started_at),
      ended_at = coalesce(p_ended_at, ended_at)
  where id = p_game_id;
end;
$$;