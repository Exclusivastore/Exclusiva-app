/** @type {import('next').NextConfig} */

// En GitHub Pages, un repo normal se publica en tuusuario.github.io/nombre-del-repo/
// así que la app necesita saber ese "sub-camino" (basePath) para armar bien los enlaces.
// El workflow de GitHub Actions lo define automáticamente con el nombre real del repositorio.
// Si tu repo se llama exactamente "tuusuario.github.io" (sitio raíz), este valor debe quedar vacío.
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig = {
  output: "export", // genera archivos HTML/CSS/JS estáticos en vez de necesitar un servidor
  trailingSlash: true, // necesario para que las rutas funcionen bien como sitio estático
  images: {
    unoptimized: true, // GitHub Pages no puede optimizar imágenes al vuelo como Vercel
  },
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
