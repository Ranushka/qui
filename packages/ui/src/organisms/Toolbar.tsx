import * as React from "react";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { controlChromeVariants } from "../lib/control-chrome";
import { fieldControlSurfaceVariants } from "../lib/field-control-surface";
import { Icon } from "../atoms/Icon";
import { Tooltip } from "../atoms/Tooltip";

type ToolbarSize = "sm" | "md";
type ToolbarElevation = "flat" | "raised";
type ToolbarItemVariant = NonNullable<VariantProps<typeof controlChromeVariants>["variant"]>;

/** Shares the toolbar's `size` with every control inside, so items pack to match without repeating it. */
const ToolbarSizeContext = React.createContext<ToolbarSize>("sm");

const toolbarVariants = cva("flex w-fit items-center gap-2 p-1.5 text-secondary", {
  variants: {
    /** `raised` draws its own floating surface; `flat` sits flush in whatever contains it. */
    elevation: {
      flat: "",
      raised: "rounded-lg border-sm border-subtle bg-layer-2 shadow-overlay-100",
    },
  },
  defaultVariants: { elevation: "flat" },
});

/**
 * Toolbar-item geometry on the control ladder: a square box when icon-only, label padding when
 * `labeled`. Composed with `controlChromeVariants` so items share Button/IconButton's fill, focus
 * ring and disabled affordance, plus a pressed look for toggles.
 */
const toolbarItemGeometryVariants = cva(
  "data-pressed:bg-layer-transparent-selected data-pressed:text-icon-accent-primary aria-disabled:data-pressed:bg-transparent aria-disabled:data-pressed:text-disabled",
  {
    variants: {
      size: {
        sm: "h-(--control-height-sm) rounded-(--control-radius-sm) [--node-size:var(--control-glyph-sm)]",
        md: "h-(--control-height-md) rounded-(--control-radius-md) [--node-size:var(--control-glyph-md)]",
      },
      labeled: { true: "whitespace-nowrap", false: "" },
    },
    compoundVariants: [
      { labeled: false, size: "sm", className: "w-(--control-height-sm)" },
      { labeled: false, size: "md", className: "w-(--control-height-md)" },
      { labeled: true, size: "sm", className: "gap-(--control-gap-sm) px-(--control-padding-x-sm)" },
      { labeled: true, size: "md", className: "gap-(--control-gap-md) px-(--control-padding-x-md)" },
    ],
    defaultVariants: { size: "sm", labeled: false },
  }
);

/** Menu-trigger geometry: always labeled, with a trailing chevron, lit while its menu is open. */
const toolbarMenuTriggerGeometryVariants = cva("justify-between whitespace-nowrap data-popup-open:bg-layer-transparent-selected", {
  variants: {
    size: {
      sm: "h-(--control-height-sm) min-w-10 gap-(--control-gap-sm) rounded-(--control-radius-sm) px-(--control-padding-x-sm) [--node-size:var(--control-glyph-sm)]",
      md: "h-(--control-height-md) min-w-12 gap-(--control-gap-md) rounded-(--control-radius-md) px-(--control-padding-x-md) [--node-size:var(--control-glyph-md)]",
    },
  },
  defaultVariants: { size: "sm" },
});

const toolbarInputVariants = cva(
  cn(
    fieldControlSurfaceVariants({ focus: "self" }),
    "min-w-0 text-body-xs-regular text-primary outline-none placeholder:text-placeholder",
    "disabled:cursor-not-allowed disabled:text-disabled disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:text-disabled data-disabled:opacity-60"
  ),
  {
    variants: {
      size: {
        sm: "h-(--control-height-sm) rounded-(--control-radius-sm) px-(--control-padding-x-sm)",
        md: "h-(--control-height-md) rounded-(--control-radius-md) px-(--control-padding-x-md)",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

function toolbarItemClass(variant: ToolbarItemVariant, size: ToolbarSize, labeled: boolean, className?: string) {
  return cn(controlChromeVariants({ variant }), toolbarItemGeometryVariants({ size, labeled }), className);
}

/** Icon + optional label body shared by every labeled-or-icon toolbar item. */
function itemContent(icon: React.ReactNode, label: string | undefined) {
  return (
    <>
      {icon}
      {label ? <span className="truncate text-body-xs-medium">{label}</span> : null}
    </>
  );
}

/**
 * Every item is either labeled or icon-only, and needs an accessible name either way: a labeled
 * item is named by its visible `label`; an icon-only one must pass `icon` and `aria-label`.
 */
type ToolbarItemContent =
  | {
      /** Visible text after the icon; widens the square icon box to fit. */
      label: string;
      /** Icon element, e.g. `<Icon icon={MessageSquare} />`. */
      icon?: React.ReactNode;
      /** Accessible name; defaults to the visible `label`. */
      "aria-label"?: string;
    }
  | {
      label?: undefined;
      /** Icon element filling the square item box. */
      icon: React.ReactNode;
      /** Required accessible name for an icon-only item — also its tooltip. */
      "aria-label": string;
    };

interface ToolbarItemStyleProps {
  /** Size override; defaults to the enclosing `Toolbar`'s `size`. */
  size?: ToolbarSize;
  /** Control chrome, shared with `Button`/`IconButton`. @default "ghost" */
  variant?: ToolbarItemVariant;
  /** Shows the `aria-label` as a tooltip on icon-only items. @default true */
  showTooltip?: boolean;
}

/** Wraps an icon-only item in a `Tooltip` showing its `aria-label`; passes labeled items through. */
function withTooltip(element: React.ReactElement, label: string | undefined, ariaLabel: string | undefined, showTooltip: boolean) {
  if (label || !showTooltip || !ariaLabel) return element;
  return <Tooltip label={ariaLabel}>{element}</Tooltip>;
}

export interface ToolbarProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Root>, "className" | "orientation" | "render">> {
  /** Control scale shared with every item inside: `sm` (24px) or `md` (28px). @default "sm" */
  size?: ToolbarSize;
  /** Draws its own raised surface, or sits flush. @default "flat" */
  elevation?: ToolbarElevation;
}

/**
 * A horizontal row of controls on Base UI's `Toolbar.Root`: `role="toolbar"` with a single tab
 * stop and arrow-key roving focus across its buttons, links, toggles and inputs (`loopFocus`
 * wraps at the ends; `disabled` disables everything). `size` is shared with the items via context.
 */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(({ size = "sm", elevation = "flat", ...props }, ref) => (
  <ToolbarSizeContext.Provider value={size}>
    <BaseToolbar.Root ref={ref} className={cn(toolbarVariants({ elevation }))} {...props} />
  </ToolbarSizeContext.Provider>
));
Toolbar.displayName = "Toolbar";

export interface ToolbarGroupProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Group>, "className" | "render">> {
}

/**
 * A `role="group"` cluster of related items; `disabled` disables the cluster. It keeps the row's
 * own gap, so grouping reads visually from `ToolbarSeparator`s placed either side.
 */
export const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(({ ...props }, ref) => (
  <BaseToolbar.Group ref={ref} className={cn("flex items-center gap-2")} {...props} />
));
ToolbarGroup.displayName = "ToolbarGroup";

export interface ToolbarSeparatorProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Separator>, "className" | "render" | "orientation">> {
}

/** A short vertical rule dividing one cluster of items from the next. */
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(({ ...props }, ref) => (
  <BaseToolbar.Separator ref={ref} orientation="vertical" className={cn("h-3.5 w-0 shrink-0 border-s-sm border-subtle")} {...props} />
));
ToolbarSeparator.displayName = "ToolbarSeparator";

export type ToolbarButtonProps = NoClass<
Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Button>, "children" | "className" | "render" | "aria-label"> &
  ToolbarItemStyleProps &
  ToolbarItemContent
>;

/**
 * An action button in the toolbar's roving tab order, on the same control chrome as
 * `Button`/`IconButton` (ghost by default). Disabled buttons stay focusable so keyboard users can
 * still discover them.
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ size, variant = "ghost", showTooltip = true, icon, label, "aria-label": ariaLabel, ...props }, ref) => {
    const toolbarSize = React.useContext(ToolbarSizeContext);
    const button = (
      <BaseToolbar.Button ref={ref} aria-label={ariaLabel} className={toolbarItemClass(variant, size ?? toolbarSize, !!label)} {...props}>
        {itemContent(icon, label)}
      </BaseToolbar.Button>
    );
    return withTooltip(button, label, ariaLabel, showTooltip);
  }
);
ToolbarButton.displayName = "ToolbarButton";

export type ToolbarToggleProps = NoClass<
Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Button>, "children" | "className" | "render" | "aria-label"> &
  Pick<React.ComponentPropsWithoutRef<typeof BaseToggle>, "pressed" | "defaultPressed" | "onPressedChange" | "value"> &
  ToolbarItemStyleProps &
  ToolbarItemContent
>;

/**
 * A two-state toolbar button (bold, italic, a view switch) — Base UI's `Toggle` pressed state on a
 * `ToolbarButton`. Use it standalone, or inside a `ToolbarToggleGroup` with a `value`.
 */
export const ToolbarToggle = React.forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  (
    { size, variant = "ghost", showTooltip = true, icon, label, pressed, defaultPressed, onPressedChange, value, disabled, "aria-label": ariaLabel, ...props },
    ref
  ) => {
    const toolbarSize = React.useContext(ToolbarSizeContext);
    const button = (
      <BaseToolbar.Button
        ref={ref}
        disabled={disabled}
        aria-label={ariaLabel}
        className={toolbarItemClass(variant, size ?? toolbarSize, !!label)}
        render={<BaseToggle pressed={pressed} defaultPressed={defaultPressed} onPressedChange={onPressedChange} value={value} disabled={disabled} />}
        {...props}
      >
        {itemContent(icon, label)}
      </BaseToolbar.Button>
    );
    return withTooltip(button, label, ariaLabel, showTooltip);
  }
);
ToolbarToggle.displayName = "ToolbarToggle";

export interface ToolbarToggleGroupProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToggleGroup>, "className" | "render">> {
  /** Required accessible name for the set, e.g. "Text alignment". */
  "aria-label": string;
}

/**
 * A set of `ToolbarToggle`s sharing one selection (`multiple` for several), on Base UI's
 * `ToggleGroup` — which joins the toolbar's roving focus instead of running its own. Drive it
 * with `value`/`defaultValue` + `onValueChange`.
 */
export const ToolbarToggleGroup = React.forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(({ ...props }, ref) => (
  <BaseToggleGroup ref={ref} className={cn("flex items-center gap-2")} {...props} />
));
ToolbarToggleGroup.displayName = "ToolbarToggleGroup";

export type ToolbarLinkProps = NoClass<
Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Link>, "children" | "className" | "render" | "aria-label"> &
  ToolbarItemStyleProps &
  ToolbarItemContent
>;

/** A toolbar item that navigates: an `<a>` in the roving tab order, with the same chrome as `ToolbarButton`. */
export const ToolbarLink = React.forwardRef<HTMLAnchorElement, ToolbarLinkProps>(
  ({ size, variant = "ghost", showTooltip = true, icon, label, "aria-label": ariaLabel, ...props }, ref) => {
    const toolbarSize = React.useContext(ToolbarSizeContext);
    const link = (
      <BaseToolbar.Link ref={ref} aria-label={ariaLabel} className={toolbarItemClass(variant, size ?? toolbarSize, !!label)} {...props}>
        {itemContent(icon, label)}
      </BaseToolbar.Link>
    );
    return withTooltip(link, label, ariaLabel, showTooltip);
  }
);
ToolbarLink.displayName = "ToolbarLink";

export interface ToolbarInputProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Input>, "className" | "render" | "size">> {
  /** Size override; defaults to the enclosing `Toolbar`'s `size`. */
  size?: ToolbarSize;
  /** Required accessible name — a toolbar input has no visible label. */
  "aria-label": string;
}

/**
 * An inline text field (e.g. a filter box) in the toolbar's roving tab order, on the shared
 * bordered field surface. Left/Right arrows move the caret while it has text to cross, then move
 * focus to the neighboring item.
 */
export const ToolbarInput = React.forwardRef<HTMLInputElement, ToolbarInputProps>(({ size, ...props }, ref) => {
  const toolbarSize = React.useContext(ToolbarSizeContext);
  return <BaseToolbar.Input ref={ref} className={cn(toolbarInputVariants({ size: size ?? toolbarSize }))} {...props} />;
});
ToolbarInput.displayName = "ToolbarInput";

export interface ToolbarMenuTriggerProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseToolbar.Button>, "children" | "className" | "render">> {
  /** Visible trigger text, e.g. the current choice ("Paragraph"). */
  label: string;
  /** Size override; defaults to the enclosing `Toolbar`'s `size`. */
  size?: ToolbarSize;
  /** Control chrome, shared with `Button`. @default "ghost" */
  variant?: ToolbarItemVariant;
}

/**
 * Opens a qui `Menu` from inside the toolbar: a roving-focus toolbar button carrying Base UI's
 * `Menu.Trigger` behavior, showing a label and a chevron that flips while open. Place it inside
 * `<Menu>` alongside the menu's `MenuContent`.
 */
export const ToolbarMenuTrigger = React.forwardRef<HTMLButtonElement, ToolbarMenuTriggerProps>(
  ({ label, size, variant = "ghost", ...props }, ref) => {
    const toolbarSize = React.useContext(ToolbarSizeContext);
    return (
      <BaseToolbar.Button
        ref={ref}
        className={cn(controlChromeVariants({ variant }), toolbarMenuTriggerGeometryVariants({ size: size ?? toolbarSize }))}
        render={<BaseMenu.Trigger />}
        {...props}
      >
        <span className="truncate text-body-xs-medium">{label}</span>
        <span className="flex transition-transform duration-200 group-data-popup-open:rotate-180">
          <Icon icon={ChevronDown} tint="secondary" />
        </span>
      </BaseToolbar.Button>
    );
  }
);
ToolbarMenuTrigger.displayName = "ToolbarMenuTrigger";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-6 p-4">
  <QUI.Toolbar aria-label="Formatting" elevation="raised">
    <QUI.Menu>
      <QUI.ToolbarMenuTrigger label="Paragraph" />
      <QUI.MenuContent>
        <QUI.MenuItem>Paragraph</QUI.MenuItem>
        <QUI.MenuItem>Heading 1</QUI.MenuItem>
        <QUI.MenuItem>Heading 2</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
    <QUI.ToolbarSeparator />
    <QUI.ToolbarGroup aria-label="Text style">
      <QUI.ToolbarToggle aria-label="Bold" icon={<QUI.Icon icon={Icons.Bold} />} defaultPressed />
      <QUI.ToolbarToggle aria-label="Italic" icon={<QUI.Icon icon={Icons.Italic} />} />
      <QUI.ToolbarToggle aria-label="Underline" icon={<QUI.Icon icon={Icons.Underline} />} />
    </QUI.ToolbarGroup>
    <QUI.ToolbarSeparator />
    <QUI.ToolbarToggleGroup aria-label="Alignment" defaultValue={["left"]}>
      <QUI.ToolbarToggle value="left" aria-label="Align left" icon={<QUI.Icon icon={Icons.AlignLeft} />} />
      <QUI.ToolbarToggle value="center" aria-label="Align center" icon={<QUI.Icon icon={Icons.AlignCenter} />} />
      <QUI.ToolbarToggle value="right" aria-label="Align right" icon={<QUI.Icon icon={Icons.AlignRight} />} />
    </QUI.ToolbarToggleGroup>
    <QUI.ToolbarSeparator />
    <QUI.ToolbarButton label="Comment" icon={<QUI.Icon icon={Icons.MessageSquare} />} />
    <QUI.ToolbarButton aria-label="Delete" icon={<QUI.Icon icon={Icons.Trash2} />} disabled />
  </QUI.Toolbar>
  <QUI.Toolbar aria-label="Issue filters" size="md">
    <QUI.ToolbarInput aria-label="Filter issues" placeholder="Filter issues…" />
    <QUI.ToolbarSeparator />
    <QUI.ToolbarButton variant="secondary" label="Display" icon={<QUI.Icon icon={Icons.SlidersHorizontal} />} />
    <QUI.ToolbarLink href="#" label="Docs" icon={<QUI.Icon icon={Icons.ExternalLink} />} />
    <QUI.ToolbarButton variant="primary" label="New issue" icon={<QUI.Icon icon={Icons.Plus} />} />
  </QUI.Toolbar>
</div>
DOC__ */

/* __PROPS
{ "Toolbar.size": ["sm", "md"], "Toolbar.elevation": ["flat", "raised"], "Toolbar.loopFocus": "boolean", "Toolbar.disabled": "boolean", "ToolbarButton.variant": ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline"], "ToolbarButton.showTooltip": "boolean", "ToolbarButton.disabled": "boolean", "ToolbarToggle.pressed": "boolean", "ToolbarToggleGroup.multiple": "boolean" }
PROPS__ */
