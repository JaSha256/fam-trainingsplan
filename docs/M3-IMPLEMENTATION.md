# Material Design 3 (M3) Implementation Guide

**Version**: 3.2.0 **Last Updated**: 2025-10-19 **Spec Reference**:
[m3.material.io](https://m3.material.io)

## Overview

This project implements Google's Material Design 3 (M3) design system while
preserving the existing OKLCH color system and Tailwind CSS v4 setup. The
implementation is **non-destructive** and **backward compatible** - all existing
components continue to work.

### File Structure

The M3 implementation is organized across multiple CSS modules (max 900 lines
per file):

- **`src/style.css`** (356 lines): Main stylesheet with imports and core design
  tokens
- **`src/styles/legacy-components.css`** (178 lines): Non-M3 legacy components
- **`src/styles/m3-components.css`** (558 lines): Core M3 components (buttons,
  cards, FAB, snackbar, switch)
- **`src/styles/m3-chips-nav.css`** (373 lines): M3 Chips and Navigation Rail
- **`src/styles/utilities-animations.css`** (479 lines): Utilities, animations,
  browser-specific styles

## Table of Contents

1. [Color System](#color-system)
2. [Dark Mode](#dark-mode)
3. [Elevation System](#elevation-system)
4. [Typography Scale](#typography-scale)
5. [Button Components](#button-components)
6. [Card Components](#card-components)
7. [State Layers](#state-layers)
8. [Floating Action Button (FAB)](#floating-action-button-fab)
9. [Snackbar](#snackbar)
10. [Switch Component](#switch-component)
11. [Chips](#chips)
12. [Navigation Rail](#navigation-rail)
13. [Motion System](#motion-system)
14. [Usage Examples](#usage-examples)
15. [Best Practices](#best-practices)

---

## Color System

_For Dark Mode color system, see the [Dark Mode](#dark-mode) section below._

### M3 Surface Colors

M3 introduces a hierarchical surface color system for creating depth and
structure:

```css
--md-sys-color-surface                   /* Base surface */
--md-sys-color-surface-dim               /* Dimmed surface */
--md-sys-color-surface-bright            /* Brightest surface */
--md-sys-color-surface-container-lowest  /* Lowest container */
--md-sys-color-surface-container-low     /* Low container */
--md-sys-color-surface-container         /* Standard container */
--md-sys-color-surface-container-high    /* High container */
--md-sys-color-surface-container-highest /* Highest container */
```

### On-Surface Colors

Colors for text and icons on surface backgrounds:

```css
--md-sys-color-on-surface         /* Primary text on surface */
--md-sys-color-on-surface-variant /* Secondary text on surface */
```

### Outline Colors

For borders and dividers:

```css
--md-sys-color-outline         /* Standard outline */
--md-sys-color-outline-variant /* Subtle outline */
```

### Primary Container

For primary color containers:

```css
--md-sys-color-primary-container    /* Primary container background */
--md-sys-color-on-primary-container /* Text on primary container */
```

---

## Dark Mode

### Overview

The project implements a comprehensive M3-compliant dark theme that follows
Material Design 3 best practices:

- **Base Surface**: `#121212` (oklch(0.16 0.005 240)) - Not pure black for
  better contrast
- **Desaturated Colors**: Reduced saturation to prevent eye strain
- **Automatic Adaptation**: Existing Tailwind utility classes automatically
  adapt to dark mode
- **Smooth Transitions**: 300ms animated theme switches

### Activation

Dark mode is controlled via the `data-theme` attribute on the `<html>` element:

```javascript
// Enable dark mode
document.documentElement.setAttribute('data-theme', 'dark')

// Enable light mode
document.documentElement.setAttribute('data-theme', 'light')
```

### Toggle UI

A Material Design 3 Switch component is provided in the toolbar:

```html
<div
  class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full border border-slate-200"
>
  <svg class="w-4 h-4 text-slate-700"><!-- Moon icon --></svg>
  <label class="md-switch">
    <input
      type="checkbox"
      x-model="$store.ui.darkMode"
      @change="document.documentElement.setAttribute('data-theme', $store.ui.darkMode ? 'dark' : 'light')"
    />
    <span class="md-switch-track"></span>
    <span class="md-switch-thumb"></span>
    <span class="md-switch-state-layer"></span>
  </label>
</div>
```

### Dark Mode Color Palette

#### Surface Colors

```css
:root[data-theme='dark'] {
  /* Based on #121212 Material Design guideline */
  --md-sys-color-surface: oklch(0.16 0.005 240); /* #121212 base */
  --md-sys-color-surface-dim: oklch(0.13 0.005 240); /* Darker surfaces */
  --md-sys-color-surface-bright: oklch(0.24 0.005 240); /* Elevated surfaces */
  --md-sys-color-surface-container-lowest: oklch(0.12 0.005 240);
  --md-sys-color-surface-container-low: oklch(0.15 0.005 240);
  --md-sys-color-surface-container: oklch(0.18 0.005 240);
  --md-sys-color-surface-container-high: oklch(0.21 0.005 240);
  --md-sys-color-surface-container-highest: oklch(0.26 0.005 240);
}
```

#### Text Colors

```css
:root[data-theme='dark'] {
  /* Desaturated for reduced eye strain */
  --md-sys-color-on-surface: oklch(0.87 0.005 240); /* Primary text */
  --md-sys-color-on-surface-variant: oklch(0.7 0.008 240); /* Secondary text */
}
```

#### Border Colors

```css
:root[data-theme='dark'] {
  --md-sys-color-outline: oklch(0.5 0.008 240); /* Standard borders */
  --md-sys-color-outline-variant: oklch(0.35 0.008 240); /* Subtle borders */
}
```

#### Primary Colors (Desaturated)

```css
:root[data-theme='dark'] {
  --color-primary-500: oklch(0.6 0.12 240); /* Main primary - less saturated */
  --color-primary-600: oklch(0.68 0.11 240);
  --color-primary-700: oklch(0.75 0.1 240);
}
```

### Automatic Class Adaptation

The implementation includes automatic dark mode support for common Tailwind
classes via `utilities-dark-mode.css`:

#### Background Classes

```css
:root[data-theme='dark'] .bg-white {
  background-color: var(--md-sys-color-surface-container) !important;
}

:root[data-theme='dark'] .bg-slate-50 {
  background-color: var(--md-sys-color-surface-container-low) !important;
  color: var(--md-sys-color-on-surface) !important;
}
```

#### Text Classes

```css
:root[data-theme='dark'] .text-slate-900 {
  color: var(--md-sys-color-on-surface) !important;
}

:root[data-theme='dark'] .text-slate-700 {
  color: var(--md-sys-color-on-surface-variant) !important;
}
```

#### Form Elements

```css
:root[data-theme='dark'] select,
:root[data-theme='dark'] input[type='text'] {
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  border-color: var(--md-sys-color-outline);
}
```

### Persistence

Dark mode preference is stored using Alpine.js persist plugin:

```javascript
// In Alpine store
darkMode: Alpine.$persist(false).as('darkMode')

// Initialization on page load
function initDarkMode() {
  const darkMode = Alpine.store('ui').darkMode
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}
```

### Best Practices for Dark Mode

1. **Use M3 Color Tokens**: Always use `var(--md-sys-color-*)` instead of
   hardcoded colors
2. **Test Both Modes**: Verify all components work in light and dark mode
3. **Desaturate Brand Colors**: Reduce saturation in dark mode to prevent eye
   strain
4. **Maintain Contrast**: Ensure WCAG AA contrast ratios (4.5:1 for text)
5. **Avoid Pure Black**: Use `#121212` or similar as base instead of `#000000`

### Design Rationale

The dark mode implementation follows Material Design 3 guidelines:

**Why #121212 instead of #000000?**

- Better contrast for colorful elements
- Softer on eyes during extended use
- Allows shadows to be visible

**Why desaturated colors?**

- Highly saturated colors "vibrate" on dark backgrounds
- Reduced saturation improves readability
- Less eye strain during long sessions

**Why lighter primary colors?**

- Provides better contrast on dark backgrounds
- Maintains brand recognition
- Ensures accessibility compliance

---

## Elevation System

M3 uses 6 elevation levels (0-5) with standardized shadows:

| Level | Variable               | Use Case                               |
| ----- | ---------------------- | -------------------------------------- |
| 0     | `--md-sys-elevation-0` | No elevation (none)                    |
| 1     | `--md-sys-elevation-1` | Resting cards, filled buttons on hover |
| 2     | `--md-sys-elevation-2` | Elevated cards on hover                |
| 3     | `--md-sys-elevation-3` | FAB resting state, snackbars           |
| 4     | `--md-sys-elevation-4` | FAB on hover                           |
| 5     | `--md-sys-elevation-5` | Modals, dialogs                        |

### Shadow Composition

Each elevation (except 0) uses two shadows:

- **Key shadow** (directional): `oklch(0 0 0 / 0.3)`
- **Ambient shadow** (all-around): `oklch(0 0 0 / 0.15)`

Example:

```css
box-shadow: var(--md-sys-elevation-3);
```

---

## Typography Scale

M3 provides 15 typescale classes organized in 5 categories:

### Display (Large headings)

```html
<h1 class="md-typescale-display-large">57px Display Large</h1>
<h2 class="md-typescale-display-medium">45px Display Medium</h2>
<h3 class="md-typescale-display-small">36px Display Small</h3>
```

### Headline (Section headings)

```html
<h2 class="md-typescale-headline-large">32px Headline Large</h2>
<h3 class="md-typescale-headline-medium">28px Headline Medium</h3>
<h4 class="md-typescale-headline-small">24px Headline Small</h4>
```

### Title (Subsection headings)

```html
<h3 class="md-typescale-title-large">22px Title Large</h3>
<h4 class="md-typescale-title-medium">16px Title Medium</h4>
<h5 class="md-typescale-title-small">14px Title Small</h5>
```

### Body (Content text)

```html
<p class="md-typescale-body-large">16px Body Large</p>
<p class="md-typescale-body-medium">14px Body Medium</p>
<p class="md-typescale-body-small">12px Body Small</p>
```

### Label (Button/UI text)

```html
<span class="md-typescale-label-large">14px Label Large</span>
<span class="md-typescale-label-medium">12px Label Medium</span>
<span class="md-typescale-label-small">11px Label Small</span>
```

---

## Button Components

### Filled Button (Primary)

Primary action button with elevation.

```html
<button class="md-btn-filled">Primary Action</button>
```

**States**:

- Resting: `elevation-0`
- Hover: `elevation-1`
- Focus: `elevation-1` + outline
- Active: `elevation-0`
- Disabled: 40% opacity

### Outlined Button (Secondary)

Secondary action with border.

```html
<button class="md-btn-outlined">Secondary Action</button>
```

**States**:

- Resting: transparent background
- Hover: `primary-50` background
- Focus: `primary-50` background + outline
- Active: `primary-100` background

### Text Button (Tertiary)

Minimal style for tertiary actions.

```html
<button class="md-btn-text">Tertiary Action</button>
```

**States**: Same as outlined, but no border.

### Filled Tonal Button (Alternative Primary)

Primary action with surface container color.

```html
<button class="md-btn-filled-tonal">Alternative Primary</button>
```

**Use Case**: When you need a less prominent primary action.

---

## Card Components

### Elevated Card

Card with subtle elevation that increases on hover.

```html
<article class="md-card-elevated">
  <h3>Card Title</h3>
  <p>Card content...</p>
</article>
```

**Elevation**: `1` (resting) → `2` (hover)

### Filled Card

Card with filled surface container color.

```html
<article class="md-card-filled">
  <h3>Card Title</h3>
  <p>Card content...</p>
</article>
```

**Elevation**: `0` (resting) → `1` (hover)

### Outlined Card

Card with border instead of elevation.

```html
<article class="md-card-outlined">
  <h3>Card Title</h3>
  <p>Card content...</p>
</article>
```

**Border**: `outline-variant` (resting) → `outline` (hover)

---

## State Layers

Interactive overlay that provides visual feedback on hover/focus/press.

### Basic Usage

```html
<button class="md-state-layer md-btn-filled">Button with State Layer</button>
```

### Opacity Values (M3 Spec)

- **Hover**: 8% (`opacity: 0.08`)
- **Focus**: 12% (`opacity: 0.12`)
- **Press**: 12% (`opacity: 0.12`)
- **Drag**: 16% (`opacity: 0.16`)

### Manual State Control

```html
<!-- Pressed state -->
<button class="md-state-layer md-state-pressed">Pressed</button>

<!-- Dragging state -->
<div class="md-state-layer md-state-dragged">Dragging</div>
```

---

## Floating Action Button (FAB)

Fixed bottom-right action button for primary page actions.

### Standard FAB

```html
<button class="md-fab">
  <svg><!-- icon --></svg>
  <span>Action</span>
</button>
```

### Small FAB

```html
<button class="md-fab md-fab-small">
  <svg><!-- icon --></svg>
</button>
```

### Large FAB

```html
<button class="md-fab md-fab-large">
  <svg><!-- icon --></svg>
  <span>Large Action</span>
</button>
```

**Position**: Fixed bottom-right (1.5rem from edges) **Elevation**: `3`
(resting) → `4` (hover) **Animation**: Scale 1.05 on hover

---

## Snackbar

Bottom-centered notification component.

### HTML Structure

```html
<div class="md-snackbar md-snackbar-visible">
  <span>Notification message</span>
  <button class="md-snackbar-action">Action</button>
</div>
```

### Show/Hide

```javascript
// Show
snackbar.classList.add('md-snackbar-visible')

// Hide
snackbar.classList.remove('md-snackbar-visible')
```

**Position**: Fixed bottom-center (2rem from bottom) **Width**: Min 344px, Max
672px **Elevation**: `3` **Animation**: Slide up with emphasized-decelerate
easing

---

## Motion System

### Duration Tokens

```css
/* Short durations (50-200ms) */
--md-sys-motion-duration-short1: 50ms --md-sys-motion-duration-short2: 100ms
  --md-sys-motion-duration-short3: 150ms --md-sys-motion-duration-short4: 200ms
  /* Medium durations (250-400ms) */ --md-sys-motion-duration-medium1: 250ms
  --md-sys-motion-duration-medium2: 300ms
  --md-sys-motion-duration-medium3: 350ms
  --md-sys-motion-duration-medium4: 400ms /* Long durations (450-600ms) */
  --md-sys-motion-duration-long1: 450ms --md-sys-motion-duration-long2: 500ms
  --md-sys-motion-duration-long3: 550ms --md-sys-motion-duration-long4: 600ms;
```

### Easing Curves

**Emphasized** (Most expressive):

```css
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1)
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1)
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
```

**Standard** (Balanced):

```css
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1)
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1)
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
```

### Usage Example

```css
.my-component {
  transition-duration: var(--md-sys-motion-duration-medium2);
  transition-timing-function: var(--md-sys-motion-easing-emphasized);
}
```

---

## Usage Examples

### Example 1: Training Card with M3

```html
<article class="md-card-elevated md-state-layer p-5">
  <h3 class="md-typescale-title-large mb-2">Parkour Training</h3>
  <p class="md-typescale-body-medium mb-4">Freiham Halle C</p>

  <div class="flex gap-2">
    <a href="#" class="md-btn-filled flex-1"> Anmelden </a>
    <button class="md-btn-outlined">
      <svg><!-- Map icon --></svg>
    </button>
  </div>
</article>
```

### Example 2: Modal with M3 Elevation

```html
<div class="fixed inset-0 bg-black/80 flex items-center justify-center">
  <div
    class="bg-white rounded-2xl p-6"
    style="box-shadow: var(--md-sys-elevation-5);"
  >
    <h2 class="md-typescale-headline-medium mb-4">Modal Title</h2>
    <p class="md-typescale-body-medium mb-6">Modal content...</p>

    <div class="flex gap-2 justify-end">
      <button class="md-btn-text">Cancel</button>
      <button class="md-btn-filled">Confirm</button>
    </div>
  </div>
</div>
```

### Example 3: Custom Component with M3 Tokens

```css
.my-custom-card {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  box-shadow: var(--md-sys-elevation-1);
  transition-duration: var(--md-sys-motion-duration-medium2);
  transition-timing-function: var(--md-sys-motion-easing-emphasized);
}

.my-custom-card:hover {
  box-shadow: var(--md-sys-elevation-2);
  border-color: var(--md-sys-color-outline);
}
```

---

## Migration Guide

### Migrating Existing Components

**Before (Custom styles)**:

```html
<button class="px-4 py-2 bg-primary-500 text-white rounded-lg">Action</button>
```

**After (M3)**:

```html
<button class="md-btn-filled">Action</button>
```

### Progressive Enhancement

You can gradually migrate components:

1. **Keep existing components** - They continue to work
2. **Apply M3 to new components** - Use M3 classes for new features
3. **Migrate high-impact areas** - Update key components like cards, buttons
4. **Test thoroughly** - Verify visual consistency

---

## Best Practices

### 1. Elevation Hierarchy

Use elevation to create visual hierarchy:

- **Level 0**: Background, non-interactive surfaces
- **Level 1**: Resting cards, filled buttons
- **Level 2**: Hovered cards
- **Level 3**: FABs, navigation bars, snackbars
- **Level 4**: Hovered FABs
- **Level 5**: Modals, dialogs

### 2. Button Usage

- **Filled**: Primary action (1 per screen section)
- **Filled Tonal**: Alternative primary when filled is too strong
- **Outlined**: Secondary actions
- **Text**: Tertiary actions, low-emphasis

### 3. State Layers

Add to **all interactive elements**:

```html
<button class="md-state-layer md-btn-filled">Button</button>
<a class="md-state-layer" href="#">Link</a>
<div class="md-state-layer cursor-pointer">Interactive Card</div>
```

### 4. Typography Consistency

Use type ramp consistently:

- **Display**: Page titles only
- **Headline**: Section headings
- **Title**: Subsection headings, card titles
- **Body**: Paragraph text
- **Label**: Button text, small UI elements

---

## Browser Support

M3 implementation uses modern CSS features:

- ✅ **Chrome/Edge**: 90+
- ✅ **Firefox**: 88+
- ✅ **Safari**: 14.1+
- ✅ **Mobile Browsers**: iOS 14.5+, Android 90+

**Fallbacks**: All custom properties have fallback values for older browsers.

---

## Resources

- [Material Design 3 Guidelines](https://m3.material.io)
- [M3 Color System](https://m3.material.io/styles/color/system/overview)
- [M3 Elevation](https://m3.material.io/styles/elevation/overview)
- [M3 Typography](https://m3.material.io/styles/typography/overview)
- [M3 Motion](https://m3.material.io/styles/motion/overview)

---

## License

MIT License - Free to use and modify.

---

**Questions?** Open an issue or refer to the
[M3 spec documentation](https://m3.material.io).
