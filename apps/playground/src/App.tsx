import * as React from "react";
import * as QUI from "@qui/ui";
import { pages, redirects } from "./pages";

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

export function App() {
  const route = useRoute();
  const page = pages.find((p) => p.path === route) ?? pages[0]!;
  const Page = page.component;

  React.useEffect(() => {
    document.title = `${page.title} — qui playground`;
  }, [page]);

  return (
    <QUI.QuiProvider>
      <QUI.Box height="screen" background="canvas">
        <QUI.Stack height="full">
          <QUI.Box as="header" background="surface-1" border="subtle" borderEdge="bottom" paddingX="4" paddingTop="2" shrink={false}>
            <QUI.Inline gap="6" wrap={false} align="end">
              <QUI.Box paddingBottom="2" shrink={false}>
                <QUI.Text weight="semibold" color="primary">qui playground</QUI.Text>
              </QUI.Box>
              <QUI.Tabs variant="underline" value={page.path} onValueChange={(path) => (window.location.hash = String(path))}>
                <QUI.TabsList aria-label="Playground pages">
                  {pages.map((p) => (
                    <QUI.Tab key={p.path} value={p.path} label={p.title} />
                  ))}
                </QUI.TabsList>
              </QUI.Tabs>
            </QUI.Inline>
          </QUI.Box>
          {page.fullBleed ? (
            <QUI.Box as="main" grow>
              <Page />
            </QUI.Box>
          ) : (
            <QUI.Box as="main" grow overflow="auto" padding="8">
              <Page />
            </QUI.Box>
          )}
        </QUI.Stack>
      </QUI.Box>
    </QUI.QuiProvider>
  );
}
