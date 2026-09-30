import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { Icon } from "../atoms/Icon";

export interface AccordionProps extends React.ComponentPropsWithoutRef<typeof BaseAccordion.Root> {}

/** Groups `AccordionItem`s on Base UI's `Accordion.Root` state machine. Pass `multiple` to allow more than one item open at once. */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(({ className, ...props }, ref) => (
  <BaseAccordion.Root ref={ref} className={cn("flex w-full flex-col", className)} {...props} />
));
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof BaseAccordion.Item> {}

/** A single collapsible section: pairs one `AccordionTrigger` with one `AccordionPanel`. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(({ className, ...props }, ref) => (
  <BaseAccordion.Item ref={ref} className={cn("border-b border-subtle", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>, "children"> {
  /** Visible trigger label. */
  label: string;
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
}

/** The header row for an `AccordionItem`: label plus a chevron that rotates open, wrapped in Base UI's `Accordion.Header`. */
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ label, icon, className, ...props }, ref) => (
    <BaseAccordion.Header className="flex">
      <BaseAccordion.Trigger
        ref={ref}
        className={cn(
          "group/trigger flex flex-1 cursor-pointer items-center gap-2 bg-layer-transparent p-3 text-start text-body-sm-medium text-primary outline-none transition-colors hover:bg-layer-transparent-hover focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:opacity-60 [--node-size:var(--control-glyph-lg)]",
          className
        )}
        {...props}
      >
        {icon}
        <span className="min-w-0 flex-1 text-start">{label}</span>
        <Icon icon={ChevronDown} tint="secondary" className="shrink-0 transition-transform duration-200 group-data-panel-open/trigger:rotate-180" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionPanelProps extends React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel> {}

/** The collapsible content for an `AccordionItem`. Height-animates via Base UI's `--accordion-panel-height` var. */
export const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Panel
    ref={ref}
    className={cn(
      "h-(--accordion-panel-height) overflow-hidden text-body-sm-regular text-secondary transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0",
      className
    )}
    {...props}
  >
    <div className="px-3 pt-1.5 pb-3">{children}</div>
  </BaseAccordion.Panel>
));
AccordionPanel.displayName = "AccordionPanel";

/* __DOC_BLOCK
<div className="flex w-full flex-col p-4">
  <QUI.Accordion defaultValue={["general"]}>
    <QUI.AccordionItem value="general">
      <QUI.AccordionTrigger label="General" icon={<QUI.Icon icon={Icons.Settings} />} />
      <QUI.AccordionPanel>Workspace name, URL, and timezone.</QUI.AccordionPanel>
    </QUI.AccordionItem>
    <QUI.AccordionItem value="members">
      <QUI.AccordionTrigger label="Members" />
      <QUI.AccordionPanel>Invite, roles, and permissions.</QUI.AccordionPanel>
    </QUI.AccordionItem>
    <QUI.AccordionItem value="billing" disabled>
      <QUI.AccordionTrigger label="Billing" />
      <QUI.AccordionPanel>Plan and invoices.</QUI.AccordionPanel>
    </QUI.AccordionItem>
  </QUI.Accordion>
</div>
DOC__ */

/* __PROPS
{ "multiple": "boolean", "disabled": "boolean" }
PROPS__ */
