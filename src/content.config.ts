import { readdirSync, readFileSync } from 'node:fs';
import { defineCollection } from 'astro:content';
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
 * Catálogo plano de IDs de tecnología válidos, leído síncronamente con
 * node:fs en vez de `getCollection('stack')`: el config de la colección
 * se evalúa antes de que exista el Content Layer, así que no hay forma de
 * usar la API async de astro:content acá arriba. Un proyecto puede cruzar
 * categorías (ej: usar 1 tecnología de frontend y 2 de backend), por eso
 * se aplana `tecnologias[].id` de todos los archivos en un único Set.
 */
const stackDir = new URL('./content/stack/', import.meta.url);
const validTechIds = new Set(
  readdirSync(stackDir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => {
      const contenido = JSON.parse(readFileSync(new URL(file, stackDir), 'utf-8'));
      return (contenido.tecnologias as Array<{ id: string }>).map((tech) => tech.id);
    }),
);

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
    imagen: z.object({ src: z.string(), alt: localized }), // Cover del grid
    // IDs individuales de tecnología, no referencias a categorías completas:
    // un proyecto cruza categorías (ver comentario de validTechIds arriba).
    stack: z.array(
      z.string().refine((id) => validTechIds.has(id), {
        message: 'id de tecnología no encontrado en src/content/stack/',
      }),
    ),
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
    // --- Campos opcionales para la página de detalle (fase 2, ver ADR-006) ---
    estado: z.enum(['produccion', 'desarrollo', 'archivado']).optional(),
    galeria: z.array(z.object({ src: z.string(), alt: localized })).optional(),
    decisionesClave: z.array(z.object({ decision: localized, porQue: localized })).optional(),
    desafios: z.array(z.object({ titulo: localized, solucion: localized })).optional(),
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
    // Logros en bullets — solo laboral. Educación no los trae.
    logros: z.array(localized).optional(),
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
    // El stack del carrusel necesita al menos 3 fotos (activa + laterales)
    fotos: z
      .array(
        z.object({
          src: z.string(), // ruta a la imagen
          alt: localized,
        }),
      )
      .min(3),
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
  // Una entrada por archivo. Por ejemplo "labels", "hero", "footer".
  // Cada archivo puede tener cualquier shape — son los strings del UI.
  // `.passthrough()` es OBLIGATORIO: sin él Zod elimina las claves
  // desconocidas y `getEntry('ui', ...)` devolvería un objeto vacío.
  // El componente que consume cada archivo tipa lo que necesita.
  schema: z.object({}).passthrough(),
});

export const collections = { stack, projects, experience, about, ui };
