import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Search, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlGroupClass, controlSize, type ControlSize } from "../lib/control-group";
import { controlInputClass } from "../lib/control-input";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";

/** Stacks trigger and row in one grid cell so expanding grows in place instead of side by side. */
const expandableSearchTrackClass = "inline-grid [&>*]:col-start-1 [&>*]:row-start-1";

const motionClass = "motion-safe:transition-[grid-template-columns,opacity] motion-safe:duration-200 motion-safe:ease-out";

/**
 * The collapsed trigger's box: matches the expanded row's height at the same `size`, centring the
 * smaller icon button in it so toggling never shifts height. Collapses its column to 0fr and fades
 * out once expanded.
 */
const expandableSearchTriggerVariants = cva(
  cn(
    "grid place-items-center [&>*]:min-w-0",
    "overflow-visible data-expanded:overflow-hidden",
    "grid-cols-[minmax(0,1fr)] opacity-100 data-expanded:grid-cols-[minmax(0,0fr)] data-expanded:opacity-0",
    motionClass
  ),
  {
    variants: {
      size: { md: controlSize.md, lg: controlSize.lg, xl: controlSize.xl, "2xl": controlSize["2xl"] },
    },
    defaultVariants: { size: "md" },
  }
);

/** The expanded row: grows its column from 0fr to its intrinsic width and fades in — the reverse of the trigger. */
const expandableSearchRowClass = cn(
  "grid [&>*]:min-w-0",
  "overflow-hidden data-expanded:overflow-visible",
  "grid-cols-[minmax(0,0fr)] opacity-0 data-expanded:grid-cols-[minmax(0,1fr)] data-expanded:opacity-100",
  motionClass
);

/** The bordered input frame — the same `Input`/`AutocompleteInputGroup` frame family. */
const expandableSearchGroupVariants = cva(cn(controlGroupClass, "w-full items-center"), {
  variants: {
    size: {
      md: cn(controlSize.md, "gap-(--control-gap-md) rounded-(--control-radius-md) pr-px pl-(--field-inset-md)"),
      lg: cn(controlSize.lg, "gap-(--control-gap-lg) rounded-(--control-radius-lg) pr-px pl-(--field-inset-lg)"),
      xl: cn(controlSize.xl, "gap-(--control-gap-xl) rounded-(--control-radius-xl) pr-px pl-(--field-inset-xl)"),
      "2xl": cn(controlSize["2xl"], "gap-(--control-gap-2xl) rounded-(--control-radius-2xl) pr-px pl-(--field-inset-2xl)"),
    },
  },
  defaultVariants: { size: "md" },
});

/** Icon buttons step one rung below the field so they read as a control inside the row's box. */
const iconButtonSize = { md: "sm", lg: "md", xl: "lg", "2xl": "lg" } as const;

function isFilled(value: unknown) {
  if (value == null) return false;
  if (typeof value === "string" || Array.isArray(value)) return value.length > 0;
  return true;
}

type AutocompleteRootProps = React.ComponentPropsWithoutRef<typeof BaseAutocomplete.Root>;

export interface ExpandableSearchProps extends Omit<AutocompleteRootProps, "children"> {
  /** Accessible name for both the collapsed trigger and the expanded input. */
  "aria-label": string;
  /** Accessible name for the clear button shown once there's text. @default "Clear search" */
  clearLabel?: string;
  /** Shared by the trigger and the input row; the icon buttons step one rung smaller. @default "md" */
  size?: ControlSize;
  /** Placeholder shown once expanded. @default "Search…" */
  placeholder?: string;
  /** Controlled expanded state (distinct from Autocomplete's popup `open`). */
  expanded?: boolean;
  /** Initial expanded state. Defaults to expanded when `value`/`defaultValue` is non-empty. */
  defaultExpanded?: boolean;
  /** Called whenever the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Suggestion popup (e.g. `AutocompleteContent`), used together with `items`. Omit for a plain search box. */
  children?: React.ReactNode;
  /** Classes for the outer track wrapping trigger + row (e.g. a fixed expanded width). */
  className?: string;
}

/**
 * A search icon button that expands into a search input. Clicking the trigger expands and focuses
 * the input; blurring it or pressing Escape while it's empty collapses back and (for Escape)
 * returns focus to the trigger. A field that's `required` and still invalid stays expanded so it
 * remains reachable. Expansion is controllable via `expanded`/`defaultExpanded`/`onExpandedChange`,
 * and a non-empty `value`/`defaultValue` starts (and a controlled non-empty `value` keeps) it open.
 *
 * Built on `Autocomplete`: pass `items` + `children` (an `AutocompleteContent`) for suggestions, or
 * neither for a plain `role="searchbox"` input. Both trigger and input stay mounted at every state —
 * they swap width through an animated grid track, with the hidden half made `inert` — so the input
 * keeps its value and native form validation across collapse/expand.
 */
export function ExpandableSearch({
  "aria-label": ariaLabel,
  clearLabel = "Clear search",
  size = "md",
  placeholder = "Search…",
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  children,
  className,
  open,
  disabled,
  value,
  defaultValue,
  ...rootProps
}: ExpandableSearchProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(() => defaultExpanded ?? isFilled(value ?? defaultValue));
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : uncontrolledExpanded;

  const setExpanded = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledExpanded(next);
      if (next !== expanded) onExpandedChange?.(next);
    },
    [isControlled, expanded, onExpandedChange]
  );

  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const restoreTriggerFocus = React.useRef(false);

  // A controlled non-empty value must never sit hidden behind the inert trigger.
  React.useEffect(() => {
    if (value !== undefined && isFilled(value) && !expanded) setExpanded(true);
  }, [value, expanded, setExpanded]);

  const wasExpanded = React.useRef(expanded);
  React.useEffect(() => {
    const opened = expanded && !wasExpanded.current;
    const closed = !expanded && wasExpanded.current;
    wasExpanded.current = expanded;
    if (opened) inputRef.current?.focus();
    else if (closed && restoreTriggerFocus.current) {
      restoreTriggerFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [expanded]);

  const hasPopup = children != null;
  // While collapsed, a controlled popup `open` is forced closed; without popup content, never open.
  const resolvedOpen = open !== undefined ? expanded && open : hasPopup ? undefined : false;

  return (
    <BaseAutocomplete.Root open={resolvedOpen} disabled={disabled} value={value} defaultValue={defaultValue} {...rootProps}>
      <div className={cn(expandableSearchTrackClass, className)}>
        <span className={expandableSearchTriggerVariants({ size })} data-expanded={expanded ? "" : undefined} inert={expanded || undefined}>
          <IconButton
            ref={triggerRef}
            variant="ghost"
            size={iconButtonSize[size]}
            aria-label={ariaLabel}
            aria-expanded={expanded}
            showTooltip={false}
            icon={<Icon icon={Search} />}
            disabled={disabled}
            onClick={() => setExpanded(true)}
          />
        </span>
        <div className={expandableSearchRowClass} data-expanded={expanded ? "" : undefined} inert={!expanded || undefined}>
          <BaseAutocomplete.InputGroup className={expandableSearchGroupVariants({ size })}>
            <Icon icon={Search} tint="placeholder" />
            <BaseAutocomplete.Input
              ref={inputRef}
              placeholder={placeholder}
              aria-label={ariaLabel}
              className={cn(controlInputClass, "flex-1 self-stretch")}
              {...(!hasPopup && {
                role: "searchbox",
                "aria-haspopup": undefined,
                "aria-expanded": undefined,
                "aria-autocomplete": undefined,
                "aria-controls": undefined,
              })}
              onInvalid={() => setExpanded(true)}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key !== "Escape") return;
                const input = event.currentTarget;
                if (input.value !== "" || !input.validity.valid) return;
                event.preventDefault();
                restoreTriggerFocus.current = true;
                setExpanded(false);
              }}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                if (event.target.value === "" && event.target.validity.valid) setExpanded(false);
              }}
            />
            <BaseAutocomplete.Clear
              render={<IconButton variant="ghost" size={iconButtonSize[size]} aria-label={clearLabel} showTooltip={false} icon={<Icon icon={X} />} />}
            />
          </BaseAutocomplete.InputGroup>
        </div>
      </div>
      {children}
    </BaseAutocomplete.Root>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col items-start gap-4 p-4">
  <QUI.ExpandableSearch aria-label="Search issues" />
  <QUI.ExpandableSearch aria-label="Search projects" size="lg" defaultValue="Roadmap" />
  <QUI.ExpandableSearch aria-label="Search countries" items={["Afghanistan", "Albania", "Algeria", "Andorra", "Angola"]}>
    <QUI.AutocompleteContent>
      {(item) => <QUI.AutocompleteItem key={item} value={item}>{item}</QUI.AutocompleteItem>}
    </QUI.AutocompleteContent>
  </QUI.ExpandableSearch>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "defaultExpanded": "boolean", "disabled": "boolean", "required": "boolean" }
PROPS__ */
