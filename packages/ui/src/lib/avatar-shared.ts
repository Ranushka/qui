import * as React from "react";

/** Sizes shared by `Avatar` and `AvatarGroup`. */
export type AvatarSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

/** Shares a group's `size` down to member `Avatar`s (an avatar's own `size` still wins). */
export const AvatarGroupContext = React.createContext<AvatarSize | undefined>(undefined);

export const AVATAR_VARIANTS = ["orange", "indigo", "emerald", "crimson", "pink", "purple"] as const;
export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

/** Initials type ramp per avatar size — shared by the person `Avatar` and `WorkspaceAvatar`. */
export const avatarInitialsTextClass: Record<AvatarSize, string> = {
  "2xs": "text-caption-2xs-regular",
  xs: "text-caption-2xs-regular",
  sm: "text-caption-sm-regular",
  md: "text-caption-md-regular",
  lg: "text-body-xs-regular",
  xl: "text-h6-regular",
  "2xl": "text-h4-regular",
  "3xl": "text-h3-regular",
};

/** Filled initials surface per deterministic variant. */
export const avatarFallbackVariantClass: Record<AvatarVariant, string> = {
  orange: "bg-label-orange-bg-strong text-on-color",
  indigo: "bg-label-indigo-bg-strong text-on-color",
  emerald: "bg-label-emerald-bg-strong text-on-color",
  crimson: "bg-label-crimson-bg-strong text-on-color",
  pink: "bg-label-pink-bg-strong text-on-color",
  purple: "bg-label-purple-bg-strong text-on-color",
};

/**
 * Deterministically picks a variant from a seed (a name or initials) so the same seed always gets
 * the same color. Callers must pass a non-empty seed — see {@link getAvatarVariantSeed}.
 */
export function getAvatarVariant(seed: string): AvatarVariant {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_VARIANTS[Math.abs(hash) % AVATAR_VARIANTS.length] ?? "orange";
}

/** Derives the {@link getAvatarVariant} seed from whichever of `alt`/`fallback` carries text. */
export function getAvatarVariantSeed(alt: string | undefined, fallback: React.ReactNode): string {
  const trimmedAlt = alt?.trim();
  if (trimmedAlt) return trimmedAlt;
  if (typeof fallback === "string" || typeof fallback === "number") return String(fallback).trim();
  if (React.isValidElement(fallback)) {
    const children = (fallback.props as { children?: React.ReactNode }).children;
    if (typeof children === "string" || typeof children === "number") return String(children).trim();
  }
  return "";
}

const initialsSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Two-character initials from a display name: first letter of the first and last name token. */
export function getAvatarInitials(name: string | undefined): string | undefined {
  const tokens = name?.trim().split(/\s+/).filter(Boolean);
  if (!tokens?.length) return undefined;
  const firstGrapheme = (token: string) => initialsSegmenter.segment(token)[Symbol.iterator]().next().value?.segment ?? "";
  const first = firstGrapheme(tokens[0] ?? "");
  const last = tokens.length > 1 ? firstGrapheme(tokens[tokens.length - 1] ?? "") : "";
  return Array.from(initialsSegmenter.segment(`${first}${last}`.toUpperCase()), ({ segment }) => segment)
    .slice(0, 2)
    .join("");
}

/** Preserve a complete Unicode grapheme when a compact avatar is limited to one initial. */
export function getFirstAvatarInitial(text: string): string {
  return initialsSegmenter.segment(text.trim())[Symbol.iterator]().next().value?.segment ?? "";
}
