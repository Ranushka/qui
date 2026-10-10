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

const has = (node: unknown) => node != null && node !== false;
const iconSlots = (props: Record<string, unknown>, a = "startIcon", b = "endIcon") =>
  has(props[a]) && has(props[b]) ? "both" : has(props[a]) ? "start" : has(props[b]) ? "end" : "none";
const stateOf = (props: Record<string, unknown>) => (props.loading ? "loading" : props.disabled ? "disabled" : "default");
const STATES = ["default", "hover", "focus", "pressed", "disabled", "loading"] as const;
const SIZES4 = ["xs", "sm", "md", "lg"] as const;
const BUTTON_VARIANTS = ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline"] as const;
const AVATAR_SIZES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const AVATAR_PX: Record<number, string> = { 16: "2xs", 20: "xs", 24: "sm", 28: "md", 32: "lg", 40: "xl", 56: "2xl", 64: "3xl" };

/** A name whose deterministic avatar colour is `color`, so every colour variant can be rendered. */
const seedFor = (color: string) => {
  for (const a of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") for (const b of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") if (getAvatarVariant(`${a}x ${b}y`) === color) return `${a}x ${b}y`;
  return "Ann Lee";
};
const AVATAR_SEEDS = Object.fromEntries(AVATAR_VARIANTS.map((c) => [c, seedFor(c)]));
const SWATCH_FILL: Record<string, string> = { blue: "#3f76ff", red: "#ef4444", green: "#22c55e" };

export const specs: Spec[] = [
  {
    name: "Button",
    level: "atoms",
    axes: { Variant: BUTTON_VARIANTS, Size: SIZES4, Icon: ["none", "start", "end"], State: STATES },
    render: (v) => (
      <QUI.Button
        variant={v.Variant as "primary"}
        size={v.Size as "md"}
        label="Label"
        icon={v.Icon !== "none" ? <QUI.Icon icon={Icons.Plus} /> : undefined}
        iconPosition={v.Icon === "end" ? "end" : "start"}
        disabled={v.State === "disabled"}
        loading={v.State === "loading"}
      />
    ),
    toVariant: (p) => ({ Variant: String(p.variant ?? "primary"), Size: String(p.size ?? "md"), Icon: has(p.icon) ? (p.iconPosition === "end" ? "end" : "start") : "none", State: stateOf(p) }),
  },
  {
    name: "IconButton",
    level: "atoms",
    axes: { Variant: BUTTON_VARIANTS, Size: SIZES4, State: STATES },
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
    axes: { Variant: ["outline", "soft", "ghost"], Size: ["xs", "sm", "md"], Icon: ["none", "start", "end", "both"], State: STATES },
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
    axes: { Variant: ["neutral", "brand", "info", "success", "warning", "danger"], Size: ["xs", "sm", "md"], Icon: ["none", "start", "end", "both"] },
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
    render: (v) => <QUI.Avatar size={v.Size as "md"} alt={AVATAR_SEEDS[v.Color!]} />,
    toVariant: (p, el) => ({ Size: AVATAR_PX[Math.round(el.getBoundingClientRect().width)] ?? "md", Color: getAvatarVariant(getAvatarVariantSeed(p.alt, p.fallback) || "A") }),
  },
  {
    name: "AvatarGroup",
    level: "atoms",
    axes: { Size: ["xs", "sm"], Shown: ["1", "2", "3"], Overflow: ["none", "chip"] },
    render: (v) => {
      const shown = Number(v.Shown); const n = shown + (v.Overflow === "chip" ? 2 : 0);
      return (
        <QUI.AvatarGroup size={v.Size as "sm"} max={shown}>
          {["Ann Lee", "Ben Ray", "Cy Fox", "Di Poe", "Ed Moss"].slice(0, n).map((name) => <QUI.Avatar key={name} alt={name} />)}
        </QUI.AvatarGroup>
      );
    },
    toVariant: (p) => {
      const n = React.Children.count(p.children); const max = Number(p.max ?? n); const shown = Math.min(n, max);
      return { Size: String(p.size ?? "sm"), Shown: String(Math.min(shown, 3)), Overflow: n > max ? "chip" : "none" };
    },
  },
  {
    name: "Swatch",
    level: "atoms",
    axes: { Size: ["12", "14", "16"], Color: ["blue", "red", "green"] },
    cell: (v) => ({ ["--node-size" as string]: `${v.Size}px` }) as React.CSSProperties,
    render: (v) => <QUI.Swatch fill={SWATCH_FILL[v.Color!]!} />,
    toVariant: (_p, el) => ({ Size: String(Math.round(el.getBoundingClientRect().width)), Color: "blue" }),
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
    render: (v) => <QUI.WorkspaceAvatar size={v.Size as "md"} alt={AVATAR_SEEDS[v.Color!]} />,
    toVariant: (p, el) => ({ Size: AVATAR_PX[Math.round(el.getBoundingClientRect().width)] ?? "md", Color: getAvatarVariant(getAvatarVariantSeed(p.alt, p.fallback) || "A") }),
  },
  {
    name: "Heading",
    level: "atoms",
    axes: { Size: ["1", "2", "3", "4", "5", "6"], Weight: ["regular", "medium", "semibold", "bold"] },
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
    axes: { Variant: ["contained", "underline"], Icon: ["none", "start"], State: ["default", "hover", "focus", "selected", "disabled"] },
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
    axes: { Size: ["md", "lg", "xl", "2xl"], Slots: ["none", "start", "end", "both"], Value: ["placeholder", "filled"], State: ["default", "hover", "focus", "disabled", "invalid"] },
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
    axes: { Level: ["1", "2", "3"], Density: ["comfortable", "compact"], Icon: ["none", "start"], Count: ["none", "count"], State: ["default", "hover", "pressed", "focus", "selected"] },
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
];

/** Every valid combination of a spec's axes, in axis order. */
export function combinations(spec: Spec): Variant[] {
  const names = Object.keys(spec.axes);
  let out: Variant[] = [{}];
  for (const n of names) out = out.flatMap((o) => spec.axes[n]!.map((val) => ({ ...o, [n]: val })));
  return spec.valid ? out.filter(spec.valid) : out;
}
