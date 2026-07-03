/**
 * Menú hamburguesa en mobile.
 * Ver ADR-009: el nav colapsa a hamburguesa; el pill "Carlos Quiroz" queda
 * siempre visible.
 * Una sola responsabilidad: abrir/cerrar el menú. El toggle de idioma
 * vive aparte.
 */

function initHamburger(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-hamburger]');
  const menus = document.querySelectorAll<HTMLElement>('[data-mobile-menu]');

  if (!buttons.length || !menus.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const menu = targetId ? document.getElementById(targetId) : menus[0];
      if (!menu) return;

      const isOpen = menu.dataset.open === 'true';
      const next = !isOpen;
      menu.dataset.open = String(next);
      btn.setAttribute('aria-expanded', String(next));
      // También en todos los botones por si hay varios (header sticky + mobile)
      buttons.forEach((b) => b.setAttribute('aria-expanded', String(next)));
      document.body.style.overflow = next ? 'hidden' : '';
    });
  });

  function closeAll(): void {
    menus.forEach((menu) => {
      if (menu.dataset.open === 'true') menu.dataset.open = 'false';
    });
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = '';
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Cerrar al navegar a una sección desde el propio menú (responsabilidad
  // del menú: si el usuario elige un destino, el panel debe cerrarse).
  menus.forEach((menu) => {
    menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', closeAll);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHamburger);
} else {
  initHamburger();
}
