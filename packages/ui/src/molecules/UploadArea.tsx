import * as React from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";
import { LinearProgress } from "../atoms/LinearProgress";

export interface UploadAreaFile {
  /** Stable key, e.g. the name plus a timestamp. */
  id: string;
  name: string;
  /** Bytes; shown as "212 KB". */
  size: number;
  /** 0–100 while uploading; leave unset once done. */
  progress?: number;
  /** Shown in place of the size, in the danger tone. */
  error?: string;
}

export interface UploadAreaRejection {
  file: File;
  reason: "type" | "size";
}

export interface UploadAreaProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "onDrop">> {
  /** Called with the files that passed `accept` and `maxSize`. */
  onFiles: (files: File[]) => void;
  /** Called with the files that didn't, if any. The area also shows a message for them. */
  onReject?: (rejections: UploadAreaRejection[]) => void;
  /** File types to allow, as for `<input accept>`, e.g. "image/*,application/pdf". */
  accept?: string;
  /** Largest file allowed, in bytes. */
  maxSize?: number;
  /** Allow choosing or dropping more than one file. @default false */
  multiple?: boolean;
  /** Files already added, listed under the drop zone with their progress or error. */
  files?: readonly UploadAreaFile[];
  /** Removes one listed file; shows a remove button on each when set. */
  onRemove?: (id: string) => void;
  /** Main line in the drop zone. @default "Drop a file here, or choose one" */
  label?: string;
  /** Second line, e.g. "PDF, JPG or PNG up to 10 MB". */
  hint?: string;
  disabled?: boolean;
}

const sizeFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${sizeFormat.format(bytes / 1024)} KB`;
  return `${sizeFormat.format(bytes / 1024 / 1024)} MB`;
}

/** Whether `file` matches an `accept` list of extensions (".pdf"), exact types ("application/pdf") or wildcards ("image/*"). */
function accepts(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .some((rule) => (rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule));
}

/**
 * A drop zone for receipts and attachments: drag files onto it, or click / press Enter to choose. Checks
 * `accept` and `maxSize` itself, says why a file was turned away, and lists added `files` with their upload
 * progress or error. The zone is a real button, so it works from the keyboard and with screen readers.
 */
export const UploadArea = React.forwardRef<HTMLDivElement, UploadAreaProps>(
  ({ onFiles, onReject, accept, maxSize, multiple = false, files, onRemove, label = "Drop a file here, or choose one", hint, disabled = false, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);

    const take = (list: FileList | null) => {
      if (!list || disabled) return;
      const all = multiple ? [...list] : [...list].slice(0, 1);
      const rejected: UploadAreaRejection[] = [];
      const ok = all.filter((file) => {
        if (!accepts(file, accept)) return rejected.push({ file, reason: "type" }), false;
        if (maxSize != null && file.size > maxSize) return rejected.push({ file, reason: "size" }), false;
        return true;
      });
      setMessage(
        rejected.length === 0
          ? null
          : rejected[0]!.reason === "type"
            ? `${rejected[0]!.file.name} isn't a supported file type.`
            : `${rejected[0]!.file.name} is larger than ${formatFileSize(maxSize!)}.`
      );
      if (rejected.length) onReject?.(rejected);
      if (ok.length) onFiles(ok);
    };

    return (
      <div ref={ref} className="flex w-full flex-col gap-2" {...props}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            take(event.dataTransfer.files);
          }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg border-sm border-dashed px-4 py-6 text-center outline-none transition-colors [--node-size:var(--control-glyph-lg)] focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed disabled:opacity-60",
            dragging ? "border-accent-strong bg-accent-subtle" : "border-strong bg-layer-1 hover:bg-layer-1-hover",
            message && !dragging && "border-danger-strong"
          )}
        >
          <Icon icon={Upload} tint={dragging ? "secondary" : "tertiary"} />
          <span className="text-body-sm-medium text-primary">{dragging ? "Drop to add" : label}</span>
          {hint ? <span className="text-caption-md-regular text-tertiary">{hint}</span> : null}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          onChange={(event) => {
            take(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        {message ? (
          <p role="alert" className="text-caption-md-regular text-danger-primary">
            {message}
          </p>
        ) : null}
        {files && files.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-2.5 rounded-md border-sm border-subtle bg-layer-2 px-2.5 py-2 [--node-size:var(--control-glyph-md)]">
                <Icon icon={FileText} tint="secondary" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-body-xs-medium text-primary">{file.name}</span>
                  {file.error ? (
                    <span className="text-caption-md-regular text-danger-primary">{file.error}</span>
                  ) : file.progress != null && file.progress < 100 ? (
                    <LinearProgress value={file.progress} size="sm" aria-label={`Uploading ${file.name}`} showValue={false} />
                  ) : (
                    <span className="text-caption-md-regular text-tertiary">{formatFileSize(file.size)}</span>
                  )}
                </span>
                {onRemove ? <IconButton variant="ghost" size="xs" aria-label={`Remove ${file.name}`} icon={<Icon icon={X} />} onClick={() => onRemove(file.id)} /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }
);
UploadArea.displayName = "UploadArea";

/* __DOC_BLOCK
<div className="flex w-96 flex-col gap-4 p-4">
  <QUI.UploadArea
    accept="image/*,application/pdf"
    maxSize={10 * 1024 * 1024}
    hint="PDF, JPG or PNG up to 10 MB"
    onFiles={() => {}}
    files={[
      { id: "1", name: "emirates-ek815.pdf", size: 217000 },
      { id: "2", name: "hotel-folio.jpg", size: 1840000, progress: 45 },
      { id: "3", name: "scan.heic", size: 3200000, error: "Couldn't read this file. Try a PDF or JPG." },
    ]}
    onRemove={() => {}}
  />
</div>
DOC__ */

/* __PROPS
{ "multiple": "boolean", "disabled": "boolean" }
PROPS__ */
