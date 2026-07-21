# Directrices de Diseño e Identidad Visual: Mentora

Este documento contiene la guía de estilos visuales extraída directamente de la landing page de **Mentora** para asegurar la consistencia gráfica y estética de la aplicación web.

---

## 1. Paleta de Colores

La paleta de Mentora combina un azul real/índigo corporativo con acentos cian y toques de verde y amarillo para llamadas a la acción (CTAs) de gran impacto.
### Colores Principales
- **Azul Mentora (Brand Indigo):** `#6265ff` (Tropical Indigo)
  - *Uso:* Logotipo, botones primarios, enlaces activos y texto destacado.
  - *Hover:* `#4f39f6`
  - *Sombra 3D:* `#201c4e`
- **Gris Oscuro (Deep Slate):** `#101b2e` (Oxford Blue)
  - *Uso:* Títulos principales de alta jerarquía y textos en modo claro.
- **Celeste / Tiffany (Accent Teal):** `#45bcac` (o `#72d6c5`)
  - *Uso:* Acentos secundarios, badges y parte de los degradados.

### Colores de Campaña / Alertas
- **Verde Éxito (Success Green):** `#1e9b6a` (Shamrock Green)
  - *Uso:* Íconos de verificación (checkmarks), banners promocionales y botones de éxito.
- **Amarillo Llamativo (Promo Yellow):** `#f99c00`
  - *Uso:* Etiquetas de racha y advertencia.
### Colores de Fondo y Bordes
- **Fondo Claro (Light Mode):** `#ffffff` con secciones en `#f8fafc` (Slate 50).
- **Bordes Claros:** `#e2e8f0` (Slate 200) para un contraste sutil.
- **Fondo Oscuro (Dark Mode Gamificado):** `#0b0f19` (Slate 950) con tarjetas en `#1f2937` (Slate 800) y bordes en `#374151` (Slate 700).

### Degradados Corporativos
- **Degradado Acento (Cápsula de Tiempo):**
  `linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #0ea5e9 100%)`
  - *Uso:* Insignias flotantes importantes (ej. *"6 Min al día"*).
- **Degradado Banner Top:**
  `linear-gradient(90deg, #4f46e5 0%, #10b981 100%)`

---

## 2. Tipografía

Mentora utiliza tipografías geométricas y redondeadas sin serifas, que transmiten modernidad, accesibilidad y dinamismo (EdTech).

- **Tipografía de Cabeceras (Títulos & Logo):** `Outfit` o `Fredoka`
  - *Características:* Peso grueso (`font-weight: 700` o `800`), formas circulares, tracking ligeramente cerrado.
- **Tipografía de Cuerpo (Textos & Botones):** `Inter` o `Outfit` (peso `400` para lectura, `600` para botones).
  - *CSS:* `font-family: 'Outfit', 'Inter', sans-serif;`

---

## 3. Elementos de Interfaz y Botones

### Botones
- **Botón Pill (Cápsula):** Bordes totalmente redondeados (`border-radius: 9999px`).
  - *Ejemplo:* Botón *"Únete ahora"*, *"Empieza desde cero (Nivel A1)"*.
  - *Estilo:* Fondo sólido `#4f46e5` con sombra sutil o degradado azul.
- **Botones con Contorno:** Fondo transparente, borde fino de 1.5px `#e2e8f0`, texto en gris oscuro `#334155`.

### Tarjetas (Cards)
- **Bordes Redondeados:** `border-radius: 16px` o `24px` para las tarjetas de cursos/cápsulas.
- **Sombra Suave (Soft Shadow):**
  `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);`
- **Bordes:** Finos de `1px solid rgba(226, 232, 240, 0.8)`.

---

## 4. Estilo de los Módulos de Aprendizaje

De acuerdo a la captura de pantalla del celular:
- **Temarios:** Lista de módulos colapsables con bordes redondeados, borde `#e2e8f0` y fondo blanco.
- **Lecciones completadas:** Círculo verde con checkmark blanco y línea de progreso vertical.
- **Badges de Categoría:**
  - **Speaking:** Color violeta/azul con ícono de diálogo.
  - **Vocabulary:** Color azul/celeste con ícono de tarjetas.
  - **Listening:** Color verde con ícono de megáfono/altavoz.
