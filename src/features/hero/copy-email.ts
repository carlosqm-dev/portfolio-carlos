/**
 * Copiar email al portapapeles con feedback de dos estados.
 * Ver ADR-009: el email no se muestra; al click se copia y el botón pasa a
 * estado "copiado" (check + toast) y vuelve solo tras un timeout.
 * Una sola responsabilidad: copiar el email. El estado visual lo controla
 * CSS vía el atributo `data-copied` (ver SocialLinks.astro).
 */

const RESET_MS = 2000;

function initCopyEmail(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-copy-email]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    let timer: number | undefined;

    btn.addEventListener('click', async () => {
      const email = btn.dataset.email;
      if (!email) return;

      const copied = await copyToClipboard(email);
      if (!copied) return;

      btn.dataset.copied = 'true';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.dataset.copied = 'false';
      }, RESET_MS);
    });
  });
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Clipboard API moderna (requiere contexto seguro: https o localhost)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // cae al fallback
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCopyEmail);
} else {
  initCopyEmail();
}
