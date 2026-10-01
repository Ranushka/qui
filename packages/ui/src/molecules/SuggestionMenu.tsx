import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { nodeSlotClass } from "../lib/node-slot";

const OPTION_SELECTOR = '[role="option"]';
/** Rows moved by `PageDown`/`PageUp` — a fixed page, so hosts need no measuring. */
const PAGE_SIZE = 10;

/**
 * The popup surface, scrolling past 320px of rows. `fixed` is a 320px column; `fit` sizes to the
 * widest row between the popup family's min/max widths and never shrinks while mounted.
 */
const suggestionMenuVariants = cva(
  cn(
    "max-h-80 overflow-y-auto overscroll-contain rounded-lg border-sm border-subtle-1 bg-layer-2",
    "shadow-[0px_10px_10px_-5px_rgb(41_47_61/0.04),0px_20px_25px_-5px_rgb(41_47_61/0.1)]"
  ),
  {
    variants: {
      width: {
        fixed: "w-80 max-w-full",
        fit: cn(
          "w-max",
          "min-w-[min(max(var(--popup-width-min),var(--qui-held-width,0px)),100%)]",
          "max-w-[min(var(--popup-width-max),100%)]"
        ),
      },
    },
    defaultVariants: { width: "fixed" },
  }
);

/** A 34px row: 16px glyph, the highlight fill on `data-highlighted` (set by the keyboard owner — the row is never focused). */
const suggestionMenuItemClass = cn(
  "flex min-h-8.5 w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 outline-none select-none",
  "text-body-sm-regular text-primary [--node-size:var(--control-glyph-lg)]",
  "data-highlighted:bg-layer-transparent-hover"
);

/** One highlight source per menu; rows subscribe to their own boolean, not the changing id. */
function createHighlightStore() {
  let highlightedId: string | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => highlightedId,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    highlight: (id: string | null) => {
      if (id === highlightedId) return;
      highlightedId = id;
      listeners.forEach((listener) => listener());
    },
  };
}
type HighlightStore = ReturnType<typeof createHighlightStore>;

const SuggestionMenuContext = React.createContext<HighlightStore | null>(null);

/** Holds a content-sized element's widest width as `--qui-held-width` so filtering never narrows it. */
function useHeldWidth(enabled: boolean) {
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    if (!enabled || !element) return;
    let held = 0;
    const hold = () => {
      const width = element.offsetWidth;
      if (width > held) {
        held = width;
        element.style.setProperty("--qui-held-width", `${width}px`);
      }
    };
    hold();
    if (typeof ResizeObserver === "undefined") return () => element.style.removeProperty("--qui-held-width");
    const observer = new ResizeObserver(hold);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.style.removeProperty("--qui-held-width");
    };
  }, [enabled, element]);
  return setElement;
}

/** Imperative handle for the input that keeps focus while the menu is open. */
export interface SuggestionMenuActions {
  /**
   * Handles a key forwarded from the input: `ArrowDown`/`ArrowUp` move one row, `PageDown`/`PageUp`
   * a page (10 rows), `Home`/`End` jump to the ends, `Enter`/`Tab` choose the highlighted row.
   * Returns `true` when the menu used the key — the caller should then `preventDefault()`.
   */
  handleKeyDown: (event: Pick<KeyboardEvent, "key">) => boolean;
}

export interface SuggestionMenuProps extends NoClass<Omit<React.HTMLAttributes<HTMLDivElement>, "role">> {
  /** Receives the menu's {@link SuggestionMenuActions}; forward the input's key presses to it. */
  actionsRef?: React.Ref<SuggestionMenuActions>;
  /** Whether the highlight wraps at the ends of the list. @default true */
  loopFocus?: boolean;
  /** Runs when the highlighted row changes, with its `id` (or `null` with no rows) — mirror it into the input's `aria-activedescendant`. */
  onHighlightChange?: (id: string | null) => void;
  /** `fixed` is the 320px column; `fit` sizes to the widest row and only grows while mounted. @default "fixed" */
  width?: "fixed" | "fit";
}

/**
 * A suggestion list that follows an input which keeps focus — a `/` command menu, `@` mentions,
 * query completions. Unlike `Menu` it never moves focus: the input forwards key presses through
 * `actionsRef` and the menu owns the highlight, which starts on the first row and falls back to it
 * whenever the highlighted row is filtered out. Renders the `listbox` in place (positioning is the
 * host's job); compose `SuggestionMenuGroup`s of `SuggestionMenuItem`s inside.
 *
 * Wire the input as a combobox: give the menu an `id`, point the input's `aria-controls` at it, and
 * mirror `onHighlightChange` into its `aria-activedescendant`.
 */
export const SuggestionMenu = React.forwardRef<HTMLDivElement, SuggestionMenuProps>(
  ({ actionsRef, loopFocus = true, onHighlightChange, width = "fixed", onMouseDown, ...props }, ref) => {
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [store] = React.useState(createHighlightStore);
    const { getSnapshot, subscribe, highlight } = store;
    const highlightedId = React.useSyncExternalStore(subscribe, getSnapshot, () => null);
    const holdWidth = useHeldWidth(width === "fit");

    const setList = React.useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node;
        holdWidth(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [holdWidth, ref]
    );

    const getOptions = React.useCallback(() => Array.from(listRef.current?.querySelectorAll<HTMLElement>(OPTION_SELECTOR) ?? []), []);

    // Re-anchor the highlight after every render: rows may have been filtered out or added.
    React.useLayoutEffect(() => {
      const options = getOptions();
      if (options.some((option) => option.id === getSnapshot())) return;
      highlight(options[0]?.id ?? null);
    });

    React.useEffect(() => {
      onHighlightChange?.(highlightedId);
    }, [highlightedId, onHighlightChange]);

    const moveTo = React.useCallback(
      (target: HTMLElement | undefined) => {
        if (!target || target.id === getSnapshot()) return;
        highlight(target.id);
        target.scrollIntoView?.({ block: "nearest" });
      },
      [getSnapshot, highlight]
    );

    React.useImperativeHandle(
      actionsRef,
      () => ({
        handleKeyDown(event) {
          const deltas: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: PAGE_SIZE, PageUp: -PAGE_SIZE };
          const isMenuKey = event.key in deltas || ["Home", "End", "Enter", "Tab"].includes(event.key);
          if (!isMenuKey) return false;
          const options = getOptions();
          if (options.length === 0) return false;
          const current = options.findIndex((option) => option.id === getSnapshot());

          if (event.key === "Enter" || event.key === "Tab") {
            options[Math.max(current, 0)]?.click();
            return true;
          }
          if (event.key === "Home" || event.key === "End") {
            moveTo(options[event.key === "Home" ? 0 : options.length - 1]);
            return true;
          }
          const delta = deltas[event.key] ?? 0;
          const length = options.length;
          let next = current === -1 ? (delta >= 0 ? 0 : length - 1) : current + delta;
          if (next < 0 || next >= length) {
            // PageUp/PageDown clamp to the ends; single steps wrap when looping.
            if (loopFocus && Math.abs(delta) === 1) next = (next + length) % length;
            else next = Math.min(Math.max(next, 0), length - 1);
          }
          moveTo(options[next]);
          return true;
        },
      }),
      [getOptions, getSnapshot, loopFocus, moveTo]
    );

    return (
      <SuggestionMenuContext.Provider value={store}>
        <div
          ref={setList}
          role="listbox"
          className={cn(suggestionMenuVariants({ width }))}
          onMouseDown={(event) => {
            // A press on a row must never steal focus from the input.
            if (event.target !== event.currentTarget) event.preventDefault();
            onMouseDown?.(event);
          }}
          {...props}
        />
      </SuggestionMenuContext.Provider>
    );
  }
);
SuggestionMenu.displayName = "SuggestionMenu";

export interface SuggestionMenuGroupProps extends NoClass<Omit<React.HTMLAttributes<HTMLDivElement>, "role">> {
  /** Optional section heading. */
  label?: React.ReactNode;
}

/** A section of rows with an optional caption heading; sections are divided by a hairline (the last draws none). */
export const SuggestionMenuGroup = React.forwardRef<HTMLDivElement, SuggestionMenuGroupProps>(({ label, children, ...props }, ref) => {
  const labelId = React.useId();
  const hasLabel = label != null;
  return (
    <div ref={ref} role="group" aria-labelledby={hasLabel ? labelId : undefined} className={cn("border-b-sm border-subtle p-1 last:border-b-0")} {...props}>
      {hasLabel ? (
        <div id={labelId} className="truncate px-2 py-1.5 text-caption-md-regular text-tertiary">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
});
SuggestionMenuGroup.displayName = "SuggestionMenuGroup";

export interface SuggestionMenuItemProps extends NoClass<Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "children">> {
  /** Leading glyph, tinted `icon-secondary`. */
  icon?: React.ReactNode;
  /** The row label; truncates. */
  label: React.ReactNode;
  /** Inline-end content — a `Shortcut`, a badge. */
  trailing?: React.ReactNode;
}

/**
 * A suggestion row (`role="option"`). `onClick` runs when it's chosen — by a click, or by
 * `Enter`/`Tab` forwarded through the menu's `actionsRef`. Pointer movement highlights it.
 */
export const SuggestionMenuItem = React.forwardRef<HTMLDivElement, SuggestionMenuItemProps>(
  ({ icon, label, trailing, id, onMouseMove, ...props }, ref) => {
    const store = React.useContext(SuggestionMenuContext);
    if (!store) throw new Error("SuggestionMenuItem must be rendered inside a SuggestionMenu.");
    const generatedId = React.useId();
    const rowId = id ?? generatedId;
    const highlighted = React.useSyncExternalStore(store.subscribe, () => store.getSnapshot() === rowId, () => false);
    return (
      <div
        ref={ref}
        id={rowId}
        role="option"
        aria-selected={highlighted}
        data-highlighted={highlighted ? "" : undefined}
        className={cn(suggestionMenuItemClass)}
        onMouseMove={(event) => {
          if (!highlighted) store.highlight(rowId);
          onMouseMove?.(event);
        }}
        {...props}
      >
        {icon != null ? <span className={cn(nodeSlotClass, "text-icon-secondary")}>{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {trailing != null ? <span className={nodeSlotClass}>{trailing}</span> : null}
      </div>
    );
  }
);
SuggestionMenuItem.displayName = "SuggestionMenuItem";

/* __DOC
<QUI.SuggestionMenu aria-label="Insert block">
  <QUI.SuggestionMenuGroup label="Basic blocks">
    <QUI.SuggestionMenuItem icon={<Icons.Type />} label="Text" />
    <QUI.SuggestionMenuItem icon={<Icons.Heading1 />} label="Heading 1" trailing={<QUI.Shortcut keys="#" />} />
    <QUI.SuggestionMenuItem icon={<Icons.List />} label="Bulleted list" trailing={<QUI.Shortcut keys="-" />} />
  </QUI.SuggestionMenuGroup>
  <QUI.SuggestionMenuGroup label="Embeds">
    <QUI.SuggestionMenuItem icon={<Icons.Image />} label="Image" />
    <QUI.SuggestionMenuItem icon={<Icons.Table />} label="Table" />
  </QUI.SuggestionMenuGroup>
</QUI.SuggestionMenu>
DOC__ */

/* __PROPS
{ "width": ["fixed", "fit"], "loopFocus": "boolean" }
PROPS__ */
