import * as React from "react";
import { QuiProvider } from "@qui/ui";
import { ComponentsPage } from "./pages/ComponentsPage";
import { WorkItemsPage } from "./pages/WorkItemsPage";

function useHash() {
  const [hash, setHash] = React.useState(() => window.location.hash);
  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  return (
    <QuiProvider>
      {hash === "#work-items" ? (
        <WorkItemsPage />
      ) : (
        <div className="min-h-full bg-canvas p-8">
          <ComponentsPage />
        </div>
      )}
    </QuiProvider>
  );
}
