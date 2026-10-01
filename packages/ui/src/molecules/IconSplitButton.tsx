import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { splitButtonFrameVariants, type SplitButtonSize, type SplitButtonVariant } from "../lib/split-button-frame";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";
import { MenuTrigger } from "./Menu";

export interface IconSplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick" | "aria-label"> {
  /** Neutral look of both segments — separate pills (`primary`) or one connected outline (`secondary`). @default "primary" */
  variant?: SplitButtonVariant;
  /** Control-ladder rung; both segments are the same square box. @default "md" */
  size?: SplitButtonSize;
  /** The main segment's icon, e.g. `<Icon icon={Plus} />`. */
  icon: React.ReactNode;
  /** Required accessible name (and tooltip) of the icon-only main segment. */
  "aria-label": string;
  /** Click handler of the main action segment. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Spinner on the main segment; both segments go non-interactive (the main one stays focusable). */
  loading?: boolean;
  /** Disables both segments. */
  disabled?: boolean;
  /** The main segment's form behavior. @default "button" */
  type?: "submit" | "reset" | "button";
  /** Accessible name (and tooltip) of the menu segment. @default "More options" */
  menuLabel?: string;
}

/**
 * The icon-only `SplitButton`: two square `IconButton`s in the shared split frame — a main action
 * plus a chevron that is the surrounding `Menu`'s trigger. Use it only where a glyph alone names
 * the action unambiguously (a toolbar `+`); otherwise keep the label and use `SplitButton`. Like
 * it, it ships no menu — nest it in a `Menu` with a sibling `MenuContent`.
 */
export const IconSplitButton = React.forwardRef<HTMLDivElement, IconSplitButtonProps>(
  (
    { variant = "primary", size = "md", icon, "aria-label": ariaLabel, onClick, loading = false, disabled, type = "button", menuLabel = "More options", className, ...props },
    ref
  ) => (
    <div ref={ref} className={cn(splitButtonFrameVariants({ variant }), className)} {...props}>
      <IconButton variant={variant} size={size} icon={icon} aria-label={ariaLabel} onClick={onClick} loading={loading} disabled={disabled} type={type} />
      <MenuTrigger
        disabled={disabled || loading}
        render={<IconButton variant={variant} size={size} aria-label={menuLabel} icon={<Icon icon={ChevronDown} />} />}
      />
    </div>
  )
);
IconSplitButton.displayName = "IconSplitButton";

/* __DOC_BLOCK
<div className="flex flex-wrap items-center gap-3 p-4">
  <QUI.Menu>
    <QUI.IconSplitButton aria-label="Create" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.MenuContent align="end">
      <QUI.MenuItem>Create from template</QUI.MenuItem>
      <QUI.MenuItem>Import</QUI.MenuItem>
    </QUI.MenuContent>
  </QUI.Menu>
  <QUI.Menu>
    <QUI.IconSplitButton variant="secondary" aria-label="Filter" icon={<QUI.Icon icon={Icons.Filter} />} />
    <QUI.MenuContent align="end">
      <QUI.MenuItem>Saved filters</QUI.MenuItem>
    </QUI.MenuContent>
  </QUI.Menu>
  <QUI.Menu>
    <QUI.IconSplitButton size="sm" aria-label="Create" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.MenuContent>
      <QUI.MenuItem>Option</QUI.MenuItem>
    </QUI.MenuContent>
  </QUI.Menu>
  <QUI.Menu>
    <QUI.IconSplitButton size="lg" variant="secondary" aria-label="Create" icon={<QUI.Icon icon={Icons.Plus} />} disabled />
    <QUI.MenuContent>
      <QUI.MenuItem>Option</QUI.MenuItem>
    </QUI.MenuContent>
  </QUI.Menu>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary"], "size": ["sm", "md", "lg"], "loading": "boolean", "disabled": "boolean" }
PROPS__ */
