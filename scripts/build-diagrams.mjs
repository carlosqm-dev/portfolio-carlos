#!/usr/bin/env node
/**
 * Genera SVGs de Mermaid a partir de los strings en src/content/projects/.
 * Ver ADR-007:
 *  - Cada proyecto puede tener N diagramas en el campo `diagrams`.
 *  - Por cada diagrama se generan dos SVGs:
 *      public/diagrams/{slug}-desktop-{N}.svg (dirección LR)
 *      public/diagrams/{slug}-mobile-{N}.svg  (dirección TB)
 *  - El string Mermaid NO incluye dirección: el script la inyecta
 *    solo para flowchart/graph. Otros tipos (sequenceDiagram,
 *    classDiagram, stateDiagram, erDiagram, gantt, pie) no tienen
 *    dirección y se pasan tal cual.
 *  - Los SVGs se commitean como artefactos derivados.
 *
 * Uso: pnpm diagrams
 */

import { readdir, readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECTS_DIR = join(ROOT, 'src/content/projects');
const OUT_DIR = join(ROOT, 'public/diagrams');

// Tipos de Mermaid que NO aceptan dirección. Ver ADR-007.
// flowchart y graph SÍ aceptan dirección (LR|TB|RL|BT) — esos se manejan aparte.
const DIRECTIONLESS_TYPES = [
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'pie',
  'journey',
  'gitGraph',
  'requirementDiagram',
  'C4Context',
];

/**
 * Detecta si el string empieza con un tipo sin dirección.
 * Coincide con la primera palabra (sin distinguir mayúsculas) seguida de
 * espacio o fin de línea. Evita falsos positivos con identificadores que
 * contengan esos nombres (improbable en Mermaid, pero por las dudas).
 */
function isDirectionless(source) {
  const firstLine = source.trimStart().split(/\r?\n/, 1)[0].trim();
  const firstWord = firstLine.split(/\s+/, 1)[0];
  return DIRECTIONLESS_TYPES.some((t) => t.toLowerCase() === firstWord.toLowerCase());
}

async function loadProjects() {
  const entries = await readdir(PROJECTS_DIR);
  const projects = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const raw = await readFile(join(PROJECTS_DIR, entry), 'utf-8');
    const data = JSON.parse(raw);
    const slug = entry.replace(/\.json$/, '');
    if (Array.isArray(data.diagrams) && data.diagrams.length > 0) {
      projects.push({ slug, diagrams: data.diagrams });
    }
  }
  return projects;
}

/**
 * Inyecta la dirección al inicio del string Mermaid (solo flowchart/graph).
 * El string del proyecto NO debe traer dirección — la decisión se toma acá
 * según la variante (desktop LR / mobile TB).
 * Si el string ya empieza con "flowchart" o "graph", respetamos el resto
 * y solo reemplazamos la dirección.
 * Si el tipo no acepta dirección (sequenceDiagram, etc.), devuelve tal cual.
 */
function withDirection(source, direction) {
  if (isDirectionless(source)) {
    return source;
  }
  if (/^(flowchart|graph)\s+(LR|TB|RL|BT)/i.test(source.trimStart())) {
    return source.replace(
      /^(flowchart|graph)\s+(LR|TB|RL|BT)/i,
      (_, keyword) => `${keyword} ${direction}`,
    );
  }
  return `flowchart ${direction}\n${source}`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const projects = await loadProjects();

  if (projects.length === 0) {
    console.log(
      'ℹ️  No hay diagramas para generar (src/content/projects/*.json sin campo "diagrams").',
    );
    return;
  }

  // Importación dinámica para no cargar Puppeteer si no hay diagramas.
  // mermaid-cli no tiene default export; se usa run(input, output), que
  // maneja el browser internamente (puppeteer es dep transitiva y pnpm
  // no permite importarla directo). run() exige archivos, no strings:
  // se escriben .mmd temporales por variante.
  const { run } = await import('@mermaid-js/mermaid-cli');
  const tmpDir = await mkdtemp(join(tmpdir(), 'diagrams-'));

  try {
    for (const { slug, diagrams } of projects) {
      const variants = [
        { suffix: 'desktop', direction: 'LR' },
        { suffix: 'mobile', direction: 'TB' },
      ];

      try {
        for (let i = 0; i < diagrams.length; i++) {
          const { source } = diagrams[i];
          for (const { suffix, direction } of variants) {
            const input = join(tmpDir, `${slug}-${i}-${suffix}.mmd`);
            await writeFile(input, withDirection(source, direction));
            await run(input, join(OUT_DIR, `${slug}-${suffix}-${i}.svg`), { quiet: true });
          }
        }
        console.log(`✅ ${slug}: ${diagrams.length} diagrama(s) -> desktop-{0..N-1} + mobile-{0..N-1}`);
      } catch (err) {
        console.error(`❌ ${slug}: error renderizando`);
        console.error(err);
        process.exitCode = 1;
      }
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main();
