# Design System — Portafolio

Documento de referencia para el uso de color y tipografía. No es una hoja de tokens: explica _para qué_ sirve cada color y cada fuente, y _cuándo_ usarlos. La regla general es que ningún estilo se elige a ojo, se deriva del rol del elemento.

---

## Principios

Cuatro ideas gobiernan todo lo demás. Si una decisión las contradice, la decisión está mal.

- El gris carga la estructura; el color solo señala. La página se sostiene en una escala de grises. El único color vivo aparece para dirigir la atención, no para decorar.
- Un único accent, usado con escasez. El azul manda precisamente porque es escaso. Cuando todo es accent, nada resalta.
- Se eleva con luminosidad, no con sombra. En un fondo oscuro las sombras casi no existen. Un bloque "sube" volviéndose un poco más claro que su fondo.
- La mono es condimento, no el plato. La fuente monoespaciada da el aire "dev", pero en dosis mínimas. En párrafos, estorba.

---

## Tipografía

Dos fuentes, con roles que no se cruzan.

### Inter — títulos, subtítulos y cuerpo

Inter es proporcional y está optimizada para pantalla. Es la fuente de todo lo que el usuario lee de corrido: el H1 del hero, los subtítulos de sección, los párrafos, las descripciones de proyecto, el texto de los botones.

El razonamiento de por qué también carga el cuerpo (y no JetBrains Mono): en una monoespaciada cada carácter ocupa el mismo ancho, lo que es ideal para alinear código pero antinatural para leer prosa. En párrafos largos baja la velocidad de lectura y cansa. El cuerpo necesita una proporcional, y Inter es neutra y legible en cualquier tamaño.

Pesos, de menor a mayor:

- 400 (regular): cuerpo de párrafos y texto secundario. Es el peso por defecto.
- 500 (medium): labels, texto de botones, subtítulos y cualquier énfasis dentro de un párrafo.
- 600 (semibold): títulos (H1, H2). Es el peso máximo. No se usa 700 ni superior: el texto grueso rompe el minimalismo y "vibra" sobre fondo oscuro.

### JetBrains Mono — solo acentos

La mono no toca prosa. Aparece únicamente en elementos cortos donde el aspecto "código" aporta identidad:

- Tags de stack (React, FastAPI, AWS).
- Labels de campos de formulario y atajos de teclado.
- Snippets de código, si los muestras.
- Metadata corta en tarjetas de proyecto (fechas, etiquetas de estado).

Pesos: 400 para tags y metadata; 500 para números de sección y labels que deban destacar.

Dónde nunca debe aparecer: títulos, subtítulos, párrafos o cualquier texto de más de una línea. Si te descubres poniendo mono en una frase, está mal asignada.

### Alternativa opcional

Si Inter te resulta demasiado neutra en los títulos, la única sustitución recomendada es Space Grotesk **solo para títulos**, dejando Inter en el cuerpo y JetBrains Mono en los acentos. Space Grotesk añade carácter geométrico arriba sin sacrificar legibilidad. No cambies nada más: cuerpo y mono se quedan igual.

---

## Color

La base es un lienzo casi negro. Alrededor del 95% de la interfaz vive en grises, y un solo azul actúa como color de acción y foco. El color no decora: se gana el derecho a aparecer señalando algo.

### Fondos y superficies

Tres niveles, y no más. La profundidad se comunica subiendo la luminosidad, no con sombras.

- `bg` (#0A0A0B): el lienzo de la página. Todo parte de aquí. Es el fondo por defecto de casi todas las secciones.
- `surface` (#141416): para separar un bloque del fondo sin recurrir a bordes fuertes ni sombras. Es el fondo de las tarjetas de proyecto, los code blocks y cualquier sección que quieras "levantar" del lienzo.
- `surface-2` (#1C1C20): un escalón más arriba. Se usa para el hover de una tarjeta, o para un elemento anidado dentro de otro que ya está en `surface`.

Regla: no anides más de dos niveles. La secuencia es `bg → surface → surface-2` y ahí termina. Con más niveles el ojo pierde la referencia de qué está delante de qué.

### Bordes

En fondo oscuro, el borde cumple el papel que la sombra cumple en fondo claro: define límites sin añadir peso.

- `border` (#26262B): la línea por defecto. Divisores entre secciones, contorno de tarjetas y borde del botón secundario (ghost).
- `border-strong` (#33333A): solo en hover o cuando un elemento necesita marcar su límite con más presencia.

Preferir siempre bordes sutiles antes que sombras. Una sombra sobre `#0A0A0B` casi no se ve y solo añade ruido.

### Texto

Tres niveles de jerarquía. El contenido se asigna según cuánta atención merece.

- `text-primary` (#F4F4F5): títulos y texto que el usuario debe leer sí o sí. Nota: es un casi-blanco, no blanco puro. El blanco puro (#FFFFFF) sobre negro vibra y cansa la vista; bajarlo un punto lo hace más cómodo sin perder contraste.
- `text-secondary` (#A1A1AA): el cuerpo de los párrafos y las descripciones. Aquí vive la mayor parte del texto de la página.
- `text-muted` (#71717A): metadata, fechas, placeholders y hints. Su contraste es bajo a propósito. Nunca se usa para texto que haya que leer de corrido.

Regla práctica: si dudas entre `secondary` y `muted` para un párrafo, es `secondary`. `muted` es solo para lo prescindible.

### Accent — el color vivo

Un único azul cibernético, más saturado que los azules de tu foto de perfil, para que la foto quede como fondo ambiental y el accent como color de acción.

- `accent` (#1F9CFF): botón primario, links, número de sección, iconos activos y el indicador de navegación activa. Es el color de "acción y foco".
- `accent-hover` (#4DB2FF): el mismo elemento bajo el cursor. Al ser más claro, transmite que el elemento "se enciende".
- `accent-subtle` (rgba(31,156,255,0.12)): fondo tenue para un badge o tag activo, o para resaltar un bloque. Aporta la presencia del accent sin encender un elemento entero.
- `on-accent` (#04121F): el texto que va encima del botón accent. Es un azul muy oscuro en lugar de negro plano, porque sobre el azure brillante se integra mejor y se siente más intencional.

Regla de oro: máximo dos o tres apariciones del accent por pantalla. Si el botón, los links, los tags y un icono son todos azul a la vez, ninguno resalta. El accent solo manda cuando es escaso.

### Estados funcionales

Estos colores comunican el resultado de una acción. No son colores de marca ni decorativos.

- `success` (#34D399): confirmación, por ejemplo un formulario enviado correctamente.
- `danger` (#F87171): errores, por ejemplo una validación fallida en el formulario de contacto.

Si aparecen fuera de un estado real (un check verde, un mensaje de error), están mal usados.

### Detalles de sistema

Piezas pequeñas que hacen que la página se sienta cuidada y accesible.

- `focus-ring` (rgba(31,156,255,0.5)): el anillo visible al navegar con teclado (Tab) sobre inputs y botones. No es opcional: es accesibilidad. Debe verse, no ocultarse.
- `selection` (rgba(31,156,255,0.20)): el fondo del texto cuando el usuario lo selecciona. Un detalle menor que da sensación de acabado.
- `grid-line` (rgba(255,255,255,0.03)): patrón de puntos o grid de fondo, opcional. Aporta textura tech a muy baja opacidad. Si se nota, está demasiado fuerte; debe ser casi imperceptible.

---

## Cómo decidir el color de un elemento

Cuando agregues cualquier elemento nuevo, no elijas un color: identifica su rol, y el rol ya trae su color.

- ¿Es un título o texto imprescindible? → `text-primary`
- ¿Es cuerpo o descripción? → `text-secondary`
- ¿Es metadata o placeholder? → `text-muted`
- ¿Es una acción o un link? → `accent` (más `on-accent` si es un botón)
- ¿Es un límite o divisor? → `border`
- ¿Necesita separarse del fondo? → súbelo a `surface`

Esto es lo que mantiene la coherencia a medida que la página crece: el color se deriva del rol, no se decide caso por caso.
