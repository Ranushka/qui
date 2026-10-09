import * as React from "react";
import * as QUI from "@qui/ui";
import { pages, redirects } from "./pages";
import { componentNames } from "./pages/ComponentsPage";

/** The current route: the URL hash without its `#`, with old links redirected. */
function useRoute() {
  const read = () => {
    const path = window.location.hash.slice(1);
    return redirects[path] ?? path;
  };
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

/** Everything the header search can jump to: example screens, pages and every component. */
const searchTargets: Record<string, string> = {
  ...Object.fromEntries(pages.filter((p) => p.fullBleed).map((p) => [`Example: ${p.title}`, p.path])),
  ...Object.fromEntries(pages.filter((p) => !p.fullBleed && p.path !== "/components").map((p) => [p.title, p.path])),
  ...Object.fromEntries(componentNames.map((name) => [name, `/components/${name}`])),
};
const searchItems = Object.keys(searchTargets);

function PlaygroundSearch() {
  const [value, setValue] = React.useState("");
  return (
    <QUI.Autocomplete
      items={searchItems}
      value={value}
      onValueChange={(next, details) => {
        if (details.reason === "item-press" && searchTargets[next]) {
          window.location.hash = searchTargets[next]!;
          setValue("");
        } else {
          setValue(next);
        }
      }}
      openOnInputClick
    >
      <QUI.Box width="sm" paddingBottom="2" shrink={false}>
        <QUI.AutocompleteInputGroup aria-label="Search components and pages" placeholder="Search components, pages…" />
      </QUI.Box>
      <QUI.AutocompleteContent>
        {(item) => <QUI.AutocompleteItem key={item} value={item}>{item}</QUI.AutocompleteItem>}
      </QUI.AutocompleteContent>
    </QUI.Autocomplete>
  );
}

export function App() {
  const route = useRoute();
  const page = pages.find((p) => route === p.path || route.startsWith(`${p.path}/`)) ?? pages[0]!;
  const Page = page.component;

  React.useEffect(() => {
    document.title = `${page.title} — qui playground`;
  }, [page]);

  // Example screens stand alone, with no playground chrome around them.
  if (page.fullBleed) {
    return (
      <QUI.QuiProvider>
        <QUI.Box as="main" height="screen" background="canvas">
          <Page />
        </QUI.Box>
      </QUI.QuiProvider>
    );
  }

  return (
    <QUI.QuiProvider>
      <QUI.Box height="screen" background="canvas">
        <QUI.Stack height="full">
          <QUI.Box as="header" background="surface-1" border="subtle" borderEdge="bottom" paddingX="4" paddingTop="2" shrink={false}>
            <QUI.Inline gap="6" wrap={false} align="end">
              <QUI.Box paddingBottom="2" shrink={false}>
                <QUI.Text weight="semibold" color="primary">qui playground</QUI.Text>
              </QUI.Box>
              <QUI.Box grow overflow="auto">
                <QUI.Tabs variant="underline" value={page.path} onValueChange={(path) => (window.location.hash = String(path))}>
                  <QUI.TabsList aria-label="Playground pages">
                    {pages.filter((p) => !p.fullBleed).map((p) => (
                      <QUI.Tab key={p.path} value={p.path} label={p.title} />
                    ))}
                  </QUI.TabsList>
                </QUI.Tabs>
              </QUI.Box>
              <PlaygroundSearch />
            </QUI.Inline>
          </QUI.Box>
          <QUI.Box as="main" key={page.path} grow overflow="auto" padding="8">
            <Page />
          </QUI.Box>
        </QUI.Stack>
      </QUI.Box>
    </QUI.QuiProvider>
  );
}
