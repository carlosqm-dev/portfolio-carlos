/**
 * Toggle de idioma ES/EN — segmented control.
 * Ver ADR-003: actualiza data-lang, lang (accesibilidad) y localStorage.
 * Una sola responsabilidad: el idioma. El menú hamburguesa vive aparte.
 *
 * El indicador visual se anima vía CSS leyendo html[data-lang] (ver
 * global.css). Este script solo sincroniza aria-pressed en cada botón
 * para que screen readers anuncien el estado correctamente.
 */

type Lang = 'es' | 'en';

function getCurrentLang(): Lang {
  const attr = document.documentElement.dataset.lang;
  return attr === 'en' ? 'en' : 'es';
}

function setLang(lang: Lang): void {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem('lang', lang);
  } catch {
    // ignorar: modo privado sin storage
  }
  // Avisar al resto de la página (para que un toggle visual, por ejemplo,
  // pueda re-renderizar labels de iconos)
  document.dispatchEvent(new CustomEvent('lang:change', { detail: { lang } }));
}

/**
 * Sincroniza aria-pressed de cada botón del toggle con el idioma actual.
 * Los colores del indicador y del texto los maneja CSS leyendo
 * html[data-lang] (ver global.css). El script anti-flash de BaseLayout
 * puede haber setado el data-lang antes del primer paint; acá reflejamos
 * eso en aria-pressed para los screen readers.
 */
function syncPressedState(): void {
  const lang = getCurrentLang();
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    '[data-lang-toggle-root] button[data-lang-option]'
  );
  buttons.forEach((btn) => {
    const isActive = btn.dataset.langOption === lang;
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function initLangToggle(): void {
  syncPressedState();

  const buttons = document.querySelectorAll<HTMLButtonElement>(
    '[data-lang-toggle-root] button[data-lang-option]'
  );
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.langOption as Lang | undefined;
      if (next) {
        setLang(next);
        syncPressedState();
      }
    });
  });
}

// Inicializar al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLangToggle);
} else {
  initLangToggle();
}
