import type * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "./data";
import { AcmeShell } from "./shell";

const placeholderColumns = ["Name", "Status", "Owner", "Created", "Updated"];

/**
 * A screen for a sidebar entry that has no sample data yet: its header, a toolbar and an empty table. `navigation`
 * is the sidebar it was opened from (the Work lists when unset).
 */
export function PlaceholderPage({ icon, label, navigation }: { icon: IconComponent; label: string; navigation?: React.ReactNode }) {
  return (
    <AcmeShell
      current={label}
      navigation={navigation}
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={icon} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold" truncate>
              {label}
            </QUI.Heading>
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="Create" />
        </QUI.Inline>
      }
    >
      <QUI.Inline gap="2" paddingX="4" paddingBottom="3">
        <QUI.Box width="2xs">
          <QUI.Input aria-label={`Search ${label.toLowerCase()}`} placeholder="Search…" startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.ListFilter} />} label="Filters" />
      </QUI.Inline>
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label={label}>
          <QUI.TableHeader>
            <QUI.TableRow>
              {placeholderColumns.map((column) => (
                <QUI.TableHead key={column}>{column}</QUI.TableHead>
              ))}
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            <QUI.TableRow>
              <QUI.TableCell colSpan={placeholderColumns.length} align="center">
                <QUI.Stack gap="2" align="center" paddingY="8">
                  <QUI.Icon icon={icon} size="lg" tint="placeholder" />
                  <QUI.Text weight="medium" color="primary">
                    No {label.toLowerCase()} yet
                  </QUI.Text>
                  <QUI.Text size="xs" color="tertiary">
                    Records you create show up here.
                  </QUI.Text>
                </QUI.Stack>
              </QUI.TableCell>
            </QUI.TableRow>
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
    </AcmeShell>
  );
}
