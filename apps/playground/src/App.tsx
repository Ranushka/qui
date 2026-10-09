import * as React from "react";
import * as QUI from "@qui/ui";
import { ExternalLink } from "lucide-react";
import { pages, redirects } from "./pages";
import { componentGroups, componentNames } from "./pages/ComponentsPage";

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

const examplePages = pages.filter((p) => p.fullBleed);
const toolPages = pages.filter((p) => !p.fullBleed);
const examplePaths = new Set(examplePages.map((p) => p.path));

/** Example screens open in their own tab, so they're shown exactly as an app would be. */
const exampleUrl = (path: string) => `${window.location.pathname}#${path}`;

/** Everything the search can jump to: example screens, pages and every component. */
const searchTargets: Record<string, string> = {
  ...Object.fromEntries(examplePages.map((p) => [`Example: ${p.title}`, p.path])),
  ...Object.fromEntries(toolPages.filter((p) => p.path !== "/components").map((p) => [p.title, p.path])),
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
        const target = searchTargets[next];
        if (details.reason === "item-press" && target) {
          if (examplePaths.has(target)) window.open(exampleUrl(target), "_blank", "noopener");
          else window.location.hash = target;
          setValue("");
        } else {
          setValue(next);
        }
      }}
      openOnInputClick
    >
      <QUI.AutocompleteInputGroup aria-label="Search components and pages" placeholder="Search components, pages…" />
      <QUI.AutocompleteContent>
        {(item) => <QUI.AutocompleteItem key={item} value={item}>{item}</QUI.AutocompleteItem>}
      </QUI.AutocompleteContent>
    </QUI.Autocomplete>
  );
}

function SidePanel({ route }: { route: string }) {
  return (
    <QUI.Stack gap="4" padding="3">
      <QUI.Stack gap="3">
        <QUI.Box paddingX="2" paddingTop="1">
          <QUI.Text weight="semibold" color="primary">qui playground</QUI.Text>
        </QUI.Box>
        <PlaygroundSearch />
      </QUI.Stack>

      <QUI.List aria-label="Playground pages">
        {toolPages.map((p) => (
          <QUI.ListItem key={p.path}>
            <QUI.ListItemLink href={`#${p.path}`} aria-current={route === p.path || route.startsWith(`${p.path}/`) ? "page" : undefined} label={p.title} />
          </QUI.ListItem>
        ))}
      </QUI.List>

      <QUI.ListSection label="Examples" defaultOpen>
        <QUI.List aria-label="Example screens">
          {examplePages.map((p) => (
            <QUI.ListItem key={p.path}>
              <QUI.ListItemLink
                href={exampleUrl(p.path)}
                target="_blank"
                rel="noopener"
                label={p.title}
                endIcon={<QUI.Icon icon={ExternalLink} />}
              />
            </QUI.ListItem>
          ))}
        </QUI.List>
      </QUI.ListSection>

      {componentGroups.map((group) => (
        <QUI.ListSection key={group.title} label={`${group.title} (${group.names.length})`} defaultOpen={route.startsWith("/components")}>
          <QUI.List aria-label={group.title} gap="px">
            {group.names.map((name) => (
              <QUI.ListItem key={name} density="compact">
                <QUI.ListItemLink href={`#/components/${name}`} aria-current={route === `/components/${name}` ? "page" : undefined} label={name} />
              </QUI.ListItem>
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
    </QUI.Stack>
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
        <QUI.Inline gap="0" wrap={false} align="stretch" height="full">
          <QUI.Box as="nav" aria-label="Playground" hideBelow="md" width="3xs" shrink={false} overflow="auto" background="surface-1" border="subtle" borderEdge="end">
            <SidePanel route={route} />
          </QUI.Box>
          <QUI.Stack height="full" grow>
            <QUI.Box hideAbove="md" background="surface-1" border="subtle" borderEdge="bottom" padding="3" shrink={false}>
              <PlaygroundSearch />
            </QUI.Box>
            <QUI.Box as="main" key={page.path} grow overflow="auto" padding="8">
              <Page />
            </QUI.Box>
          </QUI.Stack>
        </QUI.Inline>
      </QUI.Box>
    </QUI.QuiProvider>
  );
}
