# Reglas y Directrices del Proyecto: Mentora

Este archivo define las reglas de comportamiento, diseño y codificación para todos los agentes de IA que contribuyan a este espacio de trabajo.

---

## 1. Reglas de Estilo Gráfico e Identidad Visual
Cualquier modificación o creación de elementos de interfaz de usuario debe alinearse con la guía de diseño del proyecto ([style_guide.md](file:///g:/Escritorio/MENTORA/docs/style_guide.md)):

* **Colores Primarios:** 
  - Azul Mentora: `#4f46e5` (Hover: `#4338ca`)
  - Acento Cyan: `#0ea5e9`
  - Slate Oscuro: `#0f172a` (para textos destacados en modo claro)
* **Gama de Colores para Gamificación:**
  - Verde Correcto: `#10b981` (Hover: `#059669`)
  - Rojo Error: `#ef4444` (Hover: `#dc2626`)
  - Amarillo Destacado: `#fbbf24`
* **Tema Oscuro Premium (Para la app interactiva):**
  - Fondo general: `#0b0f19`
  - Tarjetas / Paneles: `#1f2937`
  - Bordes: `#374151`
* **Estilo de Botones:**
  - Usar botones estilo 3D (Duolingo-like) con bordes gruesos inferiores (`border-bottom: 4px solid var(--shadow-color)`) que den sensación de juguete físico.
  - El botón debe desplazarse hacia abajo (`transform: translateY(4px)`) y reducir su sombra a cero al activarse.
  - Para botones no gamificados, usar botones estilo cápsula (`border-radius: 9999px`).
* **Tipografía:** Usar Google Font `'Outfit'` e `'Inter'` como tipografía predeterminada para cabeceras y cuerpo respectivamente.

---

## 2. Directrices Tecnológicas y de Desarrollo

* **Síntesis de Audio y Efectos:**
  - Evitar el uso de librerías o dependencias externas pesadas para archivos de audio `.wav` o `.mp3`.
  - Usar la Web Speech API (`SpeechSynthesis`) en idioma `en-US` para reproducir pronunciación de palabras de forma nativa.
  - Usar la Web Audio API (`AudioContext` y osciladores de síntesis) para generar sonidos cortos de éxito/error de lecciones. Esto garantiza portabilidad offline.
* **Persistencia:**
  - Todo el progreso del usuario (XP, rachas, lecciones completadas, estado de vidas) debe almacenarse localmente bajo las claves de `localStorage` prefijadas con `mentora_`.
* **Componentes Responsivos:**
  - Toda vista o componente debe verse correctamente en dispositivos móviles (la barra lateral se desplaza a una barra inferior de pestañas).

---

## 3. Optimización de Recursos y Ejecución de Agentes

* **Evitar Invocación de Agentes Simultáneos:** No invocar subagentes adicionales (`invoke_subagent` o `define_subagent`) en paralelo para evitar la degradación del rendimiento de la máquina del usuario. Todo el análisis y la codificación deben ser resueltos secuencialmente por el agente principal.
* **Gestión de Procesos en Segundo Plano:** 
  - Limpiar y detener cualquier servidor de desarrollo de Vite o proceso en ejecución (`npm run dev`) cuando el usuario no esté probando activamente la interfaz.
  - Asegurar que no queden watchers innecesarios consumiendo CPU y memoria RAM.
