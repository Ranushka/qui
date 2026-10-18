/**
 * Frosted glass for floating layers (menus, popovers, dialogs, toasts, tooltips) under the glass look
 * (`data-look="glass"`). Their surfaces turn translucent there, so they blur what is behind them to stay
 * readable. Does nothing in the standard look.
 */
export const glassOverlay = "glass:bg-glass-overlay glass:backdrop-blur-xl glass:backdrop-saturate-150";

/** Frosted glass for large panels set on the canvas (`Box background="glass"`). */
export const glassPanel = "glass:backdrop-blur-2xl glass:backdrop-saturate-150";
