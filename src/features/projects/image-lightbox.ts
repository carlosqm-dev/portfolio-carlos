/**
 * Lightbox de imágenes del detalle de proyecto.
 * Ver ADR-006: el detalle es ruta, no modal; esto es solo un visor para
 * ampliar una imagen a pantalla completa, sin cambiar de página.
 * Una sola responsabilidad: abrir/cerrar el visor. La animación vive en el
 * CSS de ImageLightbox.astro; acá solo se togglea `data-open`.
 */

function initImageLightbox(): void {
  const overlay = document.querySelector<HTMLElement>('[data-lightbox]');
  const image = overlay?.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const closeBtn = overlay?.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const triggers = document.querySelectorAll<HTMLButtonElement>('[data-lightbox-trigger]');

  if (!overlay || !image || !closeBtn || !triggers.length) return;

  // Para devolver el foco al thumbnail que abrió el visor al cerrarlo.
  let lastTrigger: HTMLElement | null = null;

  function open(trigger: HTMLElement): void {
    const src = trigger.getAttribute('data-src');
    if (!src) return;
    image.src = src;
    image.alt = trigger.getAttribute('data-alt') ?? '';
    overlay.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
    lastTrigger = trigger;
    closeBtn.focus();
  }

  function close(): void {
    if (overlay.dataset.open !== 'true') return;
    overlay.dataset.open = 'false';
    document.body.style.overflow = '';
    lastTrigger?.focus();
    lastTrigger = null;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger));
  });

  closeBtn.addEventListener('click', close);

  // Click en el backdrop (fuera de la imagen y del botón) cierra.
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Con el visor abierto: Escape cierra y el foco queda atrapado en el botón
  // cerrar (único elemento enfocable del diálogo).
  document.addEventListener('keydown', (e) => {
    if (overlay.dataset.open !== 'true') return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageLightbox);
} else {
  initImageLightbox();
}
