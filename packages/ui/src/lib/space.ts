/**
 * qui's spacing scale: the only spacing values layout props accept. Steps are on Tailwind's 4px
 * grid (`"1"` = 4px, `"4"` = 16px). Keeping the set closed is what stops apps drifting off-design —
 * extend it here, never with ad-hoc values at a call site.
 *
 * Tailwind only generates classes it can see as literals, so every prop → class mapping below is
 * spelled out in full rather than built with template strings.
 */
export type Space = "0" | "0.5" | "1" | "1.5" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16";

export const gapClass: Record<Space, string> = {
  "0": "gap-0", "0.5": "gap-0.5", "1": "gap-1", "1.5": "gap-1.5", "2": "gap-2", "3": "gap-3", "4": "gap-4",
  "5": "gap-5", "6": "gap-6", "8": "gap-8", "10": "gap-10", "12": "gap-12", "16": "gap-16",
};

export const gapXClass: Record<Space, string> = {
  "0": "gap-x-0", "0.5": "gap-x-0.5", "1": "gap-x-1", "1.5": "gap-x-1.5", "2": "gap-x-2", "3": "gap-x-3", "4": "gap-x-4",
  "5": "gap-x-5", "6": "gap-x-6", "8": "gap-x-8", "10": "gap-x-10", "12": "gap-x-12", "16": "gap-x-16",
};

export const gapYClass: Record<Space, string> = {
  "0": "gap-y-0", "0.5": "gap-y-0.5", "1": "gap-y-1", "1.5": "gap-y-1.5", "2": "gap-y-2", "3": "gap-y-3", "4": "gap-y-4",
  "5": "gap-y-5", "6": "gap-y-6", "8": "gap-y-8", "10": "gap-y-10", "12": "gap-y-12", "16": "gap-y-16",
};

export const paddingClass: Record<Space, string> = {
  "0": "p-0", "0.5": "p-0.5", "1": "p-1", "1.5": "p-1.5", "2": "p-2", "3": "p-3", "4": "p-4",
  "5": "p-5", "6": "p-6", "8": "p-8", "10": "p-10", "12": "p-12", "16": "p-16",
};

export const paddingXClass: Record<Space, string> = {
  "0": "px-0", "0.5": "px-0.5", "1": "px-1", "1.5": "px-1.5", "2": "px-2", "3": "px-3", "4": "px-4",
  "5": "px-5", "6": "px-6", "8": "px-8", "10": "px-10", "12": "px-12", "16": "px-16",
};

export const paddingYClass: Record<Space, string> = {
  "0": "py-0", "0.5": "py-0.5", "1": "py-1", "1.5": "py-1.5", "2": "py-2", "3": "py-3", "4": "py-4",
  "5": "py-5", "6": "py-6", "8": "py-8", "10": "py-10", "12": "py-12", "16": "py-16",
};
