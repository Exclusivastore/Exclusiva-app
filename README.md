# Exclusiva — Catálogo de ropa

App real con dos partes:
- **`/catalogo`** → enlace público, cualquiera lo ve, sin login.
- **`/admin`** → panel privado para subir productos (requiere iniciar sesión).

Todo funciona con capas **gratuitas**: Supabase (base de datos + fotos + login) y Vercel (hosting).

---

## Paso 1 — Crear el proyecto en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta gratuita.
2. Clic en **New project**. Ponle un nombre (ej. "exclusiva") y una contraseña de base de datos (guárdala).
3. Espera 1-2 minutos a que el proyecto termine de crearse.

## Paso 2 — Crear la tabla y los permisos

1. En el menú izquierdo entra a **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia TODO su contenido, pégalo ahí y dale **Run**.
3. Esto crea automáticamente: la tabla `products`, el bucket de fotos `product-images`, y los permisos (cualquiera puede ver, solo tú puedes subir/borrar).

## Paso 3 — Crear tu usuario administrador

1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Pon tu correo y una contraseña. Desmarca "Send invitation" (créalo directo, sin correo de confirmación) o confírmalo si lo prefiere.
3. Con ese correo y contraseña vas a entrar luego en `/admin`.

## Paso 4 — Conectar tus claves

1. Ve a **Project Settings** (ícono de engranaje) → **API**.
2. Copia el **Project URL** y la clave **anon public**.
3. En este proyecto, duplica el archivo `.env.local.example`, renómbralo a `.env.local`, y pega ahí esos dos valores.

## Paso 5 — Probarlo en tu computadora (opcional)

Necesitas [Node.js](https://nodejs.org) instalado. Luego, en la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre http://localhost:3000/catalogo (público) y http://localhost:3000/admin (privado).

## Paso 6 — Publicarlo gratis en internet (GitHub Pages)

Este proyecto ya está configurado para publicarse como sitio estático en GitHub Pages, con un robot (GitHub Actions) que compila y publica automáticamente cada vez que subes cambios. Solo necesitas una cuenta de GitHub — nada de Vercel ni Netlify.

1. **Crea el repositorio.** En https://github.com, clic en **New repository**. Ponle un nombre, por ejemplo `exclusiva-app` (público o privado, ambos funcionan con GitHub Pages).
2. **Sube el código.** Desde la carpeta del proyecto en tu computadora:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Exclusiva"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/exclusiva-app.git
   git push -u origin main
   ```
3. **Guarda tus claves de Supabase como secretos** (así nunca quedan visibles en el código). En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**. Crea dos:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (los mismos valores de tu `.env.local`)
4. **Activa GitHub Pages.** En **Settings → Pages**, en "Source" elige **GitHub Actions**.
5. Listo. En cuanto hiciste `git push` en el paso 2, el archivo `.github/workflows/deploy.yml` ya se disparó solo: compiló el proyecto y lo publicó. Revisa la pestaña **Actions** de tu repo para ver el progreso (tarda 1-2 minutos).
6. Tu sitio queda en:
   - Pública: `https://TU-USUARIO.github.io/exclusiva-app/catalogo/`
   - Admin: `https://TU-USUARIO.github.io/exclusiva-app/admin/`

**De ahí en adelante**, cada vez que quieras cambiar algo del código, solo necesitas `git push` — el sitio se vuelve a compilar y publicar solo, sin que tengas que hacer nada más.

> **Importante sobre el nombre del repo:** si tu repositorio se llama distinto a `exclusiva-app`, la URL cambia automáticamente para coincidir (el workflow lo detecta solo). La única excepción es si tu repositorio se llama exactamente `TU-USUARIO.github.io` — en ese caso el sitio queda en la raíz (`https://TU-USUARIO.github.io/catalogo/`) sin sub-carpeta.

---

## Costo

Con tráfico normal de una tienda pequeña, esto se mantiene en **$0/mes**: GitHub Pages es gratis sin límite de tiempo, y Supabase free cubre lo básico (aunque se pausa tras 7 días sin uso — si necesitas que esté siempre activo, el plan Pro de Supabase es ~$25/mes). Si más adelante quieres un dominio propio (`exclusiva.com` en vez de `tuusuario.github.io`), eso sí tiene un costo aparte (~10-15 USD/año), pero es opcional y se puede conectar a GitHub Pages sin problema.

## Estructura del proyecto

```
exclusiva-app/
├── .github/workflows/deploy.yml → compila y publica solo en cada push
├── app/
│   ├── catalogo/page.js   → vista pública
│   ├── admin/page.js      → vista privada (login + subir productos)
│   ├── layout.js
│   └── globals.css
├── lib/supabaseClient.js  → conexión a Supabase
├── supabase/schema.sql    → tabla, bucket y permisos (pegar en SQL Editor)
├── .env.local.example
├── next.config.js         → configurado para exportar como sitio estático
└── package.json
```
