#!/usr/bin/env node
/**
 * Genera SVGs de Mermaid a partir de los strings en src/content/projects/.
 * Ver ADR-007:
 *  - Por cada proyecto con campo `diagrama`, genera dos SVGs:
 *      public/diagrams/{slug}-desktop.svg (dirección LR)
 *      public/diagrams/{slug}-mobile.svg  (dirección TB)
 *  - El string Mermaid NO incluye dirección: el script la inyecta.
 *  - Los SVGs se commitean como artefactos derivados.
 *
 * Uso: pnpm diagrams
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECTS_DIR = join(ROOT, 'src/content/projects');
const OUT_DIR = join(ROOT, 'public/diagrams');

async function loadProjects() {
  const entries = await readdir(PROJECTS_DIR);
  const projects = [];
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const raw = await readFile(join(PROJECTS_DIR, entry), 'utf-8');
    const data = JSON.parse(raw);
    const slug = entry.replace(/\.json$/, '');
    if (data.diagrama) {
      projects.push({ slug, source: data.diagrama });
    }
  }
  return projects;
}

/**
 * Inyecta la dirección al inicio del string Mermaid.
 * El string del proyecto NO debe tener dirección — la decisión se toma acá
 * según la variante (desktop LR / mobile TB).
 */
function withDirection(source, direction) {
  // Mermaid acepta flowchart LR|TB|RL|BT como primera línea.
  // Si el string ya empieza con "flowchart" o "graph", respetamos el resto
  // y solo reemplazamos la dirección.
  if (/^(flowchart|graph)\s+(LR|TB|RL|BT)/i.test(source.trimStart())) {
    return source.replace(
      /^(flowchart|graph)\s+(LR|TB|RL|BT)/i,
      (_, keyword) => `${keyword} ${direction}`,
    );
  }
  return `flowchart ${direction}\n${source}`;
}

async function renderSvg(mermaidSource) {
  // Importación dinámica para no cargar Puppeteer si no hay diagramas.
  const { default: mermaid } = await import('@mermaid-js/mermaid-cli');
  return mermaid.renderDiagram(mermaidSource);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const projects = await loadProjects();

  if (projects.length === 0) {
    console.log('ℹ️  No hay diagramas para generar (src/content/projects/*.json sin campo "diagrama").');
    return;
  }

  for (const { slug, source } of projects) {
    const desktopSrc = withDirection(source, 'LR');
    const mobileSrc = withDirection(source, 'TB');

    try {
      const desktopSvg = await renderSvg(desktopSrc);
      const mobileSvg = await renderSvg(mobileSrc);
      await writeFile(join(OUT_DIR, `${slug}-desktop.svg`), desktopSvg);
      await writeFile(join(OUT_DIR, `${slug}-mobile.svg`), mobileSvg);
      console.log(`✅ ${slug}: desktop.svg + mobile.svg`);
    } catch (err) {
      console.error(`❌ ${slug}: error renderizando`);
      console.error(err);
      process.exitCode = 1;
    }
  }
}

main();
