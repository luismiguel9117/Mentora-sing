# Guía de Indexación y Buenas Prácticas de SEO para luismiguel.pe

Este documento explica por qué tu portafolio no aparece actualmente en Google (`site:luismiguel.pe`), verifica el estado técnico de tu código y proporciona una guía práctica paso a paso para forzar el rastreo y la indexación, así como directrices SEO para el futuro.

---

## 🔍 1. Diagnóstico Técnico del Sitio
Hemos auditado el código fuente de tu portafolio y los archivos de configuración de Next.js. **No existe ningún impedimento técnico en el código que bloquee a Google.**

* **`robots.txt` (Correcto)**: Está configurado en [robots.ts](file:///g:/Escritorio/WEB/Portafolio/app/robots.ts) para permitir el rastreo completo de todos los agentes.
  ```txt
  User-agent: *
  Allow: /
  Sitemap: https://luismiguel.pe/sitemap.xml
  ```
* **`sitemap.xml` (Correcto)**: Está dinámicamente configurado en [sitemap.ts](file:///g:/Escritorio/WEB/Portafolio/app/sitemap.ts) con todas las rutas y localizaciones clave (`/es`, `/en`, `/es/about`, `/es/proyectos`, etc.).
* **Meta-Directivas (Correcto)**: No existe ninguna etiqueta `<meta name="robots" content="noindex">` en el diseño base ni en las páginas.
* **Código HTML Semántico (Correcto)**: El servidor entrega HTML plano estructurado con etiquetas jerárquicas y esquemas de datos JSON-LD estructurados.

### ¿Por qué no aparece todavía en Google?
Si un sitio web es nuevo o acaba de ser subido a producción en un nuevo dominio:
1. **Googlebot no sabe de su existencia**: Google descubre nuevas páginas rastreando enlaces desde otros sitios web ya indexados (backlinks). Si no hay enlaces externos apuntando a tu dominio, Googlebot puede tardar semanas o meses en toparse con él de forma natural.
2. **Falta de Solicitud Manual**: Para dominios nuevos, la forma estándar y más rápida de indexar es notificar directamente a Google a través de su consola de administración.

---

## 🚀 2. Guía Paso a Paso para Indexar el Sitio en Google

Sigue estos pasos para forzar a Google a rastrear e indexar `luismiguel.pe` de inmediato:

### Paso 1: Registrarse en Google Search Console
1. Ve a [Google Search Console](https://search.google.com/search-console).
2. Inicia sesión con tu cuenta de Google.
3. Añade una nueva propiedad:
   * **Recomendado (Dominio)**: Introduce `luismiguel.pe`. Esto cubrirá todas las variaciones (`http`, `https`, `www` y subdominios).

### Paso 2: Verificar la Propiedad del Dominio
Debes demostrarle a Google que eres el propietario del dominio.
1. Google te proporcionará un **registro TXT** de DNS (un código largo que empieza por `google-site-verification=...`).
2. Ve al proveedor donde compraste tu dominio `luismiguel.pe` (por ejemplo, NIC.pe, GoDaddy, Namecheap o Cloudflare).
3. Accede a la configuración de DNS de tu dominio y crea un **nuevo registro TXT**:
   * **Nombre/Host**: `@` (o déjalo vacío).
   * **Valor/Contenido**: El código de verificación de Google.
4. Vuelve a Search Console y haz clic en **Verificar**.

### Paso 3: Enviar el Sitemap a Google
Una vez verificada la propiedad, indícale a Google todas tus URLs en un solo paso:
1. En el menú lateral izquierdo de Search Console, ve a **Sitemaps**.
2. En "Añadir un nuevo sitemap", escribe: `sitemap.xml`.
3. Haz clic en **Enviar**.
*Google procesará el archivo y pondrá en cola de rastreo todas tus páginas indexadas.*

### Paso 4: Solicitar Indexación de URLs Individuales (Método Rápido)
Si quieres que la página principal (`https://luismiguel.pe/es`) se indexe en menos de 24 horas:
1. En la barra de búsqueda superior de Search Console ("Inspeccionar cualquier URL..."), introduce `https://luismiguel.pe/es`.
2. Verás un mensaje que dice: *"La URL no está en Google"*.
3. Haz clic en el botón **Solicitar indexación**.
*Esto le da la prioridad más alta de rastreo en los servidores de Google.*

---

## 🛠️ 3. Buenas Prácticas de SEO para el Desarrollo del Sitio

Aplica estas directrices en cada sección y página que construyas en el futuro:

### A. Jerarquía Estricta de Encabezados (Headings)
El orden semántico de las etiquetas `<h1>` a `<h6>` ayuda a los lectores de pantalla y a los bots a entender la estructura lógica de tu contenido.
* **Regla**: Solo **un** `<h1>` por página (generalmente descriptivo y oculto visualmente si interrumpe el diseño, utilizando `className="sr-only"`).
* **Flujo correcto**:
  * `[H1] Luis Miguel | Diseño Web, Branding y Marketing Digital` (Título principal)
    * `[H2] Servicios` (Sección principal)
      * `[H3] Diseño Web` (Subsección)
      * `[H3] Branding` (Subsección)
    * `[H2] Proyectos Destacados` (Sección principal)

### B. URLs Amigables y Canonicals
* **URLs Semánticas**: Evita IDs aleatorios. Usa slugs descriptivos en tus páginas y carpetas:
  * **Correcto**: `luismiguel.pe/es/proyectos/ritual-cosmetico`
  * **Incorrecto**: `luismiguel.pe/es/project?id=1239`
* **Canonicalización**: Next.js debe renderizar en el `<head>` de cada página la URL de referencia absoluta para evitar penalizaciones por contenido duplicado (por ejemplo, si se accede con o sin `www`):
  ```tsx
  <link rel="canonical" href="https://luismiguel.pe/es/proyectos" />
  ```
  *(Ya lo hemos configurado de forma dinámica en tu metadata base).*

### C. Datos Estructurados (JSON-LD Schema)
Los esquemas le proporcionan información explícita sobre el significado de tus páginas a los rastreadores, lo que permite que tu sitio aparezca con fragmentos enriquecidos (estrellas de valoración, FAQs, detalles del negocio) en las búsquedas.
* **Person & ProfessionalService**: Ya implementado en tu página principal (`page.tsx`) para asociar tu nombre y estudio con las keywords de diseño y branding.
* **Caso de Estudio / Artículos**: Si creas un blog o detalles de un proyecto, usa el esquema `TechArticle` o `CreativeWork`.

### D. Optimización de Metadatos
Cada página debe exportar un objeto `Metadata` en Next.js con:
1. **Title**: Un título descriptivo menor de 60 caracteres.
2. **Description**: Una descripción atractiva de entre 140 y 160 caracteres que actúe como fragmento (snippet) en los resultados de búsqueda.
3. **OpenGraph & Twitter Cards**: Definir la imagen promocional (`hero-bg-opt.webp`) para que las previsualizaciones al compartir en redes se vean profesionales.

### E. Accesibilidad de Imágenes (Alt Text)
* Cada elemento `<img>` o componente `Image` de Next.js debe incluir el atributo `alt`.
* **Regla**: Describe lo que hay en la imagen contextualmente. No uses palabras clave de relleno (keyword stuffing).
  * **Correcto**: `alt="Diseñador Luis Miguel trabajando en interfaz de marca en oficina de Lima"`
  * **Incorrecto**: `alt="diseno web branding seo peru portafolio"`
