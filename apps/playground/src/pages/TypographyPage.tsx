import * as React from "react";
import * as QUI from "@qui/ui";

type Style = {
  name: string;
  code: string;
  use: string;
  render: (ref: React.Ref<HTMLElement>, sample: string) => React.ReactNode;
};

const headingUse: Record<number, string> = {
  1: "Page title on marketing-style or empty screens",
  2: "Large section title",
  3: "Page title in the app",
  4: "Section title, dialog title",
  5: "Card and panel title",
  6: "Small group title",
};

const headings: Style[] = ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
  name: `Heading ${level}`,
  code: `<Heading level={${level}}>`,
  use: headingUse[level]!,
  render: (ref, sample) => (
    <QUI.Heading ref={ref as React.Ref<HTMLHeadingElement>} level={level} truncate>
      {sample}
    </QUI.Heading>
  ),
}));

const text: Style[] = (
  [
    ["md", "Long reading text, chat messages"],
    ["sm", "Default: UI text, buttons, rows, menus, form values"],
    ["xs", "Labels and metadata: helper text, timestamps, badges, counters"],
  ] as const
).map(([size, use]) => ({
  name: `Text ${size}`,
  code: size === "sm" ? "<Text>" : `<Text size="${size}">`,
  use,
  render: (ref, sample) => <QUI.Text ref={ref} size={size} maxLines={1}>{sample}</QUI.Text>,
}));

/** Reads the rendered font size and line height, so the numbers can't drift from the tokens. */
function StyleRow({ style, sample }: { style: Style; sample: string }) {
  const ref = React.useRef<HTMLElement>(null);
  const [metrics, setMetrics] = React.useState("");
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const px = (v: string) => `${Math.round(parseFloat(v) * 10) / 10}`;
    setMetrics(`${px(cs.fontSize)} / ${px(cs.lineHeight)}`);
  }, []);
  return (
    <QUI.Box as="li" paddingY="4" border="subtle" borderEdge="bottom">
      <QUI.Stack gap="2">
        <QUI.Inline justify="between" gap="2">
          <QUI.Inline gap="2">
            <QUI.Text size="sm" weight="medium" color="primary">{style.name}</QUI.Text>
            <QUI.Text size="xs" color="tertiary" tabularNums>{metrics} px</QUI.Text>
          </QUI.Inline>
          <QUI.Inline gap="2">
            <QUI.Text size="xs" color="tertiary">{style.use}</QUI.Text>
            <QUI.Text size="xs" color="secondary">{style.code}</QUI.Text>
          </QUI.Inline>
        </QUI.Inline>
        {style.render(ref, sample)}
      </QUI.Stack>
    </QUI.Box>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <QUI.Stack gap="3">
      <QUI.Stack gap="0.5">
        <QUI.Heading level={2} size={5}>{title}</QUI.Heading>
        <QUI.Text color="secondary">{description}</QUI.Text>
      </QUI.Stack>
      <QUI.Box background="surface-1" border="subtle" radius="lg" paddingX="4">
        {children}
      </QUI.Box>
    </QUI.Stack>
  );
}

const weights = ["regular", "medium", "semibold"] as const;
const colors = ["primary", "secondary", "tertiary", "placeholder", "disabled", "accent", "link", "success", "warning", "danger", "info"] as const;

/** qui's type scale: every text style the library allows, with its size, line height and when to use it. */
export function TypographyPage() {
  const [sample, setSample] = React.useState("The quick brown fox jumps over the lazy dog");
  const shown = sample.trim() || "The quick brown fox jumps over the lazy dog";

  return (
    <QUI.Stack gap="8">
      <QUI.Stack gap="1">
        <QUI.Heading level={1} size={4}>Typography</QUI.Heading>
        <QUI.Text color="secondary">
          One font (IBM Plex Sans), three text sizes, six headings and three weights. Set text only through{" "}
          <QUI.Text weight="medium" color="primary">Text</QUI.Text> and <QUI.Text weight="medium" color="primary">Heading</QUI.Text>, so nothing drifts off the scale.
        </QUI.Text>
      </QUI.Stack>

      <QUI.Box width="md">
        <QUI.Input aria-label="Sample text" placeholder="Type your own sample" value={sample} onChange={(e) => setSample(e.target.value)} />
      </QUI.Box>

      <Section title="Headings" description="Titles. Pick the level for the outline; size can differ when the look should.">
        <QUI.Box as="ul">{headings.map((s) => <StyleRow key={s.name} style={s} sample={shown} />)}</QUI.Box>
      </Section>

      <Section title="Text" description="One scale for everything people read and act on. sm is the default; xs has a tight line height, for labels rather than paragraphs.">
        <QUI.Box as="ul">{text.map((s) => <StyleRow key={s.name} style={s} sample={shown} />)}</QUI.Box>
      </Section>

      <Section title="Weights" description="Regular for reading, medium for labels and emphasis, semibold for titles.">
        <QUI.Box paddingY="4">
          <QUI.Inline gap="8">
            {weights.map((w) => (
              <QUI.Stack key={w} gap="0.5">
                <QUI.Text size="md" weight={w} color="primary">{w[0]!.toUpperCase() + w.slice(1)}</QUI.Text>
                <QUI.Text size="xs" color="tertiary">{`weight="${w}"`}</QUI.Text>
              </QUI.Stack>
            ))}
          </QUI.Inline>
        </QUI.Box>
      </Section>

      <Section title="Colours" description="Primary for main text, secondary for supporting text, tertiary for metadata.">
        <QUI.Box paddingY="4">
          <QUI.Inline gap="6">
            {colors.map((c) => (
              <QUI.Stack key={c} gap="0.5">
                <QUI.Text color={c}>{c}</QUI.Text>
                <QUI.Text size="xs" color="tertiary">{`color="${c}"`}</QUI.Text>
              </QUI.Stack>
            ))}
          </QUI.Inline>
        </QUI.Box>
      </Section>
    </QUI.Stack>
  );
}
