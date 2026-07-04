/**
 * Carrusel de fotos "Sobre mí" (ver ADR-010).
 * Única responsabilidad: rotar el stack en loop. El movimiento visual vive
 * en el CSS de PhotoCarousel.astro; acá solo se actualiza `data-state`.
 *
 * - Loop automático cada 4 s — cadencia lenta a propósito (DESIGN.md:
 *   la animación señala, no decora). Sin interacción manual.
 * - prefers-reduced-motion deja el stack estático.
 */
const INTERVALO_MS = 4000;

const root = document.querySelector<HTMLElement>('[data-photo-carousel]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (root && !reduceMotion.matches) {
  const items = [...root.querySelectorAll<HTMLLIElement>('[data-carousel-item]')];
  let activo = 0;

  window.setInterval(() => {
    activo = (activo + 1) % items.length;
    const prev = (activo - 1 + items.length) % items.length;
    const next = (activo + 1) % items.length;

    items.forEach((item, i) => {
      item.dataset.state =
        i === activo ? 'active' : i === prev ? 'prev' : i === next ? 'next' : 'hidden';
    });
  }, INTERVALO_MS);
}
