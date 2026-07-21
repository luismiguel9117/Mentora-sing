---
name: Luis Miguel Studio
description: Independent design studio crafting luxury digital branding, creative technology, and cinematic digital experiences.
colors:
  primary: "#FF5C00"
  accent-red: "#FF3D00"
  neutral-bg: "#0A0A0A"
  neutral-fg: "#ffffff"
  border-dim: "rgba(255, 255, 255, 0.08)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.05em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  pill: "9999px"
  xl: "3rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.pill}"
    padding: "0.8rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-red}"
---

# Design System: Luis Miguel Studio

## 1. Overview

**Creative North Star: "Atmospheric Gallery / Editorial Minimalism"**

An immersive, dark-room portfolio showing high-contrast visual systems and glowing light leaks. Spacing is expansive and rhythmic, shifting between density for content reading and extreme openness for focus. The interface relies on glowing color accents and high-fidelity typography to command attention.

This system explicitly rejects generic SaaS layouts with rigid card grids, plain white/black backgrounds, or pure primary colors.

**Key Characteristics:**
* **Visual Direction**: Everything feels carefully directed, not just designed.
* **Cinematic & Sophisticated**: Clean, refined, modern, and cinematic.
* **Confidence through Simplicity**: Generous whitespace, few things but executed flawlessly.
* **Creative-Tech**: The intersection of digital interfaces, branding, visual design, and elegant motion.

## 2. Colors

A premium, highly-controlled warm dark palette. Avoids neon, saturated RGB, or raw primary colors.

### Primary
* **Solar Orange** (#FF5C00 / oklch(64.8% 0.287 35.8)): Burnt orange accent, used as the primary brand signature for critical CTAs, active states, and decorative hover transitions.

### Neutral
* **Abyssal Dark** (#0A0A0A / oklch(14% 0 0)): Warm-toned blacks. Baseline background color, subtly tinted to feel deep yet organic rather than cold and synthetic.
* **Pure Light** (#FFFFFF / oklch(100% 0 0)): Primary typography and core foreground elements.

### Secondary
* **Solar Red** (#FF3D00 / oklch(60.1% 0.278 28.5)): Deep reds. Highlight accent color for deep hover states and secondary action signals.

**The One Accent Rule.** The primary accent is used on ≤10% of any given screen. Its rarity is the point.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with sans-serif fallback)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif fallback)

**Character:** Bold, geometric header scaling paired with highly legible, clean sans-serif text.

### Hierarchy
* **Display** (800, clamp(2.5rem, 7vw, 4.5rem), 1.0): Used exclusively for main hero headlines and huge statement text.
* **Headline** (700, 3rem, 1.1): Core section headers.
* **Title** (600, 1.25rem, 1.2): Component titles, cards, and sub-headings.
* **Body** (500, 1rem, 1.6): Body paragraphs and descriptive blocks. Max line length capped at 75ch.
* **Label** (700, 0.75rem, uppercase, 0.1em): Small metadata tags, badges, and section pre-headers.

## 4. Elevation

Surfaces are flat by default, utilizing glowing gradients and border transparency rather than heavy box shadows for depth.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Glowing highlights appear only as a response to state (hover, focus, active).

## 5. Components

Sleek, tactile elements with highly-kinetic hover behaviors.

### Buttons
* **Shape:** Rounded pill (9999px radius)
* **Primary:** Solar Orange (#FF5C00) background with bold white text. Padding: `0.8rem 2rem`.
* **Hover / Focus:** Translates upward slightly (`-2px`) with an increased radial shadow glow.

### Cards / Containers
* **Corner Style:** Rounded-xl (3rem/48px radius)
* **Background:** Deep dark transparency or dark outline containment.
* **Border:** Thin boundary line (`rgba(255, 255, 255, 0.08)`) to define space on dark background.

## 6. Do's and Don'ts

Concrete, forceful guardrails to maintain brand visual fidelity.

### Do:
* **Do** tint all dark backgrounds toward the primary brand hue to avoid sterile #000 or flat gray.
* **Do** use large, high-contrast typography scaling for section headings to reinforce the editorial feel.
* **Do** keep spacing asymmetric to create a sense of breathing room.
* **Do** use slow, atmospheric, and elegant easing for all animations.

### Don't:
* **Don't** repeat card patterns of identical sizes in standard 3-column rows without visual variation.
* **Don't** use standard box shadows; use translucent border overlays and soft glow backdrops instead.
* **Don't** use neon colors, saturated RGB, or loud primary colors.
* **Don't** use flashy, snappy, or overstimulating animations.
* **Don't** design like a generic SaaS template, gamer portfolio, or corporate site.
