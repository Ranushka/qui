import * as React from "react";
import { FileImage, FileText, Upload } from "lucide-react";
import type { NoClass } from "../lib/no-class";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Inline } from "../atoms/Inline";
import { Stack } from "../atoms/Stack";
import { Text } from "../atoms/Text";

export interface ReceiptFile {
  /** File name, e.g. "emirates-ek815.pdf". */
  name: string;
  /** `image` for photos and scans, `pdf` for documents; picks the glyph. @default "pdf" */
  kind?: "image" | "pdf";
  /** A short size or date line under the name, e.g. "212 KB · matched 2 Oct". */
  detail?: string;
}

export interface ReceiptPreviewProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "children">> {
  /** The attached receipt. Leave unset to show the empty "no receipt" state. */
  file?: ReceiptFile | null;
  /** Opens the receipt. Shows a "View" button when set. */
  onView?: () => void;
  /** Swaps the receipt for another file. Shows "Replace" when set. */
  onReplace?: () => void;
  /** Empty state: adds a receipt. Shows "Upload receipt" when set. */
  onUpload?: () => void;
  /** Empty state: asks the cardholder for it. Shows "Request" when set. */
  onRequest?: () => void;
  /** Empty-state message, e.g. "Required for spend over AED 75". @default "No receipt yet" */
  emptyLabel?: string;
}

/**
 * A transaction's receipt in a details panel: the attached file (glyph, name, detail line, View / Replace), or a
 * dashed empty state with Upload / Request actions.
 */
export function ReceiptPreview({ file, onView, onReplace, onUpload, onRequest, emptyLabel = "No receipt yet", ...props }: ReceiptPreviewProps) {
  if (!file) {
    return (
      <Box border="strong" dashed radius="lg" padding="4" {...props}>
        <Stack gap="3" align="center">
          <Icon icon={Upload} size="lg" tint="tertiary" />
          <Text size="sm" weight="medium" color="secondary" align="center">
            {emptyLabel}
          </Text>
          {onUpload || onRequest ? (
            <Inline gap="2" justify="center">
              {onUpload ? <Button variant="secondary" size="sm" icon={<Icon icon={Upload} />} label="Upload receipt" onClick={onUpload} /> : null}
              {onRequest ? <Button variant="ghost" size="sm" label="Request" onClick={onRequest} /> : null}
            </Inline>
          ) : null}
        </Stack>
      </Box>
    );
  }
  return (
    <Box border="subtle" radius="lg" padding="3" background="layer-1" {...props}>
      <Inline gap="3" wrap={false}>
        <Box background="surface-1" border="subtle" radius="md" padding="3" shrink={false}>
          <Icon icon={file.kind === "image" ? FileImage : FileText} size="lg" tint="secondary" />
        </Box>
        <Stack gap="0.5" grow>
          <Text size="sm" weight="medium" color="primary" maxLines={1}>
            {file.name}
          </Text>
          {file.detail ? (
            <Text variant="caption" size="md" color="tertiary">
              {file.detail}
            </Text>
          ) : null}
        </Stack>
        <Inline gap="1" wrap={false}>
          {onView ? <Button variant="secondary" size="sm" label="View" onClick={onView} /> : null}
          {onReplace ? <Button variant="ghost" size="sm" label="Replace" onClick={onReplace} /> : null}
        </Inline>
      </Inline>
    </Box>
  );
}

/* __DOC_BLOCK
<div className="flex w-96 flex-col gap-4 p-4">
  <QUI.ReceiptPreview file={{ name: "emirates-ek815.pdf", detail: "212 KB · matched 2 Oct" }} onView={() => {}} onReplace={() => {}} />
  <QUI.ReceiptPreview emptyLabel="Required for spend over AED 75" onUpload={() => {}} onRequest={() => {}} />
</div>
DOC__ */
