import { QuiProvider, Button } from "@qui/ui";

const variants = ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;

export function App() {
  return (
    <QuiProvider>
      <div className="flex min-h-full flex-col gap-8 bg-canvas p-8">
        <h1 className="text-2xl font-semibold text-primary">qui — Button</h1>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-secondary">Variants (size=md)</h2>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((v) => (
              <Button key={v} variant={v} label={v} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-secondary">Sizes (variant=primary)</h2>
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((s) => (
              <Button key={s} size={s} label={s} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-secondary">Loading / disabled</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button label="Loading" loading />
            <Button label="Disabled" disabled />
            <Button variant="secondary" label="Loading" loading />
          </div>
        </section>
      </div>
    </QuiProvider>
  );
}
