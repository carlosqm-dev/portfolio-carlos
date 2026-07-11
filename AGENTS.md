# AGENTS.md

> Documento de entrada para cualquier agente que trabaje en este proyecto. **Lee los tres archivos enlazados antes de hacer cualquier cambio.** Son la fuente de verdad; este archivo solo es el índice.

## Proyecto

Portafolio personal estático de Carlos Quiroz — desarrollador Full Stack. Astro 5 + pnpm + Vercel. Bilingüe (ES/EN), sin frameworks de UI en runtime.

**Objetivo:** conseguir oportunidades de trabajo o freelance. **Tono:** cercano y directo, sin lenguaje corporativo. Más contexto en [`docs/CONTEXT.md`](docs/CONTEXT.md).

## Documentación obligatoria

| Archivo                                  | Qué contiene                                                       | Cuándo consultarlo                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`docs/CONTEXT.md`](docs/CONTEXT.md)     | Objetivo, propuesta de valor, tono, estructura general             | Antes de proponer copy, mensajes UI o tono de comunicación                                            |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 11 ADRs (arquitectura, datos, i18n, iconos, diagramas, estructura) | **Antes de cualquier implementación.** Ningún cambio debe contradecir un ADR sin actualizarlo primero |
| [`docs/DESIGN.md`](docs/DESIGN.md)       | Design system: tipografía, paleta, reglas por rol                  | Antes de tocar estilos, agregar colores o elegir tipografía                                           |

## Reglas duras

1. **Cero hardcodeo.** Todo texto, enlace o dato va en `src/content/` validado con Zod. Los componentes solo consumen colecciones.
2. **Bilingüe siempre.** Todo campo de texto usa `{ es: string, en: string }` y se renderiza con el componente `<T />`. Nada de `dato.es` directo en componentes.
3. **Astro estático.** Sin SSR, sin islands de framework. Interactividad vanilla (scripts pequeños, una responsabilidad cada uno).
4. **Iconos:** `astro-icon` con `simple-icons:*` o `local:*`. Nunca PNG. Nunca CDN en runtime.
5. **Diagramas Mermaid:** el string vive en la colección; los SVG se generan con `pnpm diagrams` y se commitean. Si editas el string, regenera antes de commitear.
6. **Estructura:** `src/{content, features, components/ui, layouts, pages, icons}`. Las `features/` consumen `content/` y `components/ui/`, nunca al revés.
7. **Color por rol, no a ojo.** Consultar `docs/DESIGN.md` → sección "Cómo decidir el color de un elemento" antes de agregar estilos.

## Convenciones rápidas

- Componentes Astro: `PascalCase.astro`. Scripts/utilidades: `kebab-case`. Datos: `kebab-case.json`. Iconos: `kebab-case.svg`.
- Tipos derivados de Zod con `z.infer`, nunca duplicados a mano.
- Comentarios en español, solo donde el código no se explique solo. Referenciar el ADR cuando aplique (`// Ver ADR-003`).
- Componentes sin lógica de contenido: reciben props o leen colecciones. Strings de UI inline van a la colección `ui`.

## Comandos frecuentes

```bash
pnpm install          # instalar dependencias
pnpm dev              # dev server
pnpm build            # build estático
pnpm diagrams         # regenerar SVGs de Mermaid desde src/content/
```

## Workflow recomendado

1. **Idea / feature nueva** → cargar skill `brainstorming`.
2. **Cambio mediano o grande** → ciclo SDD: `sdd-explore` → `sdd-propose` → `sdd-spec` → `sdd-tasks` → `sdd-apply` → `sdd-verify` → `sdd-archive`.
3. **Antes de implementar**, releer el ADR relevante en `docs/DECISIONS.md`.
4. **Antes de cerrar sesión**, correr `mem_session_summary` con lo trabajado.
