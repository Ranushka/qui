import type * as React from "react";
import { ComponentsPage } from "./ComponentsPage";
import { WorkItemsPage } from "./WorkItemsPage";

export type PlaygroundPage = {
  /** URL hash path, e.g. `/examples/work-items` → `#/examples/work-items`. */
  path: string;
  title: string;
  component: React.ComponentType;
  /** Example screens fill the viewport below the nav; others scroll with padding around them. */
  fullBleed?: boolean;
};

/** Every playground page. Add a page here and it gets a nav tab and its own URL. */
export const pages: PlaygroundPage[] = [
  { path: "/components", title: "Components", component: ComponentsPage },
  { path: "/examples/work-items", title: "Work items", component: WorkItemsPage, fullBleed: true },
];

/** Old links that should keep working. */
export const redirects: Record<string, string> = {
  "": "/components",
  "/": "/components",
  "work-items": "/examples/work-items",
};
