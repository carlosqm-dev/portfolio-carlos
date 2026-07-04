# Diseño — Sección "Sobre mí" (ADR-010)

Fecha: 2026-07-04

## Objetivo

Sección final de la home: dos columnas — descripción personal a la izquierda,
carrusel de fotos personales a la derecha. El carrusel es un stack: la foto
activa al frente, la anterior y la siguiente asomando detrás a los lados.

## Decisiones

### Carrusel: vanilla JS + máquina de estados en CSS

Cada foto lleva `data-state` (`active | prev | next | hidden`). Un script
mínimo (`photo-carousel.ts`) rota el índice activo; el movimiento lo hace CSS
con `transform` (translate + scale) y `transition`. Sin dependencias
(ADR-001). Alternativas descartadas: CSS puro con keyframes (la interacción
manual es inviable y los keyframes se acoplan a la cantidad de fotos) y Embla
(carrusel de pista, pelea contra el efecto stack).

### Comportamiento

- Loop automático cada 5.5 s — cadencia lenta a propósito: la animación
  señala "hay más fotos", no decora (principio de DESIGN.md aplicado al
  movimiento).
- Sin interacción manual (decisión posterior al diseño inicial: se quitó
  la pausa en hover y el click en laterales para dejar solo el loop).
- `prefers-reduced-motion`: el stack queda estático, sin transiciones.

### Profundidad por luminosidad, no por sombra

Regla de DESIGN.md: sobre `#0A0A0B` las sombras no se ven. La foto activa va
a brillo pleno; las laterales se atenúan con `filter: brightness(.5)` y
escala 0.85. Las fotos llevan `border-accent border-4` — el mismo patrón de
la foto del Hero: el rol "foto personal" carga el accent, y el filtro de
brillo atenúa el borde de las laterales, así solo la activa muestra el azul
pleno. Sin dots ni otros usos de accent en el carrusel.

### Datos (ADR-002 / ADR-003)

- `src/content/about/about.json`: `descripcion` bilingüe, `hobbies`
  opcionales, `fotos[]` (src + alt bilingüe). El schema ya existía; se
  agrega `min(3)` a `fotos` porque el stack necesita al menos 3.
- `src/content/ui/about.json`: título de sección y labels de accesibilidad.
- Fotos reales en `public/about/` (cuadradas 1:1, estilo Instagram clásico;
  `object-cover` recorta lo que sobre). Mientras llegan, placeholders SVG.

### Componentes

```
features/about/
  AboutSection.astro   # grid 2 columnas, mismo patrón que ExperienceSection
  PhotoCarousel.astro  # markup del stack + estados CSS (scoped)
  photo-carousel.ts    # rotación, pausa, click — única responsabilidad
```

`index.astro` monta `<AboutSection />` tras Experiencia (ancla `#sobre-mi`,
ya presente en el nav) y registra el script.

### Accesibilidad

- `alt` y `aria-label` con `.es` directo — mismo patrón que `ProjectCard`
  (los atributos no se pueden alternar por CSS).
- Sin elementos interactivos: el carrusel no participa del orden de
  tabulación.

## Fuera de alcance

- Interacción manual (hover-pausa, click, swipe) — descartada.
- Lightbox / zoom de fotos.
