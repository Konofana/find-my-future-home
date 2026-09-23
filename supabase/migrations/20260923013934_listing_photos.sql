-- Public rental photos are uploaded only by the listing's owner.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fmfh-property-photos', 'fmfh-property-photos', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create table public.fmfh_property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.fmfh_properties(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  constraint photo_path_for_property check (
    storage_path ~ ('^[0-9a-f-]{36}/' || property_id::text || '/[0-9a-f-]{36}[.](jpg|png|webp)$'))
);
create index fmfh_property_photos_property on public.fmfh_property_photos(property_id, created_at);
alter table public.fmfh_property_photos enable row level security;
revoke all on public.fmfh_property_photos from anon, authenticated;
grant select on public.fmfh_property_photos to anon;
grant select, insert, delete on public.fmfh_property_photos to authenticated;

create policy property_photos_read on public.fmfh_property_photos for select to anon, authenticated
using (exists (select 1 from public.fmfh_properties p where p.id = property_id
  and (p.status = 'published' or p.owner_id = (select auth.uid()))));
create policy property_photos_insert on public.fmfh_property_photos for insert to authenticated
with check (exists (select 1 from public.fmfh_properties p where p.id = property_id
  and p.owner_id = (select auth.uid()))
  and split_part(storage_path, '/', 1) = (select auth.uid())::text);
create policy property_photos_delete on public.fmfh_property_photos for delete to authenticated
using (exists (select 1 from public.fmfh_properties p where p.id = property_id
  and p.owner_id = (select auth.uid())));

create policy fmfh_photo_upload on storage.objects for insert to authenticated
with check (bucket_id = 'fmfh-property-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.fmfh_properties p
    where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid())));
create policy fmfh_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'fmfh-property-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.fmfh_properties p
    where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid())));
