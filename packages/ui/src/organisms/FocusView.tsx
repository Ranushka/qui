import * as React from "react";
import { Minimize2 } from "../icons";
import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

export interface FocusViewProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "title">> {
  /** What is in focus, e.g. `"Account balance logs"`. */
  title: React.ReactNode;
  /** Icon before the title. */
  icon?: React.ReactNode;
  /** Buttons before the exit button, e.g. the page's primary action. */
  actions?: React.ReactNode;
  /** A row under the title, e.g. a `FilterBar`. */
  toolbar?: React.ReactNode;
  /** A row under the content, e.g. the row count and bulk actions. */
  footer?: React.ReactNode;
  /** Leaves the focus view. Also called on Esc, unless focus is in a text field or an open popup. */
  onExit: () => void;
  /** Label of the exit button. @default "Exit focus view" */
  exitLabel?: string;
  /**
   * Shows the exit button in the title row. Turn it off when the page puts its own toggle elsewhere, e.g. next to
   * the button that opened the view; Esc still exits.
   * @default true
   */
  exitButton?: boolean;
  /** The content in focus, usually a `DataTable`; it gets all the height the other rows leave. */
  children: React.ReactNode;
}

/**
 * A full-screen view of one piece of content — typically a table — without the app's navigation and header, so
 * people can concentrate on the data: a title row, an optional toolbar, the content filling the rest of the screen,
 * and an optional footer. Render it in place of the app shell; keep it in the URL so it can be shared, reloaded and
 * left with the back button.
 */
export function FocusView({ title, icon, actions, toolbar, footer, onExit, exitLabel = "Exit focus view", exitButton = true, children, ...props }: FocusViewProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const exit = React.useRef(onExit);
  exit.current = onExit;

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      // Popups render outside the view, so Esc there closes the popup only.
      if (target !== document.body && !root.current?.contains(target)) return;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      exit.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div ref={root} className="flex h-dvh w-full min-w-0 flex-col bg-surface-1" {...props}>
      {/* On phones the title keeps the first row with an icon-only exit; the actions move to a row of their own. */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon}
          <Heading level={1} size={5} weight="semibold" truncate>
            {title}
          </Heading>
        </div>
        {exitButton ? (
          <span className="flex sm:hidden">
            <IconButton variant="secondary" aria-label={exitLabel} icon={<Icon icon={Minimize2} />} onClick={onExit} />
          </span>
        ) : null}
        {actions != null || exitButton ? (
          <div className={cn("flex shrink-0 items-center gap-2 max-sm:order-last max-sm:basis-full", actions == null && "max-sm:hidden")}>
            {actions}
            {exitButton ? (
              <span className="flex max-sm:hidden">
                <Button variant="secondary" icon={<Icon icon={Minimize2} />} label={exitLabel} onClick={onExit} />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {toolbar != null ? <div className="flex shrink-0 px-4 pb-3">{toolbar}</div> : null}
      <div className="flex min-h-0 flex-1 flex-col px-4">{children}</div>
      {footer != null ? <div className="shrink-0 px-4 py-3">{footer}</div> : null}
    </div>
  );
}

/* __DOC_BLOCK
<div className="h-96 w-full overflow-hidden rounded-lg border border-subtle [&>div]:h-full">
  <QUI.FocusView
    title="Work items"
    icon={<QUI.Icon icon={Icons.ListTodo} size="lg" tint="secondary" />}
    onExit={() => {}}
    footer={<QUI.Text size="xs" color="tertiary">3 items</QUI.Text>}
  >
    <QUI.DataTable
      aria-label="Work items"
      data={[{ id: "WEB-1", title: "Login page" }, { id: "WEB-2", title: "Billing" }, { id: "WEB-3", title: "Onboarding" }]}
      columns={[{ accessorKey: "id", header: "ID", size: 96 }, { accessorKey: "title", header: "Title" }]}
    />
  </QUI.FocusView>
</div>
DOC__ */
