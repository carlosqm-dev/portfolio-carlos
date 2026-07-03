/**
 * Toggle de idioma ES/EN.
 * Ver ADR-003: actualiza data-lang, lang (accesibilidad) y localStorage.
 * Una sola responsabilidad: el idioma. El menú hamburguesa vive aparte.
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

function initLangToggle(): void {
  const toggles = document.querySelectorAll<HTMLElement>('[data-lang-toggle]');
  toggles.forEach((el) => {
    el.addEventListener('click', () => {
      const next: Lang = getCurrentLang() === 'es' ? 'en' : 'es';
      setLang(next);
    });
  });
}

// Inicializar al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLangToggle);
} else {
  initLangToggle();
}
