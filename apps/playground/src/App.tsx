import { QuiProvider } from "@qui/ui";
import { ComponentsPage } from "./pages/ComponentsPage";

export function App() {
  return (
    <QuiProvider>
      <div className="min-h-full bg-canvas p-8">
        <ComponentsPage />
      </div>
    </QuiProvider>
  );
}
