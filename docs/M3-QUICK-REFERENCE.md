# M3 Quick Reference Guide

Quick lookup for Material Design 3 components and tokens.

## 🌙 Dark Mode

```javascript
// Toggle dark mode
document.documentElement.setAttribute('data-theme', 'dark') // Enable
document.documentElement.setAttribute('data-theme', 'light') // Disable
```

```html
<!-- M3 Switch Toggle -->
<label class="md-switch">
  <input
    type="checkbox"
    x-model="$store.ui.darkMode"
    @change="document.documentElement.setAttribute('data-theme', $store.ui.darkMode ? 'dark' : 'light')"
  />
  <span class="md-switch-track"></span>
  <span class="md-switch-thumb"></span>
</label>
```

## 🎨 Color Tokens

```css
/* Surfaces */
var(--md-sys-color-surface)
var(--md-sys-color-surface-container-lowest)
var(--md-sys-color-surface-container-low)
var(--md-sys-color-surface-container)
var(--md-sys-color-surface-container-high)
var(--md-sys-color-surface-container-highest)

/* Text */
var(--md-sys-color-on-surface)
var(--md-sys-color-on-surface-variant)

/* Borders */
var(--md-sys-color-outline)
var(--md-sys-color-outline-variant)

/* Primary Container */
var(--md-sys-color-primary-container)
var(--md-sys-color-on-primary-container)
```

## 📦 Elevation

```css
box-shadow: var(--md-sys-elevation-0); /* None */
box-shadow: var(--md-sys-elevation-1); /* Cards (resting) */
box-shadow: var(--md-sys-elevation-2); /* Cards (hover) */
box-shadow: var(--md-sys-elevation-3); /* FAB, Snackbar */
box-shadow: var(--md-sys-elevation-4); /* FAB (hover) */
box-shadow: var(--md-sys-elevation-5); /* Modals */
```

## 🔤 Typography

```html
<!-- Display -->
<h1 class="md-typescale-display-large">57px</h1>
<h2 class="md-typescale-display-medium">45px</h2>
<h3 class="md-typescale-display-small">36px</h3>

<!-- Headline -->
<h2 class="md-typescale-headline-large">32px</h2>
<h3 class="md-typescale-headline-medium">28px</h3>
<h4 class="md-typescale-headline-small">24px</h4>

<!-- Title -->
<h3 class="md-typescale-title-large">22px</h3>
<h4 class="md-typescale-title-medium">16px</h4>
<h5 class="md-typescale-title-small">14px</h5>

<!-- Body -->
<p class="md-typescale-body-large">16px</p>
<p class="md-typescale-body-medium">14px</p>
<p class="md-typescale-body-small">12px</p>

<!-- Label -->
<span class="md-typescale-label-large">14px</span>
<span class="md-typescale-label-medium">12px</span>
<span class="md-typescale-label-small">11px</span>
```

## 🔘 Buttons

```html
<!-- Filled (Primary) -->
<button class="md-btn-filled">Primary</button>

<!-- Outlined (Secondary) -->
<button class="md-btn-outlined">Secondary</button>

<!-- Text (Tertiary) -->
<button class="md-btn-text">Tertiary</button>

<!-- Filled Tonal (Alternative Primary) -->
<button class="md-btn-filled-tonal">Alternative</button>
```

## 🃏 Cards

```html
<!-- Elevated -->
<article class="md-card-elevated">...</article>

<!-- Filled -->
<article class="md-card-filled">...</article>

<!-- Outlined -->
<article class="md-card-outlined">...</article>
```

## ✨ State Layers

```html
<button class="md-state-layer md-btn-filled">With State Layer</button>
```

## 🎯 FAB

```html
<!-- Standard -->
<button class="md-fab">
  <svg><!-- icon --></svg>
  <span>Action</span>
</button>

<!-- Small -->
<button class="md-fab md-fab-small">
  <svg><!-- icon --></svg>
</button>

<!-- Large -->
<button class="md-fab md-fab-large">
  <svg><!-- icon --></svg>
  <span>Large</span>
</button>
```

## 📢 Snackbar

```html
<div class="md-snackbar md-snackbar-visible">
  <span>Message</span>
  <button class="md-snackbar-action">Action</button>
</div>
```

## ⏱️ Motion

```css
/* Duration */
transition-duration: var(--md-sys-motion-duration-short1); /* 50ms */
transition-duration: var(--md-sys-motion-duration-short4); /* 200ms */
transition-duration: var(--md-sys-motion-duration-medium1); /* 250ms */
transition-duration: var(--md-sys-motion-duration-medium4); /* 400ms */
transition-duration: var(--md-sys-motion-duration-long4); /* 600ms */

/* Easing */
transition-timing-function: var(--md-sys-motion-easing-emphasized);
transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);
transition-timing-function: var(--md-sys-motion-easing-emphasized-accelerate);
transition-timing-function: var(--md-sys-motion-easing-standard);
```

## 📋 Common Patterns

### Interactive Card

```html
<article class="md-card-elevated md-state-layer p-5">
  <h3 class="md-typescale-title-large">Title</h3>
  <p class="md-typescale-body-medium">Content</p>
  <button class="md-btn-filled">Action</button>
</article>
```

### Modal Dialog

```html
<div class="rounded-2xl p-6" style="box-shadow: var(--md-sys-elevation-5);">
  <h2 class="md-typescale-headline-medium mb-4">Title</h2>
  <p class="md-typescale-body-medium mb-6">Content</p>
  <div class="flex gap-2 justify-end">
    <button class="md-btn-text">Cancel</button>
    <button class="md-btn-filled">Confirm</button>
  </div>
</div>
```

### Form Actions

```html
<div class="flex gap-3">
  <button type="button" class="md-btn-outlined">Cancel</button>
  <button type="submit" class="md-btn-filled">Submit</button>
</div>
```

## 🎯 Decision Tree

### Which Button?

- **Primary action** → `md-btn-filled`
- **Primary but softer** → `md-btn-filled-tonal`
- **Secondary action** → `md-btn-outlined`
- **Tertiary/dismiss** → `md-btn-text`

### Which Card?

- **Need elevation** → `md-card-elevated`
- **Flat with fill** → `md-card-filled`
- **Flat with border** → `md-card-outlined`

### Which Typography?

- **Page title** → `md-typescale-display-*`
- **Section heading** → `md-typescale-headline-*`
- **Subsection/card** → `md-typescale-title-*`
- **Paragraph text** → `md-typescale-body-*`
- **Button/label** → `md-typescale-label-*`

---

**Tip**: Always add `md-state-layer` to interactive elements!
