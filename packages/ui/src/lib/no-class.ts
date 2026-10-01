/**
 * Strips the styling escape hatches from a component's public props. qui's rule: apps style only
 * through typed, token-backed props — never `className`/`style`, and never a `render` swap that
 * could carry its own classes. Every public `*Props` type goes through this.
 */
export type NoClass<T> = T extends unknown ? Omit<T, "className" | "style" | "render"> : never;
// ↑ distributive, so union props (e.g. Calendar's single/multiple/range modes) keep their discriminants.

/**
 * For behavior-only parts (menu/popover/dialog triggers and closes) that render no styling of
 * their own: no `className`/`style`, but `render` stays so the behavior can be attached to a qui
 * control, e.g. `<MenuTrigger render={<Button label="Options" />} />`.
 */
export type NoStyle<T> = T extends unknown ? Omit<T, "className" | "style"> : never;
