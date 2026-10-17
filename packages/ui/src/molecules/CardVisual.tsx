import * as React from "react";
import { cva } from "class-variance-authority";
import { Nfc, Snowflake } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

// Spelled out so Tailwind sees every class. Deep two-stop gradients from the extended ramps, so white text
// stays above 4.5:1 in both themes.
const cardVisualVariants = cva(
  "relative isolate flex aspect-[1.586] shrink-0 select-none flex-col justify-between overflow-hidden rounded-xl text-on-color shadow-raised-200 bg-linear-135",
  {
    variants: {
      color: {
        indigo: "from-(--extended-color-indigo-600) to-(--extended-color-indigo-900)",
        emerald: "from-(--extended-color-emerald-600) to-(--extended-color-emerald-900)",
        purple: "from-(--extended-color-purple-600) to-(--extended-color-purple-900)",
        crimson: "from-(--extended-color-crimson-600) to-(--extended-color-crimson-900)",
        grey: "from-(--extended-color-grey-700) to-(--extended-color-grey-950)",
      },
      size: {
        sm: "w-56 p-3 gap-2",
        md: "w-80 p-5 gap-3",
      },
    },
    defaultVariants: { color: "indigo", size: "md" },
  }
);

export type CardVisualColor = "indigo" | "emerald" | "purple" | "crimson" | "grey";

export interface CardVisualProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "children" | "color">> {
  /** Name printed on the card. */
  holder: string;
  /** Last four digits; the rest are masked. */
  last4: string;
  /** Expiry as printed, e.g. "09/29". */
  expiry?: string;
  /** The card's nickname, top left — e.g. "AWS billing". Defaults to the issuer name. */
  nickname?: string;
  /** Card network mark, bottom right. @default "visa" */
  network?: "visa" | "mastercard";
  /** `virtual` cards show a "Virtual" tag; `physical` ones a contactless mark. @default "virtual" */
  form?: "virtual" | "physical";
  /** Card colour, e.g. per program or team. @default "indigo" */
  color?: CardVisualColor;
  /** Frozen cards are greyed out with a "Frozen" badge. */
  frozen?: boolean;
  /** `sm` for lists and pickers, `md` for a card's detail view. @default "md" */
  size?: "sm" | "md";
}

/** Two overlapping discs, the Mastercard mark, drawn in white so it reads on every card colour. */
function MastercardMark() {
  return (
    <span className="relative flex h-5 w-8" aria-hidden>
      <span className="absolute inset-y-0 start-0 aspect-square rounded-full bg-white/85" />
      <span className="absolute inset-y-0 end-0 aspect-square rounded-full bg-white/55" />
    </span>
  );
}

/**
 * A payment card drawn at real proportions (ISO/IEC 7810 ID-1): nickname and virtual/contactless mark on top,
 * the masked number, then holder, expiry and network. Decorative chrome around text that carries the meaning,
 * so the whole card is one labelled image for assistive tech.
 */
export const CardVisual = React.forwardRef<HTMLDivElement, CardVisualProps>(
  ({ holder, last4, expiry, nickname = "Acme", network = "visa", form = "virtual", color, frozen = false, size = "md", ...props }, ref) => {
    const label = `${network === "visa" ? "Visa" : "Mastercard"} ${form} card ending ${last4}, ${holder}${expiry ? `, expires ${expiry}` : ""}${frozen ? ", frozen" : ""}`;
    const small = size === "sm";
    return (
      <div ref={ref} role="img" aria-label={label} className={cn(cardVisualVariants({ color: frozen ? "grey" : color, size }), frozen && "opacity-80")} {...props}>
        {/* A soft highlight, so the flat gradient reads as a physical surface. */}
        <span aria-hidden className="absolute -inset-e-1/4 -top-1/2 -z-10 aspect-square w-3/4 rounded-full bg-white/10" />
        <span className="flex items-start justify-between gap-2">
          <span className={cn("truncate", small ? "text-caption-md-semibold" : "text-body-sm-semibold")}>{nickname}</span>
          {frozen ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-caption-sm-semibold [--node-size:0.75rem]">
              <Snowflake aria-hidden className="size-(--node-size)" />
              Frozen
            </span>
          ) : form === "virtual" ? (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-caption-sm-semibold">Virtual</span>
          ) : (
            <Nfc aria-hidden className={small ? "size-4" : "size-5"} />
          )}
        </span>
        <span className={cn("tabular-nums tracking-widest", small ? "text-body-xs-medium" : "text-body-md-medium")}>•••• •••• •••• {last4}</span>
        <span className="flex items-end justify-between gap-2">
          <span className="flex min-w-0 flex-col">
            <span className={cn("truncate uppercase opacity-90", small ? "text-caption-sm-medium" : "text-caption-md-medium")}>{holder}</span>
            {expiry ? <span className={cn("tabular-nums opacity-75", small ? "text-caption-sm-regular" : "text-caption-md-regular")}>{expiry}</span> : null}
          </span>
          {network === "visa" ? <span className={cn("italic tracking-tight", small ? "text-body-sm-bold" : "text-h5-bold")}>VISA</span> : <MastercardMark />}
        </span>
      </div>
    );
  }
);
CardVisual.displayName = "CardVisual";

/* __DOC_BLOCK
<div className="flex flex-wrap items-start gap-4 p-4">
  <QUI.CardVisual holder="Saif Kapadia" last4="4821" expiry="09/29" nickname="AWS billing" />
  <QUI.CardVisual holder="Candice Smith" last4="1167" expiry="03/28" nickname="Team travel" form="physical" network="mastercard" color="emerald" />
  <QUI.CardVisual holder="Aisha Khan" last4="9034" nickname="Ads" color="purple" size="sm" />
  <QUI.CardVisual holder="Sohrab Khan" last4="5502" nickname="Office" size="sm" frozen />
</div>
DOC__ */

/* __PROPS
{ "color": ["indigo", "emerald", "purple", "crimson", "grey"], "size": ["sm", "md"], "form": ["virtual", "physical"], "network": ["visa", "mastercard"], "frozen": "boolean" }
PROPS__ */
