import * as React from "react";
import * as QUI from "@qui/ui";
import { icons } from "lucide-react";

type IconName = keyof typeof icons;

const allNames = Object.keys(icons) as IconName[];

/** Every lucide icon qui can render, searchable; picking one shows the code to use it. */
export function IconsPage() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<IconName>("Settings");
  const [copied, setCopied] = React.useState(false);

  const names = React.useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[\s-]/g, "");
    return q ? allNames.filter((n) => n.toLowerCase().includes(q)) : allNames;
  }, [query]);

  const snippet = `import { ${selected} } from "lucide-react";\n<Icon icon={${selected}} />`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <QUI.Stack gap="6">
      <QUI.Stack gap="1">
        <QUI.Heading level={1} size={4}>Icons</QUI.Heading>
        <QUI.Text color="secondary">
          qui renders lucide icons through <QUI.Text weight="medium" color="primary">Icon</QUI.Text>, and every icon slot (Button, IconButton, Pill, ListItem, …) takes one. Click an icon to get its code.
        </QUI.Text>
      </QUI.Stack>

      <QUI.Box background="surface-1" border="subtle" radius="lg" padding="4">
        <QUI.Inline justify="between" gap="4">
          <QUI.Inline gap="4" wrap={false}>
            <QUI.Box background="layer-2" radius="md" padding="3" shrink={false}>
              <QUI.Icon icon={icons[selected]} size="xl" />
            </QUI.Box>
            <QUI.Stack gap="1">
              <QUI.Text weight="semibold" color="primary">{selected}</QUI.Text>
              <QUI.Text variant="caption" color="secondary">{`<Icon icon={${selected}} />`}</QUI.Text>
            </QUI.Stack>
          </QUI.Inline>
          <QUI.Button
            variant="secondary"
            icon={<QUI.Icon icon={copied ? icons.Check : icons.Copy} />}
            label={copied ? "Copied" : "Copy code"}
            onClick={copy}
          />
        </QUI.Inline>
      </QUI.Box>

      <QUI.Inline gap="3">
        <QUI.Box width="md">
          <QUI.Input
            aria-label="Search icons"
            placeholder="Search icons, e.g. arrow, user, chart"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startSlot={<QUI.Icon icon={icons.Search} tint="placeholder" />}
          />
        </QUI.Box>
        <QUI.Text variant="caption" color="tertiary" tabularNums>
          {names.length} of {allNames.length}
        </QUI.Text>
      </QUI.Inline>

      {names.length ? (
        <QUI.Inline as="ul" gap="1" aria-label="Icons">
          {names.map((name) => (
            <QUI.Box as="li" key={name}>
              <QUI.IconButton
                variant={name === selected ? "secondary" : "ghost"}
                size="lg"
                aria-label={name}
                aria-pressed={name === selected}
                icon={<QUI.Icon icon={icons[name]} />}
                onClick={() => setSelected(name)}
              />
            </QUI.Box>
          ))}
        </QUI.Inline>
      ) : (
        <QUI.Box border="subtle" dashed radius="lg" padding="8">
          <QUI.Text as="p" color="tertiary" align="center">No icons match “{query}”.</QUI.Text>
        </QUI.Box>
      )}
    </QUI.Stack>
  );
}
