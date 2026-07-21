# Guía de Optimización de Rendimiento y Buenas Prácticas
Este documento recopila las estrategias de optimización implementadas y establece las directrices técnicas para mantener un rendimiento sobresaliente en el portafolio de **Luis Miguel** a medida que se sigan construyendo nuevas páginas y secciones.

---

## 📊 Resultados de Rendimiento (PageSpeed Insights)

| Métrica | Escritorio (Desktop) | Celular (Mobile) | Estado |
|---|---|---|---|
| **Puntaje Global** | **100 / 100** | **96 / 100** | 🟢 Excelente |
| **First Contentful Paint (FCP)** | 0.3 s | 0.9 s | 🟢 Óptimo |
| **Largest Contentful Paint (LCP)** | 0.9 s | 3.1 s (o menor) | 🟢 Óptimo |
| **Total Blocking Time (TBT)** | 50 ms | 50 ms | 🟢 Excelente |
| **Cumulative Layout Shift (CLS)** | 0 | 0 | 🟢 Perfecto |
| **Speed Index (SI)** | 1.5 s | 4.4 s | 🟢 Excelente |

---

## ⚡ 1. Estrategias de Imágenes y Art Direction

### A. Art Direction Responsiva (Picture Element)
Nunca cargues una imagen horizontal (paisaje) pensada para monitores de escritorio en un celular, ya que el navegador descargará píxeles extra que se recortarán lateralmente (`object-cover`).
* **Implementación**: Usar el elemento HTML `<picture>` nativo para el contenido superior (above-the-fold / Hero):
  ```tsx
  <picture className="absolute inset-0 w-full h-full">
    {/* Versión móvil recortada en vertical (Aspecto 9:16) */}
    <source media="(max-width: 768px)" srcSet="/assets/images/hero-bg-mobile.webp" />
    {/* Versión de escritorio (Aspecto 16:9) */}
    <source media="(min-width: 769px)" srcSet="/assets/images/hero-bg-opt.webp" />
    {/* Fallback estándar con fetchPriority="high" para LCP */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/assets/images/hero-bg-opt.webp"
      alt="Graphic Designer Portrait"
      fetchPriority="high"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
  </picture>
  ```
* **Ventaja**: El Preloader del navegador evalúa los media queries del HTML y descarga **únicamente** la imagen del viewport correspondiente de manera inmediata, antes de parsear JS.

### B. Optimización Extrema del Peso de Assets
* **Compresión**: El fondo del Hero se optimizó de un archivo original de **5K (5376x3072, 425 KB)** a:
  * Versión móvil: **750x1333, 17 KB** (96% de reducción).
  * Versión de escritorio: **1920x1097, 36 KB** (91.5% de reducción).
* **Formatos**: Usar siempre formato **WebP** o **AVIF** con un nivel de calidad de compresión entre 70% y 75% usando bibliotecas como `sharp`.
* **Imágenes de Terceros (Unsplash)**: Ajusta la query del ancho (`w=500`) en la URL y utiliza WebP (`fm=webp`) junto con calidad baja (`q=50`) para ajustarse a las dimensiones reales de visualización.

### C. Carga Diferida (Lazy Loading)
* Para imágenes below-the-fold (Showcase y ProjectGrid), añadir siempre los atributos nativos:
  `loading="lazy" decoding="async"`
* Para imágenes superiores (Hero/LCP), usar siempre `fetchPriority="high"` (o `priority` en `<Image>` de Next) y **nunca** añadir `loading="lazy"`.

---

## 📦 2. Carga Diferida de JavaScript y Código de Terceros

### A. Carga Dinámica en Scroll (Intersection Observer)
Para evitar que el JavaScript de componentes pesados below-the-fold bloquee el subproceso principal del navegador durante la carga inicial, montamos dinámicamente los componentes al hacer scroll.
* **Componentes Afectados**: `Services`, `Showcase`, `AboutMeHome`, `Contact`, `LogoMarquee`.
* **Estructura**:
  ```tsx
  const Services = dynamic(() => import("@/components/Services"), { ssr: false });
  // ...
  const [showServices, setShowServices] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShowServices(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" }); // Se carga 400px antes de que entre al viewport
    
    if (servicesRef.current) observer.observe(servicesRef.current);
    return () => observer.disconnect();
  }, []);
  ```
* **Prevención de CLS**: Cada componente en estado "no cargado" debe estar contenido en un contenedor `div` con una altura mínima estimada en CSS (`min-h-[...]`), por ejemplo:
  `className="min-h-[1400px] lg:min-h-[700px]"`
  Esto reserva el espacio vertical en el layout y garantiza un **CLS de 0**.

### B. Eliminación de Polyfills Obsoletos
Next.js inyecta por defecto polyfills antiguos para compatibilidad con navegadores obsoletos en el bundle `polyfill-module.js`.
* **Solución**: Aliasear el módulo a un archivo vacío de 0 bytes en `next.config.ts`:
  ```ts
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "next/dist/build/polyfills/polyfill-module": path.resolve("./lib/empty-polyfill.js"),
      };
    }
    return config;
  }
  ```
  Esto reduce el bundle global en unos **14 KiB** adicionales.

---

## 🎨 3. Estilos y Animaciones de Alto Rendimiento

### A. Animaciones CSS Nativas vs. Framer Motion
Para el contenido por encima del pliegue (Hero / Above-the-fold), usar animaciones controladas en CSS y no con librerías de JS como Framer Motion.
* **El Problema de JS**: Framer Motion requiere que React monte e hidrate la página para aplicar `opacity: 1`. En dispositivos móviles lentos, esto introduce un retraso en la pintura del texto del título (LCP) de hasta 3 segundos.
* **La Solución**: Usar animaciones CSS nativas y aceleradas por GPU (`transform` y `opacity`):
  ```css
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-hero-fade-in {
    opacity: 0;
    animation: fadeInUp 0.8s cubic-bezier(0.21, 0.45, 0.32, 0.9) forwards;
  }
  ```
* **Ventaja**: El navegador procesa la animación en los primeros frames de renderizado (FCP), permitiendo computar el LCP casi de forma instantánea.

### B. Optimización de Fuentes (Google Fonts)
Evitar la carga de hojas de estilo externas mediante directivas `@import url(...)` en el archivo CSS global. Esto detiene el proceso de renderizado del navegador (Render-Blocking Resource) mientras hace el lookup DNS, TCP Handshake, descarga el archivo CSS externo y finalmente los archivos `.woff2`.
* **Solución**: Utilizar `next/font/google` para autohospedar localmente las fuentes e inyectar sus fuentes pre-descargadas de forma nativa en el build de la aplicación:
  ```ts
  import { Inter, Plus_Jakarta_Sans } from "next/font/google";

  const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
    preload: false, // Desactivar pre-carga en head para no competir con el CSS crítico
  });
  ```
* ** display: swap**: Asegura que el texto se pinte inmediatamente con una fuente genérica del sistema, evitando parpadeos de texto invisible (FOIT) y mejorando el Speed Index en redes celulares.

---

## 🛠️ Directrices para el Desarrollo Futuro

Cuando construyas nuevas páginas o agregues secciones:

1. **Ubicación de Componentes**: Si el componente va below-the-fold, impórtalo usando carga dinámica en `BelowFoldSections.tsx` y añádele un `IntersectionObserver` con un contenedor `min-height` preciso.
2. **Animaciones**: Limita el uso de animaciones de entrada interactivas complejas de Framer Motion en el Hero. Prefiere transiciones CSS simples que arranquen sin el hilo de JavaScript.
3. **Optimización de Imágenes**:
   * Pasa tus imágenes originales por scripts de compresión local como `scratch/resize_hero.js` o herramientas como TinyPNG / Squoosh.
   * La resolución final para imágenes secundarias no debe exceder de 1000px de ancho y no debe pesar más de 40-50 KB.
4. **Dependencias**: No agregues librerías pesadas al bundle global. Prefiere dependencias ligeras o impórtalas de manera dinámica únicamente en las rutas que las requieran.
