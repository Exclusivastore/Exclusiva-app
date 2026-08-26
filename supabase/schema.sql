-- Ejecuta todo este archivo en Supabase > SQL Editor > New query > Run

-- 1. Tabla de productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text,
  category text default 'General',
  image_url text not null,
  created_at timestamptz default now()
);

-- 2. Activar seguridad a nivel de fila (RLS)
alter table products enable row level security;

-- 3. Cualquiera puede LEER el catálogo (el enlace público)
create policy "Cualquiera puede ver productos"
on products for select
to anon, authenticated
using (true);

-- 4. Solo un usuario autenticado (el administrador) puede crear productos
create policy "Solo admins autenticados pueden crear"
on products for insert
to authenticated
with check (true);

-- 5. Solo un usuario autenticado puede borrar productos
create policy "Solo admins autenticados pueden borrar"
on products for delete
to authenticated
using (true);

-- 6. Bucket de almacenamiento para las fotos (ejecutar una sola vez)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 7. Cualquiera puede VER las fotos (necesario para el catálogo público)
create policy "Fotos visibles para todos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

-- 8. Solo un admin autenticado puede subir fotos
create policy "Solo admins autenticados suben fotos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

-- 9. Solo un admin autenticado puede borrar fotos
create policy "Solo admins autenticados borran fotos"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');
