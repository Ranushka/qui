import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { splitButtonFrameVariants, type SplitButtonSize, type SplitButtonVariant } from "../lib/split-button-frame";
import { Button } from "../atoms/Button";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";
import { MenuTrigger } from "./Menu";

export type { SplitButtonSize, SplitButtonVariant };

export interface SplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> {
  /** Neutral look of both segments — separate pills (`primary`) or one connected outline (`secondary`). @default "primary" */
  variant?: SplitButtonVariant;
  /** Control-ladder rung of both segments. @default "md" */
  size?: SplitButtonSize;
  /** Visible label of the main action segment. */
  label: string;
  /** Click handler of the main action segment. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Icon beside the main label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
  icon?: React.ReactNode;
  /** Which side of the main label the icon sits on; the `loading` spinner takes the same slot. @default "start" */
  iconPosition?: "start" | "end";
  /** Spinner on the main segment; both segments go non-interactive (the main one stays focusable). */
  loading?: boolean;
  /** Disables both segments. */
  disabled?: boolean;
  /** The main segment's form behavior. @default "button" */
  type?: "submit" | "reset" | "button";
  /** Accessible name (and tooltip) of the icon-only menu segment. @default "More options" */
  menuLabel?: string;
}

/**
 * A main action `Button` joined to a chevron `IconButton` that opens related alternatives. It ships
 * no menu of its own: place it inside a qui `Menu`, with the popup as a sibling `MenuContent` —
 * the chevron segment is that menu's `MenuTrigger`. Neutral only; there's no danger split button.
 *
 * ```tsx
 * <Menu>
 *   <SplitButton label="Save" onClick={save} />
 *   <MenuContent align="end">
 *     <MenuItem>Save as draft</MenuItem>
 *   </MenuContent>
 * </Menu>
 * ```
 */
export const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  (
    { variant = "primary", size = "md", label, onClick, icon, iconPosition, loading = false, disabled, type = "button", menuLabel = "More options", className, ...props },
    ref
  ) => (
    <div ref={ref} className={cn(splitButtonFrameVariants({ variant }), className)} {...props}>
      <Button variant={variant} size={size} label={label} onClick={onClick} icon={icon} iconPosition={iconPosition} loading={loading} disabled={disabled} type={type} />
      <MenuTrigger
        disabled={disabled || loading}
        render={<IconButton variant={variant} size={size} aria-label={menuLabel} icon={<Icon icon={ChevronDown} />} />}
      />
    </div>
  )
);
SplitButton.displayName = "SplitButton";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Menu>
      <QUI.SplitButton label="Save" icon={<QUI.Icon icon={Icons.Save} />} />
      <QUI.MenuContent align="end">
        <QUI.MenuItem>Save as draft</QUI.MenuItem>
        <QUI.MenuItem>Save and close</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
    <QUI.Menu>
      <QUI.SplitButton variant="secondary" label="Export" />
      <QUI.MenuContent align="end">
        <QUI.MenuItem>Export as CSV</QUI.MenuItem>
        <QUI.MenuItem>Export as PDF</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Menu>
      <QUI.SplitButton size="sm" label="Small" />
      <QUI.MenuContent>
        <QUI.MenuItem>Option</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
    <QUI.Menu>
      <QUI.SplitButton size="lg" variant="secondary" label="Large" />
      <QUI.MenuContent>
        <QUI.MenuItem>Option</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
    <QUI.Menu>
      <QUI.SplitButton label="Saving" loading />
      <QUI.MenuContent>
        <QUI.MenuItem>Option</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
    <QUI.Menu>
      <QUI.SplitButton variant="secondary" label="Disabled" disabled />
      <QUI.MenuContent>
        <QUI.MenuItem>Option</QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary"], "size": ["sm", "md", "lg"], "iconPosition": ["start", "end"], "loading": "boolean", "disabled": "boolean" }
PROPS__ */
