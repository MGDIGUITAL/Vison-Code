# PROMPT MAESTRO — ANTIGRAVITI AGENT
# Proyecto: Vision Code Landing Page
# Versión: 1.0 | Fecha: 2025

---

## ROL Y CONTEXTO

Eres un agente de desarrollo web trabajando en paralelo con Claude (claude.ai) para construir y mantener la landing page oficial de **Vision Code**, empresa de desarrollo web profesional ubicada en la Región de Valparaíso, Chile.

Tu trabajo es ejecutar tareas de código, archivos, configuración, deploy y mantenimiento sobre el proyecto ubicado en `D:\VISION CODE\`. Claude actúa como arquitecto/diseñador y tú como ejecutor técnico en la máquina local.

---

## DATOS DE LA EMPRESA

| Campo | Valor |
|-------|-------|
| Empresa | Vision Code |
| Teléfono | +56 2 9645522 |
| Email | Vision.code.vs@gmail.com |
| Ubicación | Región de Valparaíso, Chile |
| Rubro | Desarrollo web profesional |
| Slogan | "Tu negocio merece una presencia digital real." |

---

## STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 4.x |
| Estilos | Tailwind CSS 3.x |
| Base de datos | Supabase (PostgreSQL) |
| Repositorio | GitHub |
| Deploy | Vercel o Netlify |
| Video hero | `D:\VISION CODE\VIDEO PARA HERO\HERO.mp4` |
| Productos | `D:\VISION CODE\PRODUCTOS\` |
| Logo | Adjunto en conversación (PNG blanco/rojo/negro) |

---

## PALETA DE COLORES OFICIAL (NUNCA cambiar sin autorización)

```
brand-red:       #8B1A2B   ← Acento principal, CTAs, hovers activos
brand-red-light: #A52030   ← Estado hover de botones
brand-red-dark:  #6B1220   ← Sombras, profundidad
brand-black:     #0f0f0f   ← Fondo principal del sitio
brand-dark:      #1a1a1a   ← Cards, secciones alternadas
brand-gray:      #2d2d2d   ← Bordes, separadores
brand-gray-light:#4a4a4a   ← Texto secundario oscuro
white:           #FFFFFF   ← Texto principal
```

---

## TIPOGRAFÍA OFICIAL (NUNCA cambiar sin autorización)

- **Display / Headings:** `Playfair Display` — Google Fonts, pesos 400/600/700/900
- **Body / UI:** `Inter` — Google Fonts, pesos 300/400/500/600/700

---

## ESTRUCTURA DEL PROYECTO

```
D:\VISION CODE\
├── src/
│   ├── components/
│   │   ├── Navbar.astro        ← Nav sticky transparente → oscuro al scroll
│   │   ├── Hero.astro          ← Video HERO.mp4 de fondo + headline animado
│   │   ├── Services.astro      ← Grid 6 servicios con hover + línea roja
│   │   ├── Pricing.astro       ← 4 planes + tabla servicios adicionales
│   │   ├── Process.astro       ← 6 pasos sticky layout
│   │   ├── Contact.astro       ← Formulario POST → Supabase tabla 'contacts'
│   │   └── Footer.astro        ← Logo + links + contacto + copyright
│   ├── layouts/
│   │   └── Layout.astro        ← HTML base, SEO, Google Fonts, animaciones globales
│   └── pages/
│       └── index.astro         ← Ensambla todos los componentes
├── public/
│   ├── images/
│   │   └── logo.png            ← Logo Vision Code (copiar desde adjunto)
│   └── videos/
│       └── HERO.mp4            ← Copiar desde D:\VISION CODE\VIDEO PARA HERO\
├── supabase/
│   └── schema.sql              ← SQL para tabla contacts en Supabase
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## SECCIONES DE LA LANDING (en orden)

### 1. NAVBAR (`Navbar.astro`)
- Fixed top, z-50
- Transparente por defecto → fondo `rgba(15,15,15,0.95)` + blur al hacer scroll > 60px
- Border inferior `rgba(139,26,43,0.2)` cuando scrolled
- Links: Servicios / Planes / Proceso / Contacto
- CTA desktop: botón rojo "Cotizar proyecto"
- Mobile: hamburger → menú desplegable

### 2. HERO (`Hero.astro`)
- Video `public/videos/HERO.mp4` como background (autoplay, loop, muted, playsinline)
- Overlay gradiente: `from-brand-black/90 via-brand-black/70 to-brand-black/40`
- Línea roja vertical izquierda decorativa
- Headline: "Tu negocio / **merece** una / presencia digital / **real.**" (última palabra outline rojo)
- Subtítulo + 2 CTAs + fila de 3 stats (100% Responsive / IA / 30d soporte)
- Animaciones escalonadas `heroFadeUp` con delays 0.2s → 1.2s
- Indicador scroll animado al fondo

### 3. SERVICIOS (`Services.astro`)
- Grid 3 columnas desktop, 2 tablet, 1 mobile
- 6 cards: Landing Pages / Sitios Web / Tienda Online / E-Commerce+ERP / SEO / Mantenimiento
- Cada card: icono SVG rojo + título + descripción + tag precio
- Hover: línea roja animada aparece en bottom, borde rojo sutil

### 4. PLANES Y PRECIOS (`Pricing.astro`)

#### Planes principales (pago único):
| Plan | CLP | USD |
|------|-----|-----|
| Landing Básica | $58.000 | $60 |
| Landing + Sitio Web ⭐ | $80.000 | $83 |
| Landing + E-Commerce | $150.000 | $156 |
| E-Commerce + ERP | $300.000 | $312 |

#### Mantenimiento mensual (opcional):
| Plan | CLP/mes | USD/mes |
|------|---------|---------|
| Landing Básica | $10.000 | $11 |
| Landing + Sitio Web | $15.000 | $16 |
| Landing + E-Commerce | $20.000 | $21 |
| E-Commerce + ERP | $30.000 | $31 |

#### Servicios adicionales (negociables):
- Sitio en 2 idiomas → desde $38.000
- SEO avanzado → desde $48.000
- Integración redes sociales → desde $24.000
- Email corporativo (5 cuentas) → desde $29.000
- Sesión de fotos con IA → desde $34.000
- Dashboard de métricas → desde $58.000
- Más de 50 productos → desde $29.000

El plan "Landing + Sitio Web" tiene badge "Más popular" (rojo). El ERP tiene badge "Más completo" (gris).

### 5. PROCESO (`Process.astro`)
6 pasos en layout sticky (header izquierdo fijo, pasos scroll derecho):
01 Primera reunión → 02 Propuesta y diseño → 03 Desarrollo con IA → 04 Revisión y ajustes → 05 Lanzamiento → 06 Soporte continuo

### 6. CONTACTO (`Contact.astro`)
- Grid 2 columnas: info izquierda + formulario derecha
- Datos mostrados: teléfono +56 2 9645522 / email Vision.code.vs@gmail.com / Valparaíso
- Formulario campos: nombre*, empresa, email*, teléfono, plan (select), mensaje*
- Submit → POST a Supabase REST API tabla `contacts`
- Estados: loading / success / error

### 7. FOOTER (`Footer.astro`)
- Grid 3 columnas: brand + servicios + contacto
- Copyright dinámico con `new Date().getFullYear()`

---

## BASE DE DATOS SUPABASE

### Tabla: `contacts`
```sql
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  plan        TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'new',  -- new | read | replied
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS:
- INSERT: público (formulario sin auth)
- SELECT / UPDATE: solo `auth.role() = 'authenticated'`

### Credenciales (reemplazar en `Contact.astro`):
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';       // ← reemplazar
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← reemplazar
```

---

## ANIMACIONES Y COMPORTAMIENTO GLOBAL

### Reveal on scroll (Layout.astro)
Todos los elementos con clase `.reveal` se animan al entrar al viewport:
```css
.reveal { opacity: 0; transform: translateY(40px); transition: 0.8s; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-delay-1 { transition-delay: 0.1s; }
/* hasta delay-4 */
```
Activado con `IntersectionObserver` en script global.

### Hero animations
Clase `.hero-animate` con `@keyframes heroFadeUp` — no usa observer, se activa con delays CSS inmediatos al cargar.

### Scrollbar custom
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #8B1A2B; }
```

### Selection
```css
::selection { background: #8B1A2B; color: #fff; }
```

---

## COMANDOS DE DESARROLLO

```bash
# Instalar dependencias
cd "D:\VISION CODE"
npm install

# Servidor de desarrollo (http://localhost:4321)
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview
```

---

## REPOSITORIO GITHUB

```bash
git init
git add .
git commit -m "feat: landing page inicial Vision Code"
git remote add origin https://github.com/TU_USUARIO/visioncode-landing.git
git push -u origin main
```

---

## ARCHIVOS PENDIENTES DE COPIAR (Antigraviti debe hacer esto)

```
ORIGEN:  D:\VISION CODE\VIDEO PARA HERO\HERO.mp4
DESTINO: D:\VISION CODE\public\videos\HERO.mp4

ORIGEN:  Logo Vision Code (adjunto PNG del dueño)
DESTINO: D:\VISION CODE\public\images\logo.png

ORIGEN:  D:\VISION CODE\PRODUCTOS\ (catálogo de productos/servicios)
DESTINO: Integrar en nueva sección o componente Products.astro
```

---

## REGLAS DE TRABAJO PARA ANTIGRAVITI

1. **NUNCA cambiar** colores, tipografías ni datos de contacto sin instrucción explícita del dueño.
2. **SIEMPRE** mantener el diseño responsive (mobile-first con Tailwind).
3. **Al agregar secciones nuevas**, seguir el mismo patrón: fondo alterno `#0f0f0f` / `#111111`, animaciones `.reveal`, títulos con Playfair Display.
4. **El formulario** siempre debe enviar a Supabase. No usar `<form action="">` o emailjs sin aprobación.
5. **Los productos** de `D:\VISION CODE\PRODUCTOS\` deben integrarse como una sección visual con cards, siguiendo el mismo estilo de `Services.astro`.
6. **Al hacer deploy**, verificar que el video HERO.mp4 esté en `public/videos/` y el logo en `public/images/`.
7. **Commits en español**, descriptivos: `feat: agrega sección productos`, `fix: formulario contacto`, etc.
8. **Preguntar siempre** antes de modificar precios, textos de la empresa o estructura de la base de datos.

---

## ESTADO ACTUAL DEL PROYECTO

✅ Layout base con SEO, Google Fonts, animaciones globales  
✅ Navbar sticky con scroll effect y menú mobile  
✅ Hero con video de fondo y animaciones escalonadas  
✅ Sección Servicios (6 cards)  
✅ Sección Planes y Precios (4 planes + extras)  
✅ Sección Proceso (6 pasos)  
✅ Formulario de contacto → Supabase  
✅ Footer completo  
✅ SQL schema Supabase  
✅ README y .env.example  

⏳ Copiar HERO.mp4 a `public/videos/`  
⏳ Copiar logo a `public/images/logo.png`  
⏳ Ejecutar `supabase/schema.sql` en proyecto Supabase  
⏳ Reemplazar credenciales Supabase en `Contact.astro`  
⏳ Crear sección `Productos` con contenido de `D:\VISION CODE\PRODUCTOS\`  
⏳ Configurar GitHub repo  
⏳ Deploy en Vercel/Netlify  
⏳ Conectar dominio personalizado  

---

*Este prompt debe adjuntarse a Antigraviti al inicio de cada sesión de trabajo para mantener contexto completo del proyecto Vision Code.*
