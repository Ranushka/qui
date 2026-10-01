import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { controlGroupClass } from "../lib/control-group";

const textAreaGroupVariants = cva(cn(controlGroupClass, "w-full items-stretch gap-1.5 rounded-lg"), {
  variants: {
    resize: {
      none: "resize-none",
      vertical: "resize-y overflow-hidden",
      both: "resize overflow-hidden",
    },
  },
  defaultVariants: { resize: "vertical" },
});

const textAreaVariants = cva(
  "scrollbar-sm w-full min-w-full resize-none overflow-y-auto bg-transparent p-3 text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:text-disabled",
  {
    variants: {
      size: {
        md: "min-h-[3.75rem] text-caption-md-regular",
        lg: "min-h-[4.75rem] text-body-xs-regular",
        xl: "min-h-[6.375rem] text-body-sm-regular",
        "2xl": "min-h-[5.625rem] text-body-md-regular",
      },
    },
    defaultVariants: { size: "md" },
  }
);

function lineHeightPx(computed: CSSStyleDeclaration) {
  const parsed = parseFloat(computed.lineHeight);
  return Number.isFinite(parsed) ? parsed : parseFloat(computed.fontSize) * 1.2;
}

function syncHeight(element: HTMLTextAreaElement, maxRows: number | undefined) {
  element.style.height = "auto";
  const computed = getComputedStyle(element);
  const borderY = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
  let next = element.scrollHeight + borderY;
  if (maxRows != null) {
    const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const maxHeight = lineHeightPx(computed) * maxRows + paddingY + borderY;
    next = Math.min(next, maxHeight);
  }
  element.style.height = `${next}px`;
}

export interface TextAreaProps extends NoClass<Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">>, VariantProps<typeof textAreaVariants>, VariantProps<typeof textAreaGroupVariants> {
  /** Grows the control with its content, above the size's `min-height`. @default false */
  autoResize?: boolean;
  /** Caps `autoResize` growth at this many rows. */
  maxRows?: number;
  groupClassName?: string;
}

/**
 * Multi-line text field. `autoResize` grows the frame with typed content (pair it with
 * `resize="none"` on the frame, the default, so the native drag handle doesn't fight it);
 * `maxRows` caps that growth before scrolling takes over.
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ size = "md", autoResize = false, maxRows, resize = "vertical", groupClassName, onInput, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);
    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    React.useLayoutEffect(() => {
      if (autoResize && localRef.current) syncHeight(localRef.current, maxRows);
    }, [autoResize, maxRows, props.value]);

    return (
      <div className={cn(textAreaGroupVariants({ resize: autoResize ? "none" : resize }), groupClassName)}>
        <textarea
          ref={setRef}
          className={cn(textAreaVariants({ size }), autoResize && "h-auto")}
          onInput={(event) => {
            onInput?.(event);
            if (autoResize) syncHeight(event.currentTarget, maxRows);
          }}
          {...props}
        />
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

/* __DOC_BLOCK
<div className="flex flex-col gap-3 p-4">
  <QUI.TextArea placeholder="Write something…" size="md" />
  <QUI.TextArea placeholder="Auto-resizing, up to 6 rows" autoResize maxRows={6} />
  <QUI.TextArea placeholder="Disabled" disabled />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "resize": ["none", "vertical", "both"], "autoResize": "boolean", "disabled": "boolean" }
PROPS__ */
