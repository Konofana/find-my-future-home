-- Map pins are intentionally separate from private address and coordinates.
alter table public.fmfh_properties
  add column map_lat double precision,
  add column map_lng double precision,
  add constraint fmfh_map_pair check ((map_lat is null and map_lng is null) or
    (map_lat between -90 and 90 and map_lng between -180 and 180));

create or replace view public.fmfh_public_properties
with (security_invoker = true) as
select id, title, description, property_type, status, monthly_rent, currency,
  bedrooms, bathrooms, city, region, country_code, location_visibility,
  furnished, parking, available_from, published_at, created_at,
  map_lat, map_lng, owner_id
from public.fmfh_properties
where status = 'published';

create table public.fmfh_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.fmfh_properties(id),
  sender_id uuid not null references auth.users(id),
  owner_id uuid not null references auth.users(id),
  contact_email text not null,
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now()
);
create index fmfh_inquiries_owner_date on public.fmfh_inquiries(owner_id, created_at desc);
create index fmfh_inquiries_sender_date on public.fmfh_inquiries(sender_id, created_at desc);
alter table public.fmfh_inquiries enable row level security;
revoke all on public.fmfh_inquiries from anon, authenticated;
grant select, insert, delete on public.fmfh_inquiries to authenticated;

create policy inquiries_read_parties on public.fmfh_inquiries for select to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = owner_id);
create policy inquiries_insert_for_published on public.fmfh_inquiries for insert to authenticated
with check (
  (select auth.uid()) = sender_id
  and sender_id <> owner_id
  and contact_email = (select auth.jwt() ->> 'email')
  and exists (select 1 from public.fmfh_properties p
    where p.id = property_id and p.owner_id = owner_id and p.status = 'published')
);
create policy inquiries_sender_delete on public.fmfh_inquiries for delete to authenticated
using ((select auth.uid()) = sender_id);
