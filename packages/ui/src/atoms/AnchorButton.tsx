import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { textLinkBaseClass, textLinkPalette } from "../lib/text-link-chrome";
import { Icon } from "./Icon";

/** Inline-link chrome: the shared text-link look on an `<a>`, with an `aria-disabled` treatment (anchors have no native disabled). */
const anchorButtonVariants = cva(cn(textLinkBaseClass, "group gap-1 aria-disabled:cursor-not-allowed aria-disabled:text-disabled"), {
  variants: {
    variant: textLinkPalette,
    size: {
      xs: "text-caption-md-regular [--node-size:var(--control-glyph-xs)]",
      sm: "text-body-xs-regular [--node-size:var(--control-glyph-sm)]",
      md: "text-body-xs-regular [--node-size:var(--control-glyph-md)]",
      lg: "text-body-sm-regular [--node-size:var(--control-glyph-lg)]",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

/**
 * Where the link goes. `linkComponent` swaps the `<a>` for a router/framework link component (e.g.
 * Next.js `Link`) — a component type, not an element, so the caller can't attach its own classes.
 */
type AnchorButtonDestination = { href: string; linkComponent?: React.ElementType };

export type AnchorButtonProps = NoClass<
Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> &
  VariantProps<typeof anchorButtonVariants> &
  AnchorButtonDestination & {
    /** Visible link label — the only underlined part, so flanking icons stay clean. */
    label: string;
    /** Icon rendered beside the label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
    icon?: React.ReactNode;
    /** Which side of the label the icon sits on. @default "start" */
    iconPosition?: "start" | "end";
    /**
     * Opens in a new tab: defaults `target="_blank"`, `rel="noreferrer noopener"` and a trailing
     * external-link arrow. Explicit `target`/`rel`/`icon` still win. It doesn't inspect `href`.
     * @default false
     */
    external?: boolean;
    /** Drops the destination (and `linkComponent`), leaves an inert, unfocusable, `aria-disabled` anchor. */
    disabled?: boolean;
  }
>;

/** Swallows navigation (click/aux-click) on a disabled link. */
function blockNavigation(disabled: boolean | undefined, handler: React.MouseEventHandler<HTMLAnchorElement> | undefined): React.MouseEventHandler<HTMLAnchorElement> {
  return (event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handler?.(event);
  };
}

/** Skips a caller's interaction handler while disabled. */
function skipWhenDisabled<E extends React.SyntheticEvent>(disabled: boolean | undefined, handler: ((event: E) => void) | undefined) {
  return (event: E) => {
    if (!disabled) handler?.(event);
  };
}

/**
 * A semantic link wearing inline text-link chrome: a native `<a>` (underlined label, optional icon)
 * by default, or render a router link via `linkComponent` (e.g. `linkComponent={Link}`). `external` opens a new tab
 * with a trailing arrow. For a text-only *action* use `TextButton`.
 */
export const AnchorButton = React.forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  (
    {
      variant,
      size,
      label,
      icon,
      iconPosition = "start",
      external = false,
      disabled,
      href,
      linkComponent: LinkComponent,
      target,
      rel,
      tabIndex,
      onClick,
      onAuxClick,
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onPointerDown,
      "aria-disabled": ariaDisabled,
      ...props
    },
    ref
  ) => {
    const resolvedIcon = icon ?? (external ? <Icon icon={ExternalLink} /> : null);
    const resolvedPosition = icon == null && external ? "end" : iconPosition;

    return useRender({
      defaultTagName: "a",
      render: disabled || !LinkComponent ? undefined : <LinkComponent />,
      ref,
      props: {
        ...props,
        className: cn(anchorButtonVariants({ variant, size })),
        href: disabled ? undefined : href,
        target: target ?? (external ? "_blank" : undefined),
        rel: rel ?? (external ? "noreferrer noopener" : undefined),
        tabIndex: disabled ? -1 : tabIndex,
        "aria-disabled": disabled ? true : ariaDisabled,
        onClick: blockNavigation(disabled, onClick),
        onAuxClick: blockNavigation(disabled, onAuxClick),
        onKeyDown: skipWhenDisabled(disabled, onKeyDown),
        onKeyUp: skipWhenDisabled(disabled, onKeyUp),
        onMouseDown: skipWhenDisabled(disabled, onMouseDown),
        onPointerDown: skipWhenDisabled(disabled, onPointerDown),
        children: (
          <>
            {resolvedPosition === "start" ? resolvedIcon : null}
            <span className="underline underline-offset-2">{label}</span>
            {resolvedPosition === "end" ? resolvedIcon : null}
          </>
        ),
      },
    });
  }
);
AnchorButton.displayName = "AnchorButton";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-6">
    <QUI.AnchorButton href="#" label="Read the docs" />
    <QUI.AnchorButton href="#" variant="secondary" label="Privacy policy" />
    <QUI.AnchorButton href="https://plane.so" label="plane.so" external />
    <QUI.AnchorButton href="#" label="Attachments" icon={<QUI.Icon icon={Icons.Paperclip} />} />
    <QUI.AnchorButton href="#" label="Disabled link" disabled />
  </div>
  <div className="flex flex-wrap items-center gap-6">
    <QUI.AnchorButton href="#" size="xs" label="xs" />
    <QUI.AnchorButton href="#" size="sm" label="sm" />
    <QUI.AnchorButton href="#" size="md" label="md" />
    <QUI.AnchorButton href="#" size="lg" label="lg" />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary"], "size": ["xs", "sm", "md", "lg"], "iconPosition": ["start", "end"], "external": "boolean", "disabled": "boolean" }
PROPS__ */
