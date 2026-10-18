import * as React from "react";
import { Toast as BaseToast, type ToastManagerAddOptions } from "@base-ui/react/toast";
import { CircleCheck, CircleX, Info, TriangleAlert, CircleAlert, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Button, type ButtonProps } from "../atoms/Button";

/** Semantic intent — picks the status glyph + its tint. Required on every toast's `data`. */
export type ToastVariant = "success" | "danger" | "info" | "warning" | "neutral";

/** Custom payload every toast queued through `useToastManager` carries in `data`. */
export interface ToastData {
  variant: ToastVariant;
}

const STATUS_ICON: Record<ToastVariant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  success: CircleCheck,
  danger: CircleX,
  info: Info,
  warning: TriangleAlert,
  neutral: CircleAlert,
};

/** The fixed stack anchor, bottom-inline-end of the viewport. Height tracks the frontmost card so the stack doesn't reserve dead space behind it. */
const toastViewportClass = cn(
  "fixed inset-e-4 bottom-4 z-50 w-85 max-w-[calc(100vw-2rem)]",
  "h-(--toast-frontmost-height,0px)",
  "focus-visible:outline-md focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
);

/**
 * One card in the stack. Absolutely positioned within the viewport and driven by Base UI's
 * `--toast-index` / `--toast-offset-y` / `--toast-swipe-movement-*` custom properties: cards behind
 * the front one shrink and peek out above it until the stack is hovered/focused (`data-expanded`),
 * when they fan out to full height and offset.
 */
const toastCardClass = cn(
  "rounded-lg border-sm border-subtle bg-layer-2 shadow-raised-300",
  "flex items-start gap-1.5 px-3 py-3",
  "absolute inset-e-0 bottom-0 w-full origin-bottom select-none outline-none",
  "[--gap:0.5rem] [--peek:0.5rem] [--scale:calc(max(0,1-(var(--toast-index,0)*0.1)))]",
  "h-(--toast-frontmost-height,var(--toast-height,auto)) data-expanded:h-(--toast-height,auto)",
  "[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)-(var(--toast-index,0)*var(--peek))-((1-var(--scale))*var(--toast-height,0px))))_scale(var(--scale))]",
  "data-expanded:[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-offset-y,0px)*-1+(var(--toast-index,0)*var(--gap)*-1)+var(--toast-swipe-movement-y,0px)))]",
  "data-starting-style:[transform:translateY(150%)] data-ending-style:opacity-0 data-limited:opacity-0",
  "transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
);

const toastIconVariants = cva("mt-0.5 size-4 shrink-0 [--node-size:var(--control-glyph-lg)]", {
  variants: {
    variant: {
      success: "text-icon-success-primary",
      danger: "text-icon-danger-primary",
      info: "text-icon-info-primary",
      warning: "text-icon-warning-primary",
      neutral: "text-icon-tertiary",
    },
  },
});

export interface ToastProviderProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseToast.Provider>> {}

/**
 * Mounts the toast stack. Wrap the app (or a subtree) once near the root, then queue toasts from
 * any descendant with `useToastManager().add({ title, description, data: { variant } })`. Composes
 * Base UI's `Toast.Provider` + `Toast.Portal` + `Toast.Viewport` and renders one styled card per
 * queued toast.
 */
export function ToastProvider({ children, ...props }: ToastProviderProps) {
  return (
    <BaseToast.Provider {...props}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className={toastViewportClass}>
          <ToastStack />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

/** Renders one styled card per toast in the manager's queue. Mounted inside `ToastProvider` — not used directly. */
function ToastStack() {
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return (
    <>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </>
  );
}

function ToastCard({ toast }: { toast: React.ComponentProps<typeof BaseToast.Root>["toast"] & { data?: ToastData } }) {
  const variant: ToastVariant = toast.data?.variant ?? "neutral";
  return (
    <BaseToast.Root toast={toast} className={toastCardClass}>
      <span className={cn("flex", toastIconVariants({ variant }))}>
        <Icon icon={STATUS_ICON[variant]} />
      </span>
      <BaseToast.Content className="flex min-w-0 flex-1 flex-col gap-1 pe-4">
        <BaseToast.Title className="text-body-sm-medium text-primary" />
        <BaseToast.Description className="text-body-xs-regular text-tertiary" />
      </BaseToast.Content>
      <BaseToast.Close render={<IconButton variant="ghost" size="xs" aria-label="Dismiss" icon={<Icon icon={X} />} showTooltip={false} />} className="absolute inset-e-1 top-1" />
    </BaseToast.Root>
  );
}

/**
 * Re-exported for convenience: queue toasts from any component under `ToastProvider` with
 * `useToastManager().add({ title, description, data: { variant: "success" } })`. `data.variant` is
 * required — it's what selects the card's status icon and tint.
 */
export const useToastManager = BaseToast.useToastManager;
export type { ToastManagerAddOptions };

export interface ToastLauncherProps extends NoClass<Omit<ButtonProps, "label" | "onClick">> {
  /** Button label. @default "Show toast" */
  label?: string;
  /** The toast queued on click. @default a "Changes saved" success toast. */
  toast?: ToastManagerAddOptions<ToastData>;
}

/**
 * A `Button` that queues one toast via `useToastManager` on click — needs a `ToastProvider`
 * ancestor. Mainly a self-contained demo trigger; real call sites usually call
 * `useToastManager().add(...)` directly from an existing event handler instead of via a
 * dedicated button.
 */
export function ToastLauncher({ label = "Show toast", toast, ...props }: ToastLauncherProps) {
  const manager = useToastManager<ToastData>();
  return (
    <Button
      label={label}
      variant="secondary"
      onClick={() =>
        manager.add(toast ?? { title: "Changes saved", description: "Your changes have been saved.", data: { variant: "success" } })
      }
      {...props}
    />
  );
}

/* __DOC_BLOCK
<QUI.ToastProvider>
  <QUI.ToastLauncher />
</QUI.ToastProvider>
DOC__ */

/* __PROPS
{ "timeout": ["number"], "limit": ["number"] }
PROPS__ */
