# DECISIONS.md — Portafolio Carlos Quiroz

Registro de decisiones arquitectónicas. Formato ADR simplificado: Decisión → Contexto → Consecuencias.
Este documento es la fuente de verdad para el agente. Ninguna implementación debe contradecir lo aquí definido sin actualizar primero este archivo.

---

## ADR-001 — Framework: Astro 7 (estático)

**Decisión:** Astro 7 con output estático, gestor de paquetes pnpm, deploy en Vercel.

**Contexto:** Sitio de contenido con interactividad puntual. Objetivo futuro: sección de Blog.

**Consecuencias:**

- Zero JS por defecto; la interactividad se resuelve con scripts vanilla, no islands de framework.
- No usar React/Vue para carrusel, hamburguesa ni toggle de idioma. Carrusel: CSS scroll-snap o Embla (vanilla).
- El blog futuro se agrega como Content Collection nueva + ruta, sin migración.
- No configurar SSR ni adapter de servidor. Build estático puro.

---

## ADR-002 — Datos: Content Collections como única fuente de verdad

**Decisión:** Todo dato visible en la UI vive en `src/content/` validado con Zod. Prohibido hardcodear texto, enlaces o datos en componentes.

**Contexto:** Requisito explícito de cero hardcodeo para facilitar cambios sin tocar la interfaz.

**Consecuencias:**

- Colecciones: `projects/`, `experience/`, `stack/`, `about/`, `ui/` (textos del propio UI: labels del nav, "Más información →", "email copiado!!", etc.).
- Si falta un campo requerido, el build falla (validación Zod), no la UI.
- Los componentes solo consumen vía `getCollection()` / `getEntry()`. Nunca definen contenido.

---

## ADR-003 — Bilingüe: toggle en cliente, ambos idiomas en el DOM

**Decisión:** Todo campo de texto usa el shape `{ es: string, en: string }`. Ambos idiomas se renderizan en build; un toggle en cliente alterna visibilidad sin recarga.

**Contexto:** Se evaluó el i18n por rutas de Astro (`/es/`, `/en/`). Se descartó por UX: recarga de página al cambiar idioma y duplicación de estructura por locale.

**Consecuencias (trade-offs aceptados):**

- Sin SEO del idioma secundario (crawlers solo ven el idioma por defecto). Aceptado.
- HTML ~2x en secciones de texto. Irrelevante a esta escala.
- Reversible: si algún día se requiere SEO en inglés, los datos ya están estructurados como `{ es, en }` y la migración a rutas i18n es directa.

**Implementación obligatoria:**

- Helper Zod compartido: `const localized = z.object({ es: z.string(), en: z.string() })`.
- Componente único `components/ui/T.astro` que renderiza el par `<span data-lang="es">` / `<span data-lang="en">`. Es el único lugar donde vive el patrón bilingüe.
- Script inline en `<head>` (antes del render del body): lee `localStorage.getItem('lang')`, setea `document.documentElement.dataset.lang` y `document.documentElement.lang`. Evita flash de idioma incorrecto.
- La visibilidad la controla solo CSS: `html[data-lang="en"] [data-lang="es"] { display: none; }` y viceversa. No usar atributo `hidden` en el HTML.
- El toggle ES/EN actualiza `data-lang`, `lang` (accesibilidad: screen readers) y persiste en localStorage.

---

## ADR-004 — Stack tecnológico: catálogo por categorías

**Decisión:** Las tecnologías se modelan como un catálogo centralizado dividido en 4 categorías fijas: `frontend`, `backend`, `basesDeDatos`, `herramientas`.

**Contexto:** La sección Stack renderiza 4 cards (una por categoría). Otras secciones (detalle de proyecto) referencian tecnologías del mismo catálogo.

**Consecuencias:**

- Una entrada del catálogo = `{ id, name, icon }` donde `icon` es la key de astro-icon (ej. `simple-icons:fastapi` o `local:name` para iconos propios).
- El campo `stack` de cada proyecto es un array de `id`s del catálogo, no strings libres. Zod valida contra el catálogo para impedir referencias rotas.
- Agregar una tecnología = agregar una entrada al catálogo. La UI (card de categoría y badges en detalle de proyecto) se actualiza sola.
- Estructura definida: `src/content/stack/` con un archivo por categoría — `frontend.json`, `backend.json`, `bases-de-datos.json`, `herramientas.json`. Cada archivo contiene el nombre localizado de la categoría y su array de tecnologías. La sección Stack renderiza una card por entrada de la colección; el orden de las cards se controla con un campo `order`.

---

## ADR-005 — Iconos: astro-icon + @iconify-json/simple-icons

**Decisión:** Iconos vía `astro-icon` con el set `@iconify-json/simple-icons` como devDependency. Iconos no disponibles en Simple Icons: SVG local en `src/icons/`.

**Contexto:** Se evaluó el CDN de Simple Icons por URL. Se descartó: requests HTTP en runtime, dependencia de servicio externo en producción, sin coloreado reactivo con CSS, y forzaba un segundo sistema para iconos faltantes.

**Consecuencias:**

- SVG inline en build, tree-shaken (solo los iconos usados llegan al HTML). Cero runtime, cero requests.
- `public/` no contiene iconos.
- Iconos coloreables con `currentColor` (hover, dark mode).
- Sintaxis única: `<Icon name="simple-icons:x" />` y `<Icon name="local:x" />`.
- Los iconos faltantes se convierten a SVG (nunca PNG: pierde nitidez y no acepta color por CSS).

---

## ADR-006 — Detalle de proyecto: ruta dinámica, no modal

**Decisión:** Cada proyecto tiene página propia en `pages/proyectos/[slug].astro`, generada desde la colección `projects`.

**Contexto:** Se evaluó modal/overlay para el detalle.

**Consecuencias:**

- URL compartible, botón atrás nativo, SEO por proyecto.
- El grid de la home muestra los proyectos ordenados por campo `order`, 2 por fila.
- "Más información →" navega a la ruta del proyecto.

---

## ADR-007 — Diagramas de arquitectura: prebuild local de Mermaid a SVG

**Decisión:** Cada proyecto guarda un único string Mermaid en su entrada de colección. Un script local (`pnpm diagrams`, usando `@mermaid-js/mermaid-cli`) genera dos SVGs por proyecto en `public/diagrams/`: `{slug}-desktop.svg` (dirección LR) y `{slug}-mobile.svg` (dirección TB). Los SVGs se commitean.

**Contexto:** Se evaluó renderizar Mermaid en cliente (peso de librería en runtime) y generar en el build de Vercel (mermaid-cli arrastra Puppeteer/Chromium e infla el build por artefactos que solo cambian al editar un diagrama).

**Consecuencias:**

- El campo se llama `diagram` en la colección `projects`. El string Mermaid NO incluye dirección; el script inyecta LR o TB según variante. No se duplica el grafo.
- La UI carga el SVG como imagen y alterna variante por breakpoint (`<picture>` con media query o dos `<img>` con `hidden md:block`).
- Los SVGs commiteados son artefactos derivados. Regla: si se edita el string Mermaid de un proyecto, se debe correr `pnpm diagrams` antes de commitear.

---

## ADR-008 — Estructura: feature-based pragmático

**Decisión:** Organización por features sin capas de dominio/casos de uso.

**Contexto:** Feature-based puro con dominio aislado es sobre-ingeniería para un sitio estático sin lógica de negocio.

**Estructura:**

```
src/
  content/            # datos + schemas (config.ts) — única fuente de verdad
  features/
    hero/             # Hero.astro, SocialLinks.astro, copy-email.ts
    stack/            # StackSection, CategoryCard
    projects/         # ProjectCard, ProjectGrid, ProjectDetail
    experience/       # Timeline, TimelineItem
    about/            # PhotoCarousel
  components/ui/      # primitivos compartidos: Pill, Card, SectionTitle, Icon, T
  layouts/
  pages/
    index.astro
    proyectos/[slug].astro
  icons/              # SVGs locales para astro-icon
scripts/
  build-diagrams.mjs  # mermaid → SVG (correr con pnpm diagrams)
public/
  diagrams/           # SVGs generados, commiteados
```

**Regla de dependencia:** `features/` consume `content/` y `components/ui/`. Nunca al revés. `components/ui/` no conoce el contenido.

---

## ADR-009 — Header/Hero: pills sticky + hamburguesa en mobile

**Decisión:** Header de 3 pills con bordes semi-redondeados, integrados al hero al inicio; al hacer scroll se fijan arriba (sticky). En mobile, el nav colapsa a menú hamburguesa; el pill "Carlos Quiroz" permanece visible.

**Consecuencias:**

- Hero en dos columnas: izquierda descripción + botones de acceso (GitHub, LinkedIn, CV, Email); derecha foto en tamaño amplio.
- CV: descarga directa del archivo.
- Email: no se expone; al click se copia al portapapeles. Dos estados visuales: icono normal → confirmación "email copiado!!". Implementar con Clipboard API + timeout de reversión.

---

## ADR-010 — Secciones Experiencia y Sobre mí

**Decisión (Experiencia):** Dos timelines paralelas (Laboral | Profesional) separadas por línea divisora vertical, con líneas guía verticales por columna. Orden: más reciente primero, controlado por datos (ordenar por fecha en el componente, no confiar en el orden del archivo).

**Decisión (Sobre mí):** Dos columnas: izquierda descripción personal (hobbies, vida privada), derecha carrusel de fotos personales. Carrusel sin framework (ver ADR-001).

---

## Convenciones de código

### Nomenclatura de archivos

| Tipo                    | Convención | Ejemplo                                    |
| ----------------------- | ---------- | ------------------------------------------ |
| Componentes Astro       | PascalCase | `ProjectCard.astro`, `Timeline.astro`      |
| Scripts / utilidades TS | kebab-case | `copy-email.ts`, `build-diagrams.mjs`      |
| Datos de colecciones    | kebab-case | `gestor-cotizaciones.json`, `catalog.json` |
| Iconos locales (SVG)    | kebab-case | `app-runner.svg`                           |
| Rutas (pages)           | kebab-case | `proyectos/[slug].astro`                   |
| CSS / estilos globales  | kebab-case | `global.css`                               |

- El `slug` de un proyecto = nombre de su archivo de datos. `gestor-cotizaciones.json` → `/proyectos/gestor-cotizaciones`.
- Un componente por archivo. Si un componente crece con sub-partes, se descompone dentro de su feature (`projects/ProjectCard.astro` + `projects/ProjectBadge.astro`), no en un archivo gigante.

### Comentarios

- En español, solo donde el código no se explica solo: decisiones no obvias, workarounds, invariantes.
- Nunca comentar lo evidente (`// itera los proyectos`). Si un bloque necesita muchos comentarios para entenderse, el problema es el código: refactorizar primero.
- Referenciar el ADR cuando el código implementa una decisión documentada: `// Ver ADR-003: visibilidad controlada solo por CSS`.

### Buenas prácticas obligatorias

- Componentes sin lógica de contenido: reciben datos por props o los leen de colecciones. Cero strings de UI inline (van a la colección `ui`).
- Tipos derivados de los schemas Zod (`z.infer`), nunca duplicados a mano.
- Early return sobre anidamiento.
- Scripts de cliente mínimos y con una sola responsabilidad (el de idioma no maneja el menú; el del menú no copia emails).

### Ejemplo: cómo sí / cómo no

**Incorrecto** — texto hardcodeado, sin tipos del schema, un solo idioma:

```astro
---
// ProjectCard.astro
const { project } = Astro.props;
---

<article class="card">
  <h3>{project.title.es}</h3>
  <p>{project.description.es}</p>
  <a href={`/proyectos/${project.slug}`}>Más información -></a>
</article>
```

Problemas: `Más información ->` está hardcodeado (viola ADR-002), accede a `.es` directo (rompe el toggle, viola ADR-003), `project` sin tipo (un typo en `title` falla en runtime, no en build).

**Correcto:**

```astro
---
// ProjectCard.astro
import type { CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';
import T from '@/components/ui/T.astro';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
// Textos de UI centralizados — ver ADR-002
const ui = await getEntry('ui', 'projects');
---

<article class="card">
  <h3><T t={project.data.title} /></h3>
  <p><T t={project.data.description} /></p>
  <a href={`/proyectos/${project.id}`}><T t={ui.data.moreInfo} /></a>
</article>
```

Por qué: tipado desde la colección (errores en build), ambos idiomas vía `T` (el toggle funciona sin tocar este componente), label desde la colección `ui` (cambiar el texto no requiere tocar código).

---

## Fuera de scope (MVP)

- Blog (fase futura; Astro lo soporta sin migración).
- SEO del idioma secundario (trade-off aceptado en ADR-003).
- Rutas i18n (`/es/`, `/en/`).
- Backend, formularios de contacto, analytics avanzados.

---

## Orden de construcción

1. Scaffold: Astro + Tailwind v4 + astro-icon + estructura de carpetas + `config.ts` con schemas.
2. Sistema bilingüe: script inline + CSS + componente `T` (transversal, va primero).
3. Layout + Header/Hero (pills sticky, hamburguesa, copiar email).
4. Stack por catálogo (sección más simple, valida el flujo datos → UI).
5. Proyectos: grid → ruta `[slug]` → script de diagramas.
6. Experiencia y Sobre mí.
7. Pulido: SEO base, OG image, favicon, deploy a Vercel.
