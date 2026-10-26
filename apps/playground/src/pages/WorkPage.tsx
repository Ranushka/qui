import * as React from "react";
import { PlaceholderPage } from "../examples/acme/placeholder";
import { workEntries, workSlug } from "../examples/acme/shell";

/** The Work entry's slug: what follows `#/examples/work/`. */
function useSlug() {
  const read = () => window.location.hash.replace(/^#\/examples\/work\/?/, "").split("?")[0]!;
  const [slug, setSlug] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setSlug(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return slug;
}

/** The Work sidebar entries without a sample of their own: an empty screen for each, e.g. `#/examples/work/drafts`. */
export function WorkPage() {
  const slug = useSlug();
  const entry = workEntries.find((i) => workSlug(i.label) === slug) ?? workEntries[0]!;
  return <PlaceholderPage key={entry.label} icon={entry.icon} label={entry.label} />;
}
