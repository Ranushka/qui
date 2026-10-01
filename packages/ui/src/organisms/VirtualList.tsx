import * as React from "react";
import { defaultRangeExtractor, useVirtualizer, type Range } from "@tanstack/react-virtual";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

type VirtualListDensity = "comfortable" | "compact";
type VirtualListRole = "listbox" | "list";

/** Row heights in px, kept in lockstep with `TableCell`'s `h-11` / `h-8` so a list sits flush beside a table. */
const DEFAULT_ITEM_SIZE: Record<VirtualListDensity, number> = { comfortable: 44, compact: 32 };

/** Scroll frame: the same bordered `bg-layer-2` surface as `Table`, plus a focus ring since the frame itself takes focus. */
const virtualListFrameClass = cn(
  "group/vlist relative w-full overflow-y-auto overscroll-contain rounded-lg border-sm border-subtle bg-layer-2",
  "text-body-sm-regular text-secondary outline-none focus-visible:ring-2 focus-visible:ring-accent-strong"
);

/**
 * Row chrome, matching `TableRow`: hairline divider, hover tint, selected fill. The keyboard-active
 * row reuses the hover tint, and gets an inset accent ring only while the frame shows focus-visible.
 */
const virtualListRowVariants = cva(
  cn(
    "absolute top-0 left-0 flex w-full items-center px-3 border-b-sm border-subtle transition-colors data-last:border-b-0 [--node-size:var(--control-glyph-md)]",
    "data-selected:bg-layer-transparent-selected"
  ),
  {
    variants: {
      interactive: {
        true: cn(
          "cursor-default select-none hover:bg-layer-transparent-hover data-active:bg-layer-transparent-hover",
          "data-selected:hover:bg-layer-transparent-selected data-selected:data-active:bg-layer-transparent-selected",
          "group-focus-visible/vlist:data-active:ring-2 group-focus-visible/vlist:data-active:ring-inset group-focus-visible/vlist:data-active:ring-accent-strong"
        ),
        false: "",
      },
    },
    defaultVariants: { interactive: true },
  }
);

/** Per-row state handed to `renderItem`, so custom content can react to selection/highlight. */
export interface VirtualListItemState {
  /** The row is the keyboard-highlighted (`aria-activedescendant`) row. */
  active: boolean;
  /** `isItemSelected` returned true for this row. */
  selected: boolean;
}

export interface VirtualListProps<T> extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "role" | "onSelect"> {
  /** The full data set. Only the visible window (plus `overscan`) is ever mounted. */
  items: readonly T[];
  /** Renders one row's content. The row element itself (positioning, chrome, ARIA) is provided. */
  renderItem: (item: T, index: number, state: VirtualListItemState) => React.ReactNode;
  /** Stable React key per item. Defaults to the index — pass one whenever `items` can reorder. */
  getItemKey?: (item: T, index: number) => React.Key;
  /**
   * Row height in px (or a per-index function). Exact unless `estimated` is set.
   * @default 44 (comfortable) / 32 (compact)
   */
  itemSize?: number | ((index: number) => number);
  /** Treat `itemSize` as an estimate and measure each rendered row, for variable-height content. */
  estimated?: boolean;
  /** Extra rows rendered beyond each edge of the viewport. @default 8 */
  overscan?: number;
  /** Height of the scroll viewport (px number or any CSS length). @default 320 */
  height?: number | string;
  /** Default row height preset; ignored when `itemSize` is given. @default "comfortable" */
  density?: VirtualListDensity;
  /**
   * `listbox` (default): an interactive single-tab-stop list with arrow/Home/End/Page navigation via
   * `aria-activedescendant`. `list`: a read-only list whose frame just scrolls.
   */
  role?: VirtualListRole;
  /** Marks rows as selected — drives `aria-selected` and the selected fill. */
  isItemSelected?: (item: T, index: number) => boolean;
  /** Called when a row is clicked, or activated with Enter/Space while highlighted. */
  onItemSelect?: (item: T, index: number) => void;
  /** Controlled keyboard-highlighted row index (`-1` for none). */
  activeIndex?: number;
  /** Initial highlighted row when uncontrolled. @default -1 */
  defaultActiveIndex?: number;
  /** Called whenever the highlighted row changes (keyboard, click, or pointer focus). */
  onActiveIndexChange?: (index: number) => void;
  /** Rendered in place of rows when `items` is empty. */
  emptyState?: React.ReactNode;
}

/**
 * A windowed list for large data sets, on `@tanstack/react-virtual`: only rows inside the
 * fixed-height viewport (plus `overscan`) are mounted, each absolutely positioned inside a spacer
 * of the full scroll height. Rows carry `aria-setsize`/`aria-posinset` so assistive tech still
 * reports the true count. As a `listbox`, the frame is the single tab stop and the highlighted row
 * is exposed through `aria-activedescendant`; that row is always kept mounted and scrolled into view.
 */
function VirtualListInner<T>(
  {
    items,
    renderItem,
    getItemKey,
    itemSize,
    estimated = false,
    overscan = 8,
    height = 320,
    density = "comfortable",
    role = "listbox",
    isItemSelected,
    onItemSelect,
    activeIndex: activeIndexProp,
    defaultActiveIndex = -1,
    onActiveIndexChange,
    emptyState,
    id: idProp,
    className,
    style,
    onKeyDown,
    onFocus,
    ...props
  }: VirtualListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const generatedId = React.useId();
  const baseId = idProp ?? generatedId;
  const interactive = role === "listbox";
  const count = items.length;

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  const [uncontrolledActive, setUncontrolledActive] = React.useState(defaultActiveIndex);
  const activeIndex = Math.min(activeIndexProp ?? uncontrolledActive, count - 1);
  const setActiveIndex = React.useCallback(
    (next: number) => {
      if (activeIndexProp === undefined) setUncontrolledActive(next);
      onActiveIndexChange?.(next);
    },
    [activeIndexProp, onActiveIndexChange]
  );

  // Keep the highlighted row mounted even when scrolled out of the window, so
  // `aria-activedescendant` never points at an element that isn't in the DOM. Depending on
  // `activeIndex` matters: the virtualizer memoizes indexes on the extractor's identity.
  const rangeExtractor = React.useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range);
      if (activeIndex >= 0 && activeIndex < range.count && !indexes.includes(activeIndex)) {
        indexes.push(activeIndex);
        indexes.sort((a, b) => a - b);
      }
      return indexes;
    },
    [activeIndex]
  );

  const sizeOf = React.useCallback(
    (index: number) => (typeof itemSize === "function" ? itemSize(index) : (itemSize ?? DEFAULT_ITEM_SIZE[density])),
    [itemSize, density]
  );

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: sizeOf,
    overscan,
    rangeExtractor,
    getItemKey: getItemKey ? (index) => getItemKey(items[index] as T, index) : undefined,
    initialRect: typeof height === "number" ? { width: 0, height } : undefined,
  });

  // Fixed sizes are cached by the virtualizer; drop the cache when the size inputs change.
  React.useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, sizeOf]);

  const moveTo = (index: number) => {
    if (count === 0) return;
    const next = Math.max(0, Math.min(count - 1, index));
    setActiveIndex(next);
    virtualizer.scrollToIndex(next, { align: "auto" });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive || count === 0) return;
    const viewport = scrollRef.current?.clientHeight ?? 0;
    const page = Math.max(1, Math.floor(viewport / sizeOf(Math.max(activeIndex, 0))) - 1);
    switch (event.key) {
      case "ArrowDown":
        moveTo(activeIndex < 0 ? 0 : activeIndex + 1);
        break;
      case "ArrowUp":
        moveTo(activeIndex < 0 ? count - 1 : activeIndex - 1);
        break;
      case "Home":
        moveTo(0);
        break;
      case "End":
        moveTo(count - 1);
        break;
      case "PageDown":
        moveTo(Math.max(activeIndex, 0) + page);
        break;
      case "PageUp":
        moveTo(Math.max(activeIndex, 0) - page);
        break;
      case "Enter":
      case " ":
        if (activeIndex < 0) return;
        onItemSelect?.(items[activeIndex] as T, activeIndex);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    // Land on the first selected row (else the first row) so arrow keys have a starting point.
    if (!interactive || event.target !== event.currentTarget || activeIndex >= 0 || count === 0) return;
    const selected = isItemSelected ? items.findIndex((item, i) => isItemSelected(item, i)) : -1;
    moveTo(selected >= 0 ? selected : 0);
  };

  const optionId = (index: number) => `${baseId}-row-${index}`;
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={setRefs}
      id={baseId}
      role={role}
      tabIndex={0}
      aria-activedescendant={interactive && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={cn(virtualListFrameClass, className)}
      style={{ height, ...style }}
      {...props}
    >
      {count === 0 ? (
        emptyState != null && (
          <div className="flex h-full items-center justify-center px-3 text-body-sm-regular text-tertiary">{emptyState}</div>
        )
      ) : (
        <div role="presentation" className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualItems.map((row) => {
            const item = items[row.index] as T;
            const selected = isItemSelected?.(item, row.index) ?? false;
            const active = interactive && row.index === activeIndex;
            return (
              <div
                key={row.key}
                id={optionId(row.index)}
                ref={estimated ? virtualizer.measureElement : undefined}
                data-index={row.index}
                role={interactive ? "option" : "listitem"}
                aria-selected={interactive ? selected : undefined}
                aria-setsize={count}
                aria-posinset={row.index + 1}
                data-selected={selected ? "" : undefined}
                data-active={active ? "" : undefined}
                data-last={row.index === count - 1 ? "" : undefined}
                onClick={
                  interactive
                    ? () => {
                        setActiveIndex(row.index);
                        onItemSelect?.(item, row.index);
                      }
                    : undefined
                }
                className={virtualListRowVariants({ interactive })}
                style={{ transform: `translateY(${row.start}px)`, height: estimated ? undefined : row.size, minHeight: estimated ? row.size : undefined }}
              >
                {renderItem(item, row.index, { active, selected })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Virtualized list — renders 10k+ rows by mounting only the visible window. Generic over the item
 * type: `<VirtualList items={users} renderItem={(u) => u.name} />`.
 */
export const VirtualList = React.forwardRef(VirtualListInner) as (<T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null) & { displayName?: string };
VirtualList.displayName = "VirtualList";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-8 p-4">
  <QUI.VirtualList
    aria-label="Work items"
    height={280}
    items={Array.from({ length: 10000 }, (_, i) => ({ id: "WEB-" + (i + 1), title: "Work item " + (i + 1), points: (i * 7) % 13 }))}
    getItemKey={(item) => item.id}
    isItemSelected={(_, i) => i === 2}
    renderItem={(item) => (
      <div className="flex w-full items-center gap-3">
        <span className="w-20 shrink-0 text-body-xs-medium text-tertiary">{item.id}</span>
        <span className="min-w-0 flex-1 truncate text-primary">{item.title}</span>
        <QUI.Badge label={item.points + " pts"} />
      </div>
    )}
  />
  <QUI.VirtualList
    aria-label="Activity log"
    role="list"
    density="compact"
    height={200}
    items={Array.from({ length: 10000 }, (_, i) => "Event #" + (i + 1))}
    renderItem={(item) => (
      <span className="flex items-center gap-2">
        <QUI.Icon icon={Icons.Activity} />
        {item}
      </span>
    )}
  />
</div>
DOC__ */

/* __PROPS
{ "density": ["comfortable", "compact"], "role": ["listbox", "list"], "estimated": "boolean", "overscan": [8], "height": [320] }
PROPS__ */
