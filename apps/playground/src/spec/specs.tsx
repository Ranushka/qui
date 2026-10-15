import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AVATAR_VARIANTS, getAvatarVariant, getAvatarVariantSeed } from "../../../../packages/ui/src/lib/avatar-shared";

/** One Penpot variant: property name -> value. */
export type Variant = Record<string, string>;

export interface Spec {
  /** Component name; the Penpot component carries the same name. */
  name: string;
  level: "atoms" | "molecules" | "organisms";
  /** Penpot variant properties in order, each with its values. */
  axes: Record<string, readonly string[]>;
  /** Which combinations exist; defaults to the full product of the axes. */
  valid?: (v: Variant) => boolean;
  /** Renders one combination exactly as the product renders it. */
  render: (v: Variant) => React.ReactNode;
  /** Inline style for the cell around the component (e.g. a width for components that fill their container). */
  cell?: React.CSSProperties | ((v: Variant) => React.CSSProperties);
  /** CSS selector (inside the cell) of the element that is the component's root; defaults to the cell's first child. */
  rootSelector?: string;
  /** The variant an instance rendered with these React props / DOM element corresponds to. */
  toVariant?: (props: Record<string, any>, el: HTMLElement, fiber: any) => Variant;
  /** Whether this DOM element can be a plain instance of the component (otherwise it is built as a frame). */
  canInstance?: (props: Record<string, any>, el: HTMLElement) => boolean;
}

/** Rows in a section body (a `List` of `ListItem`s). */
const rowCount = (body: React.ReactNode) => React.Children.count((React.Children.toArray(body)[0] as React.ReactElement<{ children?: React.ReactNode }> | undefined)?.props.children);
const sectionsOf = (children: React.ReactNode) =>
  React.Children.toArray(children).filter((c): c is React.ReactElement<{ defaultOpen?: boolean; open?: boolean; children?: React.ReactNode }> => React.isValidElement(c) && c.type === QUI.ListSection);
const has = (node: unknown) => node != null && node !== false;
/**
 * The design-library rule: the default variant, then one property changed at a time — never the full product of the axes.
 * `extras` adds specific combinations the app actually renders, each written as its changes from the default.
 */
const oneAtATime = (defaults: Variant, extras: Variant[] = []) => (v: Variant) =>
  Object.keys(defaults).filter((k) => v[k] !== defaults[k]).length <= 1 ||
  extras.some((e) => Object.keys(defaults).every((k) => v[k] === (e[k] ?? defaults[k])));
const iconSlots = (props: Record<string, unknown>, a = "startIcon", b = "endIcon") =>
  has(props[a]) && has(props[b]) ? "both" : has(props[a]) ? "start" : has(props[b]) ? "end" : "none";
const stateOf = (props: Record<string, unknown>) => (props.loading ? "loading" : props.disabled ? "disabled" : "default");
const STATES = ["default", "disabled"] as const;
const SIZES4 = ["xs", "sm", "md", "lg"] as const;
const BUTTON_VARIANTS = ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline"] as const;
const AVATAR_SIZES = ["xs", "sm", "md", "lg"] as const;
const AVATAR_PX: Record<number, string> = { 16: "2xs", 20: "xs", 24: "sm", 28: "md", 32: "lg", 40: "xl", 56: "2xl", 64: "3xl" };

/** A name whose deterministic avatar colour is `color`, so every colour variant can be rendered. */
const seedFor = (color: string) => {
  for (const a of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") for (const b of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") if (getAvatarVariant(`${a}x ${b}y`) === color) return `${a}x ${b}y`;
  return "Ann Lee";
};
const AVATAR_SEEDS = Object.fromEntries(AVATAR_VARIANTS.map((c) => [c, seedFor(c)]));
/** Person avatars the app renders at xs / sm in groups, rows and cards, one per colour it uses. */
const AVATAR_IN_APP: Variant[] = ["purple", "indigo", "emerald", "crimson", "pink"].flatMap((Color) => [{ Size: "xs", Color }, { Size: "sm", Color }]);
/** Swatch colours are data; the spec draws them from qui's label palette so the design file binds them to tokens. */
const SWATCH_FILL: Record<string, string> = { emerald: "var(--label-emerald-icon)", crimson: "var(--label-crimson-icon)", indigo: "var(--label-indigo-icon)" };

export const specs: Spec[] = [
  {
    name: "Button",
    level: "atoms",
    // Icon follows Button's iconPosition / endIcon: "both" is an icon plus a dropdown chevron (the Acme app switcher)
    axes: { Variant: BUTTON_VARIANTS, Size: SIZES4, Icon: ["false", "start", "end", "both"], State: STATES },
    valid: oneAtATime({ Variant: "primary", Size: "md", Icon: "false", State: "default" }, [
      { Variant: "secondary", Icon: "start" },
      { Variant: "ghost", Icon: "start" },
      { Variant: "ghost", Size: "lg", Icon: "both" },
    ]),
    render: (v) => (
      <QUI.Button
        variant={v.Variant as "primary"}
        size={v.Size as "md"}
        label="Label"
        icon={v.Icon === "start" || v.Icon === "both" ? <QUI.Icon icon={Icons.Plus} /> : v.Icon === "end" ? <QUI.Icon icon={Icons.ChevronDown} /> : undefined}
        iconPosition={v.Icon === "end" ? "end" : "start"}
        endIcon={v.Icon === "both" ? <QUI.Icon icon={Icons.ChevronDown} /> : undefined}
        disabled={v.State === "disabled"}
        loading={v.State === "loading"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "primary"), Size: String(p.size ?? "md"), Icon: has(p.icon) && has(p.endIcon) ? "both" : !has(p.icon) ? "false" : p.iconPosition === "end" ? "end" : "start", State: stateOf(p) }),
  },
  {
    name: "IconButton",
    level: "atoms",
    axes: { Variant: BUTTON_VARIANTS, Size: SIZES4, State: STATES },
    valid: oneAtATime({ Variant: "primary", Size: "md", State: "default" }, [{ Variant: "ghost", Size: "sm" }, { Variant: "ghost", Size: "xs" }, { Variant: "secondary", Size: "sm" }, { Variant: "secondary", Size: "xs" }, { Variant: "ghost", Size: "sm", State: "disabled" }]),
    render: (v) => (
      <QUI.IconButton
        variant={v.Variant as "primary"}
        size={v.Size as "md"}
        aria-label="Add"
        showTooltip={false}
        icon={<QUI.Icon icon={Icons.Plus} />}
        disabled={v.State === "disabled"}
        loading={v.State === "loading"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "primary"), Size: String(p.size ?? "md"), State: stateOf(p) }),
  },
  {
    name: "Pill",
    level: "atoms",
    axes: { Variant: ["outline", "soft", "ghost"], Size: ["xs", "sm", "md"], Icon: ["none", "start"], State: STATES },
    valid: oneAtATime({ Variant: "outline", Size: "md", Icon: "none", State: "default" }, [{ Size: "sm", Icon: "start" }, { Size: "xs", Icon: "start" }]),
    render: (v) => (
      <QUI.Pill
        variant={v.Variant as "outline"}
        size={v.Size as "md"}
        label="Label"
        startIcon={v.Icon === "start" || v.Icon === "both" ? <QUI.Icon icon={Icons.Filter} /> : undefined}
        endIcon={v.Icon === "end" || v.Icon === "both" ? <QUI.Icon icon={Icons.ChevronDown} /> : undefined}
        disabled={v.State === "disabled"}
        loading={v.State === "loading"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "outline"), Size: String(p.size ?? "md"), Icon: iconSlots(p), State: stateOf(p) }),
  },
  {
    name: "Badge",
    level: "atoms",
    axes: { Variant: ["neutral", "brand", "info", "success", "warning", "danger"], Size: ["xs", "sm", "md"], Icon: ["none", "start"] },
    valid: oneAtATime({ Variant: "neutral", Size: "md", Icon: "none" }, [{ Variant: "brand", Size: "sm" }]),
    render: (v) => (
      <QUI.Badge
        variant={v.Variant as "neutral"}
        size={v.Size as "md"}
        label="Label"
        startIcon={v.Icon === "start" || v.Icon === "both" ? <QUI.Icon icon={Icons.Check} /> : undefined}
        endIcon={v.Icon === "end" || v.Icon === "both" ? <QUI.Icon icon={Icons.ChevronDown} /> : undefined}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "neutral"), Size: String(p.size ?? "md"), Icon: iconSlots(p) }),
  },
  {
    name: "Avatar",
    level: "atoms",
    axes: { Size: AVATAR_SIZES, Color: AVATAR_VARIANTS },
    valid: oneAtATime({ Size: "md", Color: "orange" }, AVATAR_IN_APP),
    render: (v) => <QUI.Avatar size={v.Size as "md"} alt={AVATAR_SEEDS[v.Color!]} />,
    toVariant: (p, el) => ({ Size: AVATAR_PX[Math.round(el.getBoundingClientRect().width)] ?? "md", Color: getAvatarVariant(getAvatarVariantSeed(p.alt, p.fallback) || "A") }),
  },
  {
    name: "AvatarGroup",
    level: "atoms",
    axes: { Size: ["xs", "sm"], Shown: ["1", "2", "3"], Overflow: ["none", "chip"] },
    valid: oneAtATime({ Size: "sm", Shown: "3", Overflow: "none" }, [{ Size: "xs", Shown: "1" }, { Size: "xs", Shown: "2" }, { Shown: "2", Overflow: "chip" }]),
    render: (v) => {
      const shown = Number(v.Shown); const n = shown + (v.Overflow === "chip" ? 2 : 0);
      return (
        <QUI.AvatarGroup size={v.Size as "sm"} max={shown}>
          {["Ann Lee", "Ben Ray", "Cy Fox", "Di Poe", "Ed Moss"].slice(0, n).map((name) => <QUI.Avatar key={name} alt={name} />)}
        </QUI.AvatarGroup>
      );
    },
    toVariant: (p) => {
      // mirrors AvatarGroup's getMemberCounts: a lone extra member is shown instead of a "+1" counter
      const n = React.Children.count(p.children); const max = Number(p.max ?? 2); const shown = n <= max + 1 ? n : max;
      return { Size: String(p.size ?? "sm"), Shown: String(Math.min(shown, 3)), Overflow: shown < n ? "chip" : "none" };
    },
  },
  {
    name: "Swatch",
    level: "atoms",
    axes: { Size: ["12", "14", "16"], Color: ["emerald", "crimson", "indigo"] },
    valid: oneAtATime({ Size: "12", Color: "emerald" }),
    cell: (v) => ({ ["--node-size" as string]: `${v.Size}px` }) as React.CSSProperties,
    render: (v) => <QUI.Swatch fill={SWATCH_FILL[v.Color!]!} />,
    toVariant: (_p, el) => ({ Size: String(Math.round(el.getBoundingClientRect().width)), Color: "emerald" }),
  },
  {
    name: "Shortcut",
    level: "atoms",
    axes: { Size: ["sm", "md"] },
    render: (v) => <QUI.Shortcut keys="⌘K" size={v.Size as "md"} />,
    toVariant: (p) => ({ Size: String(p.size ?? "md") }),
  },
  {
    name: "WorkspaceAvatar",
    level: "atoms",
    axes: { Size: AVATAR_SIZES, Color: AVATAR_VARIANTS },
    valid: oneAtATime({ Size: "md", Color: "orange" }),
    render: (v) => <QUI.WorkspaceAvatar size={v.Size as "md"} alt={AVATAR_SEEDS[v.Color!]} />,
    toVariant: (p, el) => ({ Size: AVATAR_PX[Math.round(el.getBoundingClientRect().width)] ?? "md", Color: getAvatarVariant(getAvatarVariantSeed(p.alt, p.fallback) || "A") }),
  },
  {
    name: "Heading",
    level: "atoms",
    axes: { Size: ["1", "2", "3", "4", "5", "6"], Weight: ["regular", "medium", "semibold", "bold"] },
    valid: oneAtATime({ Size: "1", Weight: "semibold" }),
    render: (v) => (
      <QUI.Heading level={Number(v.Size) as 1} size={Number(v.Size) as 1} weight={v.Weight as "bold"}>
        Heading
      </QUI.Heading>
    ),
    toVariant: (p) => ({ Size: String(p.size ?? p.level), Weight: String(p.weight ?? "semibold") }),
  },
  {
    name: "Tab",
    level: "molecules",
    axes: { Variant: ["contained", "underline"], Icon: ["none", "start"], State: ["default", "selected", "disabled"] },
    valid: oneAtATime({ Variant: "contained", Icon: "none", State: "default" }, [{ Variant: "underline", State: "selected" }]),
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.Tabs variant={v.Variant as "contained"} defaultValue={v.State === "selected" ? "a" : "b"}>
        <QUI.TabsList>
          <QUI.Tab data-spec-root="" value="a" label="Label" icon={v.Icon === "start" ? <QUI.Icon icon={Icons.Settings} /> : undefined} disabled={v.State === "disabled"} />
          <QUI.Tab value="b" label="Other" />
        </QUI.TabsList>
      </QUI.Tabs>
    ),
    toVariant: (p, el, fiber) => {
      let variant = "contained";
      for (let f = fiber; f; f = f.return) { const n = f.type && (f.type.displayName || f.type.name); if (n === "Tabs") { variant = String(f.memoizedProps?.variant ?? "contained"); break; } }
      return { Variant: variant, Icon: has(p.icon) ? "start" : "none", State: p.disabled ? "disabled" : el.hasAttribute("data-active") ? "selected" : "default" };
    },
  },
  {
    name: "Input",
    level: "atoms",
    axes: { Size: ["md", "lg"], Slots: ["none", "start", "both"], Value: ["placeholder", "filled"], State: ["default", "disabled", "invalid"] },
    valid: oneAtATime({ Size: "md", Slots: "none", Value: "placeholder", State: "default" }),
    cell: { width: 320 },
    render: (v) => (
      <QUI.Input
        size={v.Size as "md"}
        aria-label="Input"
        placeholder="Placeholder"
        defaultValue={v.Value === "filled" ? "Value" : undefined}
        startSlot={v.Slots === "start" || v.Slots === "both" ? <QUI.Icon icon={Icons.Search} tint="placeholder" /> : undefined}
        endSlot={v.Slots === "end" || v.Slots === "both" ? <QUI.Shortcut keys="⌘K" /> : undefined}
        disabled={v.State === "disabled"}
        aria-invalid={v.State === "invalid" || undefined}
      />
    ),
    toVariant: (p) => ({
      Size: String(p.size ?? "md"),
      Slots: has(p.startSlot) && has(p.endSlot) ? "both" : has(p.startSlot) ? "start" : has(p.endSlot) ? "end" : "none",
      Value: p.value || p.defaultValue ? "filled" : "placeholder",
      State: p.disabled ? "disabled" : p["aria-invalid"] ? "invalid" : "default",
    }),
  },
  {
    name: "ListItem",
    level: "molecules",
    axes: { Level: ["1", "2", "3"], Density: ["comfortable", "compact"], Icon: ["none", "start"], Count: ["none", "count"], State: ["default", "selected"] },
    valid: oneAtATime({ Level: "1", Density: "comfortable", Icon: "none", Count: "none", State: "default" }, [{ Icon: "start", State: "selected" }]),
    cell: { width: 240 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.List aria-label="Spec">
        <QUI.ListItem data-spec-root="" level={Number(v.Level) as 1} density={v.Density as "compact"}>
          <QUI.ListItemButton
            aria-current={v.State === "selected" ? "page" : undefined}
            startIcon={v.Icon === "start" ? <QUI.Icon icon={Icons.House} /> : undefined}
            label="Label"
            count={v.Count === "count" ? 3 : undefined}
          />
        </QUI.ListItem>
      </QUI.List>
    ),
    canInstance: (_p, el) => el.children.length === 1,
    toVariant: (p) => {
      const child = React.Children.toArray(p.children)[0] as React.ReactElement<Record<string, unknown>> | undefined;
      const cp = (child && child.props) || {};
      return {
        Level: String(p.level ?? 1),
        Density: String(p.density ?? "comfortable"),
        Icon: has(cp.startIcon) ? "start" : "none",
        Count: cp.count ? "count" : "none",
        State: cp["aria-current"] === "page" ? "selected" : "default",
      };
    },
  },
  {
    name: "StateGroupHeader",
    level: "molecules",
    axes: { Layout: ["list", "column"] },
    cell: (v) => ({ width: v.Layout === "list" ? 880 : 240 }),
    rootSelector: "[data-spec-root]",
    render: (v) => <QUI.StateGroupHeader data-spec-root="" layout={v.Layout as "list"} icon={Icons.CircleDashed} state="Backlog" count={8} />,
    canInstance: () => true,
    toVariant: (p) => ({ Layout: String(p.layout ?? "list") }),
  },
  {
    name: "WorkItemRow",
    level: "molecules",
    axes: { Level: ["1", "2"], Priority: ["normal", "urgent"], Assignees: ["1", "2"] },
    valid: oneAtATime({ Level: "1", Priority: "normal", Assignees: "1" }),
    cell: { width: 880 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.List aria-label="Spec">
        <QUI.WorkItemRow
          data-spec-root=""
          itemId="ACME-45"
          title="Embed pages in nested wiki views"
          typeIcon={Icons.Sparkles}
          label={{ name: "Editor", color: "var(--label-emerald-icon)" }}
          due="03 Mar"
          priority={v.Priority as "normal"}
          priorityIcon={v.Priority === "urgent" ? Icons.CircleAlert : Icons.SignalHigh}
          assignees={["Ranu P", "Mia C"].slice(0, Number(v.Assignees))}
          level={Number(v.Level) as 1}
        />
      </QUI.List>
    ),
    canInstance: () => true,
    toVariant: (p) => ({
      Level: String(p.level ?? 1),
      Priority: p.priority === "urgent" ? "urgent" : "normal",
      Assignees: String(Math.min(p.assignees.length, 2)),
    }),
  },
  {
    name: "Property",
    level: "molecules",
    axes: { Content: ["pill", "people"] },
    cell: { width: 150 },
    rootSelector: "[data-spec-root]",
    render: (v) =>
      v.Content === "pill" ? (
        <QUI.Property data-spec-root="" icon={Icons.CalendarDays} label="Due date">
          <QUI.Pill size="sm" startIcon={<QUI.Icon icon={Icons.CalendarDays} />} label="03 Mar" />
        </QUI.Property>
      ) : (
        <QUI.Property data-spec-root="" icon={Icons.UsersRound} label="Assignees">
          <QUI.AvatarGroup size="sm" max={3}>
            <QUI.Avatar alt="Ranu P" />
            <QUI.Avatar alt="Mia C" />
          </QUI.AvatarGroup>
          <QUI.Text size="xs" color="secondary" maxLines={1}>Ranu P, Mia C</QUI.Text>
        </QUI.Property>
      ),
    canInstance: () => true,
    toVariant: (p) => ({ Content: (React.Children.toArray(p.children)[0] as React.ReactElement | undefined)?.type === QUI.Pill ? "pill" : "people" }),
  },
  {
    name: "ViewToolbar",
    level: "molecules",
    axes: { Layout: ["list", "board"] },
    cell: { width: 880 },
    rootSelector: "[data-spec-root]",
    render: (v) => <QUI.ViewToolbar data-spec-root="" layout={v.Layout as "list"} count={19} />,
    canInstance: () => true,
    toVariant: (p) => ({ Layout: String(p.layout ?? "list") }),
  },
  {
    name: "RailItem",
    level: "molecules",
    axes: { Current: ["false", "true"] },
    cell: { width: 56 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <ul>
        <QUI.RailItem data-spec-root="" icon={Icons.SquareStack} label="Work" current={v.Current === "true"} />
      </ul>
    ),
    canInstance: () => true,
    toVariant: (p) => ({ Current: p.current ? "true" : "false" }),
  },
  {
    name: "ListSection",
    level: "molecules",
    axes: { Open: ["true", "false"] },
    cell: { width: 232 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.ListSection data-spec-root="" label="Workspace" defaultOpen={v.Open === "true"}>
        <QUI.List aria-label="Spec">
          <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.BriefcaseBusiness} />} label="Projects" /></QUI.ListItem>
          <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Lightbulb} />} label="Initiatives" /></QUI.ListItem>
          <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Layers} />} label="Views" /></QUI.ListItem>
        </QUI.List>
      </QUI.ListSection>
    ),
    canInstance: (p) => rowCount(p.children) === 3,
    toVariant: (p) => ({ Open: p.defaultOpen || p.open ? "true" : "false" }),
  },
  {
    name: "NavSidebar",
    level: "organisms",
    axes: { Workspace: ["open", "closed"], Projects: ["open", "closed"] },
    valid: oneAtATime({ Workspace: "open", Projects: "open" }),
    cell: { width: 255 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.NavSidebar
        data-spec-root=""
        title="Work"
        action={<QUI.Button variant="secondary" stretch="full" icon={<QUI.Icon icon={Icons.SquarePen} />} label="New work item" />}
      >
        <QUI.List aria-label="Main">
          <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.House} />} label="Home" /></QUI.ListItem>
          <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.UserRound} />} label="Your work" /></QUI.ListItem>
        </QUI.List>
        <QUI.ListSection label="Workspace" defaultOpen={v.Workspace === "open"}>
          <QUI.List aria-label="Workspace">
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.BriefcaseBusiness} />} label="Projects" /></QUI.ListItem>
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Lightbulb} />} label="Initiatives" /></QUI.ListItem>
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Layers} />} label="Views" /></QUI.ListItem>
          </QUI.List>
        </QUI.ListSection>
        <QUI.ListSection label="Projects" defaultOpen={v.Projects === "open"}>
          <QUI.List aria-label="Projects">
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Tractor} />} label="Core product" /></QUI.ListItem>
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Rocket} />} label="Plane Pro" /></QUI.ListItem>
            <QUI.ListItem><QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Compass} />} label="Discover" /></QUI.ListItem>
          </QUI.List>
        </QUI.ListSection>
      </QUI.NavSidebar>
    ),
    canInstance: (p) => sectionsOf(p.children).every((c) => rowCount(c.props.children) === 3),
    toVariant: (p) => {
      const sections = sectionsOf(p.children);
      const state = (i: number) => (sections[i]?.props.defaultOpen || sections[i]?.props.open ? "open" : "closed");
      return { Workspace: state(0), Projects: state(1) };
    },
  },
  {
    name: "ProjectHeader",
    level: "organisms",
    axes: { Tab: ["overview", "work-items", "cycles", "modules"] },
    cell: { width: 1024 },
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.ProjectHeader
        data-spec-root=""
        icon={Icons.Tractor}
        title="Core product"
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "work-items", label: "Work items" },
          { value: "cycles", label: "Cycles" },
          { value: "modules", label: "Modules" },
        ]}
        value={v.Tab ?? "work-items"}
      />
    ),
    canInstance: (p) => p.tabs.length === 4,
    toVariant: (p) => ({ Tab: String(p.value) }),
  },
  {
    name: "WorkItemCard",
    level: "organisms",
    axes: { Parent: ["false", "true"], SubItems: ["false", "true"], Priority: ["normal", "urgent"], Assignees: ["1", "2", "3"] },
    valid: oneAtATime({ Parent: "false", SubItems: "false", Priority: "normal", Assignees: "1" }),
    cell: { width: 240 },
    render: (v) => (
      <ul>
        <QUI.WorkItemCard
          itemId="ACME-45"
          parentId={v.Parent === "true" ? "ACME-12" : undefined}
          typeIcon={Icons.Sparkles}
          title="Embed pages in nested wiki views"
          label={{ name: "Editor", color: "var(--label-emerald-icon)" }}
          due="03 Mar"
          priority={v.Priority as "normal"}
          priorityIcon={v.Priority === "urgent" ? Icons.CircleAlert : Icons.SignalHigh}
          assignees={["Ranu P", "Mia C", "Tom F"].slice(0, Number(v.Assignees))}
          subItems={v.SubItems === "true" ? 3 : 0}
          actions={<QUI.IconButton variant="ghost" size="xs" aria-label="Actions" icon={<QUI.Icon icon={Icons.Ellipsis} />} />}
        />
      </ul>
    ),
    rootSelector: "li",
    canInstance: () => true,
    toVariant: (p) => ({
      Parent: p.parentId ? "true" : "false",
      SubItems: p.subItems > 0 ? "true" : "false",
      Priority: p.priority === "urgent" ? "urgent" : "normal",
      Assignees: String(Math.min(p.assignees.length, 3)),
    }),
  },

  // ---------- atoms (batch 2) ----------
  {
    name: "AnchorButton",
    level: "atoms",
    axes: { Variant: ["primary", "secondary"], Size: SIZES4, Icon: ["none", "start", "end"], External: ["false", "true"], State: STATES },
    valid: oneAtATime({ Variant: "primary", Size: "md", Icon: "none", External: "false", State: "default" }),
    render: (v) => (
      <QUI.AnchorButton
        href="#"
        variant={v.Variant as "primary"}
        size={v.Size as "md"}
        label="Label"
        icon={v.Icon !== "none" ? <QUI.Icon icon={Icons.Paperclip} /> : undefined}
        iconPosition={v.Icon === "end" ? "end" : "start"}
        external={v.External === "true"}
        disabled={v.State === "disabled"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "primary"), Size: String(p.size ?? "md"), Icon: has(p.icon) ? String(p.iconPosition ?? "start") : "none", External: p.external ? "true" : "false", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "TextButton",
    level: "atoms",
    axes: { Variant: ["primary", "secondary"], Size: ["md", "lg"], Icon: ["none", "start", "end"], State: STATES },
    valid: oneAtATime({ Variant: "primary", Size: "md", Icon: "none", State: "default" }),
    render: (v) => (
      <QUI.TextButton
        variant={v.Variant as "primary"}
        size={v.Size as "md"}
        label="Label"
        icon={v.Icon !== "none" ? <QUI.Icon icon={v.Icon === "end" ? Icons.ArrowRight : Icons.Plus} /> : undefined}
        iconPosition={v.Icon === "end" ? "end" : "start"}
        disabled={v.State === "disabled"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "primary"), Size: String(p.size ?? "md"), Icon: has(p.icon) ? String(p.iconPosition ?? "start") : "none", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "Checkbox",
    level: "atoms",
    axes: { Checked: ["false", "true", "indeterminate"], State: STATES },
    valid: oneAtATime({ Checked: "false", State: "default" }, [{ Checked: "true", State: "disabled" }]),
    render: (v) => <QUI.Checkbox label="Label" defaultChecked={v.Checked === "true"} indeterminate={v.Checked === "indeterminate"} disabled={v.State === "disabled"} />,
    toVariant: (p, el) => ({
      Checked: p.indeterminate ? "indeterminate" : el.querySelector("[data-checked]") || el.hasAttribute("data-checked") ? "true" : "false",
      State: p.disabled ? "disabled" : "default",
    }),
  },
  {
    name: "CheckboxGroup",
    level: "atoms",
    axes: { Density: ["comfortable", "compact"], Orientation: ["vertical", "horizontal"] },
    valid: oneAtATime({ Density: "comfortable", Orientation: "vertical" }),
    render: (v) => (
      <QUI.CheckboxGroup aria-label="Options" density={v.Density as "compact"} orientation={v.Orientation as "vertical"} defaultValue={["a"]}>
        <QUI.Checkbox value="a" label="Option A" />
        <QUI.Checkbox value="b" label="Option B" />
        <QUI.Checkbox value="c" label="Option C" />
      </QUI.CheckboxGroup>
    ),
    canInstance: (p) => React.Children.count(p.children) === 3,
    toVariant: (p) => ({ Density: String(p.density ?? "comfortable"), Orientation: String(p.orientation ?? "vertical") }),
  },
  {
    name: "Radio",
    level: "atoms",
    axes: { Checked: ["false", "true"], State: STATES },
    valid: oneAtATime({ Checked: "false", State: "default" }, [{ Checked: "true", State: "disabled" }]),
    rootSelector: "[data-spec-root]",
    render: (v) => (
      <QUI.RadioGroup defaultValue={v.Checked === "true" ? "a" : "b"} aria-label="Spec">
        <QUI.Radio data-spec-root="" value="a" aria-label="Option" disabled={v.State === "disabled"} />
      </QUI.RadioGroup>
    ),
    toVariant: (p, el) => ({ Checked: el.hasAttribute("data-checked") ? "true" : "false", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "RadioGroup",
    level: "atoms",
    axes: { Density: ["comfortable", "compact"], Orientation: ["vertical", "horizontal"] },
    valid: oneAtATime({ Density: "comfortable", Orientation: "vertical" }),
    render: (v) => (
      <QUI.RadioGroup aria-label="Options" density={v.Density as "compact"} orientation={v.Orientation as "vertical"} defaultValue="a">
        <QUI.RadioOption value="a" label="Option A" />
        <QUI.RadioOption value="b" label="Option B" />
        <QUI.RadioOption value="c" label="Option C" />
      </QUI.RadioGroup>
    ),
    canInstance: (p) => React.Children.count(p.children) === 3,
    toVariant: (p) => ({ Density: String(p.density ?? "comfortable"), Orientation: String(p.orientation ?? "vertical") }),
  },
  {
    name: "Switch",
    level: "atoms",
    axes: { Size: ["sm", "md", "lg"], Checked: ["false", "true"], State: STATES },
    valid: oneAtATime({ Size: "md", Checked: "false", State: "default" }, [{ Checked: "true", State: "disabled" }]),
    render: (v) => <QUI.Switch size={v.Size as "md"} aria-label="Switch" defaultChecked={v.Checked === "true"} disabled={v.State === "disabled"} />,
    toVariant: (p, el) => ({ Size: String(p.size ?? "md"), Checked: el.hasAttribute("data-checked") ? "true" : "false", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "Toggle",
    level: "atoms",
    axes: { Size: ["xs", "sm", "md"], Pressed: ["false", "true"], Icon: ["none", "start"], State: STATES },
    valid: oneAtATime({ Size: "md", Pressed: "false", Icon: "none", State: "default" }),
    render: (v) => (
      <QUI.Toggle size={v.Size as "md"} label="Label" defaultPressed={v.Pressed === "true"} startIcon={v.Icon === "start" ? <QUI.Icon icon={Icons.Flag} /> : undefined} disabled={v.State === "disabled"} />
    ),
    toVariant: (p, el) => ({ Size: String(p.size ?? "md"), Pressed: el.hasAttribute("data-pressed") ? "true" : "false", Icon: has(p.startIcon) ? "start" : "none", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "IconToggle",
    level: "atoms",
    axes: { Variant: ["secondary", "ghost"], Size: ["xs", "sm", "md"], Pressed: ["false", "true"], State: STATES },
    valid: oneAtATime({ Variant: "secondary", Size: "md", Pressed: "false", State: "default" }),
    render: (v) => (
      <QUI.IconToggle variant={v.Variant as "ghost"} size={v.Size as "md"} aria-label="Star" icon={<QUI.Icon icon={Icons.Star} />} defaultPressed={v.Pressed === "true"} disabled={v.State === "disabled"} />
    ),
    toVariant: (p, el) => ({ Variant: String(p.variant ?? "secondary"), Size: String(p.size ?? "md"), Pressed: el.hasAttribute("data-pressed") ? "true" : "false", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "NumberField",
    level: "atoms",
    axes: { Size: ["sm", "md", "lg"], State: STATES },
    valid: oneAtATime({ Size: "md", State: "default" }),
    render: (v) => <QUI.NumberField size={v.Size as "md"} aria-label="Quantity" defaultValue={1} min={0} max={10} disabled={v.State === "disabled"} />,
    toVariant: (p) => ({ Size: String(p.size ?? "md"), State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "TextArea",
    level: "atoms",
    axes: { Size: ["md", "lg", "xl", "2xl"], Value: ["placeholder", "filled"], State: STATES },
    valid: oneAtATime({ Size: "md", Value: "placeholder", State: "default" }),
    cell: { width: 320 },
    render: (v) => (
      <QUI.TextArea size={v.Size as "md"} aria-label="Text" placeholder="Write something…" defaultValue={v.Value === "filled" ? "Value" : undefined} disabled={v.State === "disabled"} />
    ),
    toVariant: (p) => ({ Size: String(p.size ?? "md"), Value: p.value || p.defaultValue ? "filled" : "placeholder", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "Slider",
    level: "atoms",
    axes: { Size: ["sm", "md", "lg"], Range: ["false", "true"], Header: ["label", "none"], State: STATES },
    valid: oneAtATime({ Size: "md", Range: "false", Header: "label", State: "default" }),
    cell: { width: 320 },
    render: (v) => (
      <QUI.Slider
        size={v.Size as "md"}
        label={v.Header === "label" ? "Label" : undefined}
        aria-label={v.Header === "label" ? undefined : "Value"}
        getAriaLabel={(i) => (i === 0 ? "Minimum" : "Maximum")}
        showValue={v.Header === "label"}
        defaultValue={v.Range === "true" ? [20, 80] : 40}
        disabled={v.State === "disabled"}
      />
    ),
    toVariant: (p) => ({ Size: String(p.size ?? "md"), Range: Array.isArray(p.value ?? p.defaultValue) ? "true" : "false", Header: p.label != null ? "label" : "none", State: p.disabled ? "disabled" : "default" }),
  },
  {
    name: "LinearProgress",
    level: "atoms",
    axes: { Size: ["sm", "md"], Variant: ["brand", "success", "warning", "danger"], Label: ["false", "true"], Indeterminate: ["false", "true"] },
    valid: oneAtATime({ Size: "md", Variant: "brand", Label: "false", Indeterminate: "false" }),
    cell: { width: 320 },
    render: (v) => <QUI.LinearProgress size={v.Size as "md"} variant={v.Variant as "brand"} label={v.Label === "true" ? "Uploading" : undefined} value={62} indeterminate={v.Indeterminate === "true"} />,
    toVariant: (p) => ({ Size: String(p.size ?? "md"), Variant: String(p.variant ?? "brand"), Label: p.label != null ? "true" : "false", Indeterminate: p.indeterminate ? "true" : "false" }),
  },
  {
    name: "CircularProgress",
    level: "atoms",
    axes: { Size: ["sm", "md"], Variant: ["brand", "success", "warning", "danger"], Indeterminate: ["false", "true"] },
    valid: oneAtATime({ Size: "md", Variant: "brand", Indeterminate: "false" }),
    render: (v) => <QUI.CircularProgress size={v.Size as "md"} variant={v.Variant as "brand"} value={70} indeterminate={v.Indeterminate === "true"} />,
    toVariant: (p) => ({ Size: String(p.size ?? "md"), Variant: String(p.variant ?? "brand"), Indeterminate: p.indeterminate ? "true" : "false" }),
  },
  {
    name: "Spinner",
    level: "atoms",
    axes: { Size: ["16", "20"] },
    cell: (v) => ({ ["--node-size" as string]: `${v.Size}px` }) as React.CSSProperties,
    render: () => <QUI.Spinner />,
    toVariant: (_p, el) => ({ Size: String(Math.round(el.getBoundingClientRect().width)) }),
  },
  {
    name: "LogoSpinner",
    level: "atoms",
    axes: { Size: ["sm", "md"] },
    render: (v) => <QUI.LogoSpinner size={v.Size as "md"} alt="Loading" />,
    toVariant: (p) => ({ Size: String(p.size === "fluid" ? "md" : p.size ?? "md") }),
  },
  {
    name: "Icon",
    level: "atoms",
    axes: { Size: ["sm", "md", "2xl"], Tint: ["inherit", "secondary", "tertiary", "muted", "placeholder", "danger"] },
    valid: oneAtATime({ Size: "md", Tint: "secondary" }),
    render: (v) => <QUI.Icon icon={Icons.Settings} size={v.Size as "md"} tint={v.Tint as "secondary"} />,
    // icons inside other components stay plain glyph instances; this set documents sizes and tints
    canInstance: () => false,
    toVariant: (p) => ({ Size: String(p.size ?? "md"), Tint: String(p.tint ?? "inherit") }),
  },
  {
    name: "Separator",
    level: "atoms",
    axes: { Orientation: ["horizontal", "vertical"] },
    cell: (v) => (v.Orientation === "horizontal" ? { width: 200 } : { height: 24, display: "inline-flex" }),
    render: (v) => <QUI.Separator orientation={v.Orientation as "horizontal"} />,
    toVariant: (p) => ({ Orientation: String(p.orientation ?? "horizontal") }),
  },
  {
    name: "Skeleton",
    level: "atoms",
    axes: { Layout: ["stack", "row"] },
    render: (v) =>
      v.Layout === "stack" ? (
        <QUI.Skeleton aria-label="Loading" inlineSize="16rem">
          <QUI.SkeletonItem blockSize="1.25rem" />
          <QUI.SkeletonItem blockSize="0.875rem" inlineSize="10rem" />
        </QUI.Skeleton>
      ) : (
        <QUI.Skeleton aria-label="Loading" layout="row">
          <QUI.SkeletonItem variant="circle" inlineSize="2.5rem" blockSize="2.5rem" />
          <QUI.Skeleton aria-label="" inlineSize="12rem">
            <QUI.SkeletonItem blockSize="1rem" />
            <QUI.SkeletonItem blockSize="0.875rem" inlineSize="8rem" />
          </QUI.Skeleton>
        </QUI.Skeleton>
      ),
    canInstance: () => false,
    toVariant: (p) => ({ Layout: String(p.layout ?? "stack") }),
  },
  {
    name: "Tooltip",
    level: "atoms",
    axes: { Content: ["label"] },
    // the popup renders in a portal, outside the cell
    rootSelector: "doc:[role=presentation][data-side] > [data-open]",
    cell: { padding: "40px 0 0" },
    render: () => (
      <QUI.Tooltip label="Save changes" open>
        <QUI.Button variant="secondary" label="Trigger" />
      </QUI.Tooltip>
    ),
    toVariant: () => ({ Content: "label" }),
  },
];

/** Every valid combination of a spec's axes, in axis order. */
export function combinations(spec: Spec): Variant[] {
  const names = Object.keys(spec.axes);
  let out: Variant[] = [{}];
  for (const n of names) out = out.flatMap((o) => spec.axes[n]!.map((val) => ({ ...o, [n]: val })));
  return spec.valid ? out.filter(spec.valid) : out;
}
