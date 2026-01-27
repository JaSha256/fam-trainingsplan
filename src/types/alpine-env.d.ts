/**
 * Alpine.js Plugin Module Declarations
 *
 * Alpine.js plugins don't ship type declarations.
 * These minimal declarations suppress import errors only.
 *
 * NOTE: We intentionally do NOT fully type Alpine's API because:
 * - Alpine.store() method `this` context is dynamically bound at runtime
 * - Alpine.$persist() is a plugin extension not in core types
 * - Full typing would break all store method `this.xxx` accesses
 * The @ts-ignore comments on `this.xxx` inside store methods are expected.
 */

declare module 'alpinejs' {
  const Alpine: any
  export default Alpine
}

declare module '@alpinejs/collapse' {
  const plugin: any
  export default plugin
}

declare module '@alpinejs/focus' {
  const plugin: any
  export default plugin
}

declare module '@alpinejs/intersect' {
  const plugin: any
  export default plugin
}

declare module '@alpinejs/persist' {
  const plugin: any
  export default plugin
}
