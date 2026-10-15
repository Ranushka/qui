import * as React from "react";
import { Ellipsis, Link } from "lucide-react";
import type { NoClass } from "../lib/no-class";
import { Box } from "../atoms/Box";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Tab, Tabs, TabsList } from "../molecules/Tabs";

export interface ProjectHeaderTab {
  value: string;
  label: string;
}

export interface ProjectHeaderProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"header">, "title">> {
  /** Icon in front of the project name. */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  /** The project's views, shown as underline tabs. */
  tabs: ProjectHeaderTab[];
  /** Value of the selected tab. */
  value: string;
}

/** Header of a project page: icon and name, the project's tabs, and link / actions buttons. Tabs and buttons collapse on narrow screens. */
export function ProjectHeader({ icon, title, tabs, value, ...props }: ProjectHeaderProps) {
  return (
    <Box as="header" border="subtle" borderEdge="bottom" paddingX="4" paddingY="2" {...props}>
      <Inline justify="between" align="start" wrap={false} gap="4">
        <Inline grow gap="6" wrap={false} stackBelow="md">
          <Inline gap="2" wrap={false} shrink={false}>
            <Icon icon={icon} size="lg" />
            <Heading level={1} size={5}>{title}</Heading>
          </Inline>
          <Box overflow="auto">
            <Tabs variant="underline" defaultValue={value}>
              <TabsList>
                {tabs.map((tab) => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} />
                ))}
              </TabsList>
            </Tabs>
          </Box>
          <Box hideBelow="md" shrink={false}>
            <IconButton variant="ghost" size="sm" aria-label="More tabs" icon={<Icon icon={Ellipsis} />} />
          </Box>
        </Inline>
        <Inline gap="2" wrap={false} shrink={false}>
          <Box hideBelow="sm">
            <IconButton variant="ghost" aria-label="Copy link" icon={<Icon icon={Link} />} />
          </Box>
          <IconButton variant="ghost" aria-label="Project actions" icon={<Icon icon={Ellipsis} />} />
        </Inline>
      </Inline>
    </Box>
  );
}

/* __DOC_BLOCK
<QUI.ProjectHeader
  icon={Icons.Tractor}
  title="Core product"
  value="work-items"
  tabs={[
    { value: "overview", label: "Overview" },
    { value: "work-items", label: "Work items" },
    { value: "cycles", label: "Cycles" },
  ]}
/>
DOC__ */
