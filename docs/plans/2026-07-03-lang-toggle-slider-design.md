# Toggle de idioma con indicador deslizante

**Fecha:** 2026-07-03
**Estado:** Aprobado — pendiente de implementación.

## Contexto

El toggle de idioma del Header es un único `<button>` con el texto `"ES / EN"`. Cumple, pero visualmente no comunica el estado activo: no hay forma de saber "en qué idioma está la página" mirando el control. Esto contradice el principio de DESIGN.md que dice que el color/visual debe "ganarse el derecho a aparecer señalando algo" — el control que decide el idioma debería **mostrar** el idioma activo.

## Objetivo

Reemplazar el toggle actual por un **segmented control** con dos botones (uno por idioma) y un indicador visual que se desliza al botón activo. El indicador es la única señal visual del estado; los labels quedan siempre visibles.

## Decisiones tomadas

| Pregunta                          | Decisión                                                                                                               | Razón                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| ¿Semántica del control?           | Dos `<button>` con `aria-pressed` (segmented control)                                                                  | Más accesible que un único botón con label dinámico: el screen reader anuncia el estado de cada opción.                     |
| ¿Qué hace el click?               | Setea el idioma (no alterna)                                                                                           | Predecible: si el sitio está en EN y querés EN, clickeás EN y queda en EN.                                                  |
| ¿Cómo se modela el label?         | `langToggle: { es: "ES", en: "EN" }` en `hero.json`                                                                    | Encaja con el shape bilingüe del resto del archivo.                                                                         |
| ¿Cómo se implementa el indicador? | Un único `<span>` con `position: absolute`, `transform: translateX(0\|100%)` animado por CSS leyendo `html[data-lang]` | Un solo elemento, animación performante, sin JS para el efecto visual.                                                      |
| ¿Default?                         | `es` (sin cambios, ya lo era por ADR-003)                                                                              | —                                                                                                                           |
| ¿Color del indicador?             | `surface-2` + `border-strong`, sin accent                                                                              | Aplica regla de escasez: el accent se reserva para hover/active. El indicador deslizante **es** el evento visual del click. |
| ¿Sistema bilingüe (ADR-003)?      | **No se toca**                                                                                                         | El `data-lang` en `html` sigue siendo la única fuente. El control solo cambia su presentación.                              |
| ¿Script anti-flash (BaseLayout)?  | **No se toca**                                                                                                         | Sigue seteando `data-lang` antes del primer paint. El indicador se posiciona correcto desde el inicio.                      |

## Cambios

### 1. `src/content/ui/hero.json`

```diff
- "langToggle": "ES / EN",
+ "langToggle": { "es": "ES", "en": "EN" },
```

### 2. `src/components/ui/LangToggle.astro` (nuevo)

Primitivo compartido. Recibe `labels: { es: string; en: string }` y `class?: string` (para el caso mobile full-width). Estructura:

```astro
<div
  role="group"
  aria-label="Idioma"
  class="lang-toggle border-border bg-surface/80 {class} relative inline-flex rounded-2xl border p-1"
>
  <span aria-hidden="true" class="lang-toggle__indicator ..."></span>
  <button type="button" data-lang="es" aria-pressed="true" class="...">{labels.es}</button>
  <button type="button" data-lang="en" aria-pressed="false" class="...">{labels.en}</button>
</div>
```

El `aria-pressed` inicial se setea en build asumiendo `es` (default, ADR-003). El script lo sincroniza en runtime.

### 3. `src/scripts/lang-toggle.ts`

Refactor:

- En `init()`, leer `documentElement.dataset.lang` y setear `aria-pressed` en cada botón.
- En `setLang()`, además de lo que ya hace, sincronizar `aria-pressed` en todos los `[data-lang-toggle-root] button[data-lang]`.
- Reemplazar el listener genérico `[data-lang-toggle]` por listener por botón: en click, `setLang(button.dataset.lang)`.
- Mantener la única responsabilidad: el idioma. La hamburguesa sigue aparte.

### 4. `src/features/header/Header.astro`

- Importar `LangToggle`.
- Reemplazar el `<button data-lang-toggle>` del desktop (líneas 53-60) por `<LangToggle labels={langToggle} />`.
- Reemplazar el `<button data-lang-toggle>` del mobile (líneas 89-95) por `<LangToggle labels={langToggle} class="w-full" />`.
- Quitar la prop `langToggle: string` del destructuring; ahora es `langToggle: { es, en }`.

### 5. `src/styles/global.css`

```css
/* Indicador — se posiciona sobre el botón activo */
.lang-toggle__indicator {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  left: 0.25rem;
  width: calc(50% - 0.25rem);
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  transform: translateX(0);
  transition: transform 200ms ease-out;
}

html[data-lang='en'] .lang-toggle__indicator {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .lang-toggle__indicator {
    transition: none;
  }
}
```

## No-objetivos (YAGNI)

- Atajo de teclado (Alt+L).
- Cambios al sistema bilingüe (ADR-003 intacto).
- Cambios al script anti-flash de `BaseLayout.astro`.
- Nuevo ADR: este cambio es evolución del control descrito en ADR-009; documentar acá es suficiente.

## Verificación

- Click en EN → indicador se desliza a la derecha, página pasa a EN, `aria-pressed` se actualiza.
- Recargar con `localStorage` en `en` → arranca en EN, indicador ya a la derecha, sin flash.
- Tab con teclado sobre el toggle → foco visible, screen reader anuncia "Idioma, grupo, ES, botón, presionado, EN, botón, no presionado".
- DevTools → emular `prefers-reduced-motion: reduce` → indicador salta sin transición.
- Mobile (DevTools) → toggle en el menú hamburguesa con `class="w-full"`, indicador al 50% del ancho.
- Contraste: `text-primary` sobre `surface-2` cumple AAA; `text-muted` sobre `surface` cumple AA (UI inactiva, no prosa).
