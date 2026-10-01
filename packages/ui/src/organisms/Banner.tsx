import * as React from "react";
import { cva } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";

type BannerVariant = "info" | "success" | "warning" | "danger";

const bannerVariants = cva("flex w-full items-start gap-2 border-sm px-3 py-2 text-body-sm-regular text-secondary [--node-size:1rem]", {
  variants: {
    variant: {
      info: "border-info-subtle bg-info-subtle",
      success: "border-success-subtle bg-success-subtle",
      warning: "border-warning-subtle bg-warning-subtle",
      danger: "border-danger-subtle bg-danger-subtle",
    },
    /** `inline` is a rounded callout inside content; `page` is a full-bleed strip with only a bottom edge. */
    layout: {
      inline: "rounded-lg",
      page: "rounded-none border-x-0 border-t-0",
    },
  },
  defaultVariants: { variant: "info", layout: "inline" },
});

const defaultIcons: Record<BannerVariant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

const iconColor: Record<BannerVariant, string> = {
  info: "text-icon-info-primary",
  success: "text-icon-success-primary",
  warning: "text-icon-warning-primary",
  danger: "text-icon-danger-primary",
};

export interface BannerProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "title">> {
  /** Status tone; also picks the default icon and ARIA role. @default "info" */
  variant?: BannerVariant;
  /** Rounded inline callout, or a full-width page strip. @default "inline" */
  layout?: "inline" | "page";
  /** Bold lead line. */
  title?: React.ReactNode;
  /** Replaces the variant's default icon; pass `null` to hide it. */
  icon?: React.ReactNode | null;
  /** Trailing actions, e.g. a `Button`. */
  actions?: React.ReactNode;
  /** Shows a close button that calls this. */
  onDismiss?: () => void;
}

/**
 * A status message strip. `warning`/`danger` announce as `role="alert"`, `info`/`success` as
 * `role="status"`. Body text goes in `children`, below the optional `title`.
 */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ variant = "info", layout = "inline", title, icon, actions, onDismiss, children, ...props }, ref) => {
    const DefaultIcon = defaultIcons[variant];
    const role = variant === "warning" || variant === "danger" ? "alert" : "status";
    return (
      <div ref={ref} role={role} className={cn(bannerVariants({ variant, layout }))} {...props}>
        {icon !== null && <span className={cn("mt-0.5 flex shrink-0", iconColor[variant])}>{icon ?? <Icon icon={DefaultIcon} />}</span>}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {title != null && <p className="text-body-sm-medium text-primary">{title}</p>}
          {children != null && <div>{children}</div>}
        </div>
        {actions != null && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        {onDismiss && (
          <span className="-my-0.5 flex shrink-0">
            <IconButton variant="ghost" size="sm" aria-label="Dismiss" showTooltip={false} icon={<Icon icon={X} />} onClick={onDismiss} />
          </span>
        )}
      </div>
    );
  }
);
Banner.displayName = "Banner";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-3 p-4">
  <QUI.Banner title="Heads up">Cycles now roll over unfinished work automatically.</QUI.Banner>
  <QUI.Banner variant="success" onDismiss={() => {}}>Project published.</QUI.Banner>
  <QUI.Banner variant="warning" title="Storage almost full" actions={<QUI.Button size="sm" variant="secondary" label="Upgrade" />}>
    You've used 92% of your workspace storage.
  </QUI.Banner>
  <QUI.Banner variant="danger" title="Sync failed" onDismiss={() => {}}>Couldn't reach the GitHub integration.</QUI.Banner>
  <QUI.Banner layout="page" icon={null}>Scheduled maintenance tonight at 22:00 UTC.</QUI.Banner>
</div>
DOC__ */

/* __PROPS
{ "variant": ["info", "success", "warning", "danger"], "layout": ["inline", "page"] }
PROPS__ */
