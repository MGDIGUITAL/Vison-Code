# Vision Code — Landing Page

> Agente de desarrollo: instrucciones para Antigraviti

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 4.x |
| Estilos | Tailwind CSS 3.x |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | GitHub → Vercel / Netlify |
| IA assets | Imágenes y textos generados con IA |

---

## Estructura del Proyecto

```
D:\VISION CODE\
├── src/
│   ├── components/
│   │   ├── Navbar.astro       ← Navegación sticky con scroll effect
│   │   ├── Hero.astro         ← Sección hero con video de fondo
│   │   ├── Services.astro     ← Grid de servicios (6 cards)
│   │   ├── Pricing.astro      ← Planes y precios + extras
│   │   ├── Process.astro      ← Proceso de trabajo (6 pasos)
│   │   ├── Contact.astro      ← Formulario → Supabase
│   │   └── Footer.astro       ← Footer con contacto
│   ├── layouts/
│   │   └── Layout.astro       ← Layout base (SEO, fonts, globals)
│   └── pages/
│       └── index.astro        ← Página principal
├── public/
│   ├── images/
│   │   └── logo.png           ← ⚠️ COPIAR LOGO AQUÍ
│   └── videos/
│       └── HERO.mp4           ← ⚠️ COPIAR VIDEO HERO AQUÍ
├── supabase/
│   └── schema.sql             ← SQL para crear tabla contacts
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Setup Inicial

### 1. Instalar dependencias
```bash
cd "D:\VISION CODE"
npm install
```

### 2. Copiar archivos de media
```
D:\VISION CODE\VIDEO PARA HERO\HERO.mp4
  → copiar a: public/videos/HERO.mp4

Logo de Vision Code (archivo PNG/SVG)
  → copiar a: public/images/logo.png
```

### 3. Configurar Supabase
1. Ir a [app.supabase.com](https://app.supabase.com) → tu proyecto
2. SQL Editor → ejecutar `supabase/schema.sql`
3. Settings → API → copiar credenciales
4. Editar `src/components/Contact.astro` líneas:
   ```js
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGci...';
   ```

### 4. Desarrollo local
```bash
npm run dev
# → http://localhost:4321
```

### 5. Build producción
```bash
npm run build
# → genera carpeta dist/
```

---

## Paleta de Colores Oficial

| Nombre | Hex | Uso |
|--------|-----|-----|
| brand-red | `#8B1A2B` | Acento principal, CTAs |
| brand-red-light | `#A52030` | Hover estados |
| brand-black | `#0f0f0f` | Fondo principal |
| brand-dark | `#1a1a1a` | Cards, secciones alternas |
| brand-gray | `#2d2d2d` | Bordes, separadores |
| white | `#FFFFFF` | Texto principal |

---

## Tipografía

- **Display:** Playfair Display (Google Fonts) — headings, números grandes
- **Body:** Inter (Google Fonts) — todo el resto

---

## Secciones de la Landing

1. **Navbar** — fixed, transparente → oscurece al scroll
2. **Hero** — video HERO.mp4 de fondo, headline + CTA
3. **Servicios** (#servicios) — 6 cards de servicios
4. **Planes** (#planes) — 4 planes + tabla de extras
5. **Proceso** (#proceso) — 6 pasos de trabajo
6. **Contacto** (#contacto) — formulario + datos de contacto
7. **Footer** — links, contacto, copyright

---

## Datos de Contacto (ya configurados)

- **Teléfono:** +56 2 9645522
- **Email:** Vision.code.vs@gmail.com
- **Ubicación:** Región de Valparaíso, Chile

---

## Tareas Pendientes (para Antigraviti)

- [ ] Copiar `HERO.mp4` a `public/videos/`
- [ ] Copiar logo PNG a `public/images/logo.png`
- [ ] Ejecutar `supabase/schema.sql` en Supabase
- [ ] Reemplazar credenciales Supabase en `Contact.astro`
- [ ] Agregar productos desde `D:\VISION CODE\PRODUCTOS`
- [ ] Configurar dominio en hosting
- [ ] Conectar Google Analytics (ID en Layout.astro)
- [ ] Push a GitHub y deploy en Vercel/Netlify

---

## Comandos Útiles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build producción
npm run preview    # Preview del build
```

---

## Repositorio GitHub

Crear repo en GitHub llamado `visioncode-landing` y conectar:

```bash
git init
git add .
git commit -m "feat: landing page inicial Vision Code"
git remote add origin https://github.com/TU_USUARIO/visioncode-landing.git
git push -u origin main
```

---

*Desarrollado para Vision Code — Valparaíso, Chile*
