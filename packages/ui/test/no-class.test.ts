import type * as React from "react";
import { describe, expect, it } from "vitest";
import * as QUI from "../src";

/**
 * qui's core rule: no public component accepts `className` or `style`. This file fails to
 * typecheck (`pnpm typecheck`) if any exported component lets them back in, and the runtime test
 * below lists every component the check covers.
 */
type Leaks<C> = C extends React.JSXElementConstructor<infer P>
  ? Extract<keyof P, "className" | "style" | `${string}ClassName` | `${string}Style`> extends never
    ? never
    : true
  : never;

type Components = { [K in keyof typeof QUI as K extends `${Uppercase<string>}${string}` ? K : never]: (typeof QUI)[K] };
type Leaking = { [K in keyof Components]: Leaks<Components[K]> extends never ? never : K }[keyof Components];

// If this line errors, the union named in the message lists the components that still accept className/style.
const noLeaks: [Leaking] extends [never] ? true : Leaking = true;

describe("no custom class options", () => {
  it("covers every exported component", () => {
    expect(noLeaks).toBe(true);
    const names = Object.keys(QUI).filter((k) => /^[A-Z]/.test(k));
    expect(names.length).toBeGreaterThan(70);
  });
});
