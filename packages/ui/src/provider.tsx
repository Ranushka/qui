import * as React from "react";
import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";
import { Tooltip } from "@base-ui/react/tooltip";

export interface QuiProviderProps {
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}

/**
 * Root provider for the design system: sets reading direction for every direction-aware Base UI
 * primitive (popups, menus, tooltips mirror and position correctly) and shares one open/close
 * delay across every Tooltip beneath it. Pair `dir` with `dir="rtl"`/`lang` on `<html>` for the
 * CSS logical properties qui's components rely on.
 */
export function QuiProvider({ dir = "ltr", children }: QuiProviderProps) {
  return (
    <BaseDirectionProvider direction={dir}>
      <Tooltip.Provider>{children}</Tooltip.Provider>
    </BaseDirectionProvider>
  );
}
