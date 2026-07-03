import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Helper bilingüe.
 * Ver ADR-003: todo campo de texto usa { es, en }.
 * Es el único lugar donde vive este shape — no duplicar en cada schema.
 */
const localized = z.object({
  es: z.string(),
  en: z.string(),
});

/**
 * Stack — catálogo centralizado por categorías.
 * Ver ADR-004: 4 categorías fijas, una entrada = { id, nombre, icono }.
 * El campo `stack` de un proyecto referencia IDs de acá.
 *
 * Loader: un archivo por categoría en src/content/stack/ (frontmatter-style).
 */
const stack = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/stack' }),
  schema: z.object({
    // Nombre localizado de la categoría (Frontend, Backend, etc.)
    nombre: localized,
    // Orden de aparición en la sección Stack
    orden: z.number().int().min(0),
    // Array de tecnologías de la categoría
    tecnologias: z.array(
      z.object({
        id: z.string(),
        nombre: z.string(),
        // Key de astro-icon: "simple-icons:fastapi" o "local:nombre"
        icono: z.string(),
      }),
    ),
  }),
});

/**
 * Projects — entrada principal del portafolio.
 * Ver ADR-002, ADR-006, ADR-007.
 *
 * Loader: un JSON por proyecto en src/content/projects/.
 * El slug = nombre del archivo sin .json.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    titulo: localized,
    resumen: localized, // Bajada corta para el grid
    descripcion: localized, // Descripción completa para la página de detalle
    stack: z.array(reference('stack')), // IDs del catálogo, validados
    // String Mermaid para el diagrama de arquitectura
    // Ver ADR-007: NO incluir dirección; el script la inyecta.
    diagrama: z.string().optional(),
    links: z
      .object({
        demo: z.url().optional(),
        repo: z.url().optional(),
      })
      .optional(),
    destacado: z.boolean().default(false),
    orden: z.number().int().min(0),
  }),
});

/**
 * Experience — línea de tiempo laboral y profesional.
 * Ver ADR-010: dos timelines separadas por línea divisora vertical.
 * Más reciente primero — ordenar por fecha en el componente, no confiar
 * en el orden del archivo.
 */
const experience = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/experience' }),
  schema: z.object({
    tipo: z.enum(['laboral', 'profesional']),
    empresa: z.string(),
    rol: localized,
    descripcion: localized,
    fechaInicio: z.string(), // ISO 8601 (YYYY-MM)
    fechaFin: z.string().nullable(), // null = "actualidad"
    lugar: z.string().optional(),
    orden: z.number().int().min(0),
  }),
});

/**
 * About — descripción personal + lista de fotos para el carrusel.
 * Ver ADR-010: dos columnas (descripción izq, carrusel der).
 *
 * Loader: un único documento con fotos referenciadas.
 */
const about = defineCollection({
  loader: glob({ pattern: 'about.json', base: './src/content/about' }),
  schema: z.object({
    descripcion: localized,
    hobbies: z.array(localized).optional(),
    fotos: z.array(
      z.object({
        src: z.string(), // ruta a la imagen
        alt: localized,
      }),
    ),
  }),
});

/**
 * UI — textos del propio UI (labels del nav, "Más información →",
 * "email copiado!!", etc.). Ver ADR-002.
 * Esta colección es la ÚNICA fuente de strings de UI; no hardcodear.
 *
 * Loader: un JSON por grupo de strings.
 */
const ui = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/ui' }),
  schema: z.object({
    // Una entrada por archivo. Por ejemplo "labels", "hero", "footer".
    // Cada archivo puede tener cualquier shape — son los strings del UI.
  }),
});

export const collections = { stack, projects, experience, about, ui };
