import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";

/**
 * An AI assistant chat in the Acme shell, showing what a production chat needs:
 * - a conversation history (sidebar) and a new-chat empty state with suggested prompts instead of a blank box;
 * - visible progress — reasoning / tool steps that can be expanded, then a streamed answer with a Stop button;
 * - rich answers: text, charts and a table, with the sources they came from;
 * - per-answer actions: copy, good / bad feedback, regenerate; per-question: edit and copy;
 * - a composer that grows with the text, Enter to send and Shift+Enter for a new line, attachments, a model
 *   picker, and a short "can make mistakes" note;
 * - a status line announced politely to screen readers ("Generating…", "Response complete") instead of
 *   re-reading every streamed token, and a jump-to-latest button when scrolled up.
 * Built only from qui components — no className or style anywhere in this file.
 */

type Step = { label: string; detail: string; icon: QUI.StatusIconsCellItem["icon"] };
type Block =
  | { kind: "text"; text: string }
  | { kind: "spend-chart" }
  | { kind: "travel-chart" }
  | { kind: "spend-table" }
  | { kind: "sources"; sources: { label: string; icon: QUI.StatusIconsCellItem["icon"] }[] };

type Message =
  | { id: number; role: "user"; text: string; attachments?: string[] }
  | { id: number; role: "assistant"; steps: Step[]; blocks: Block[]; state: "thinking" | "streaming" | "done" | "stopped"; shown: number; seconds: number };

const spendByCategory = [
  { month: "Jul", Travel: 182, Software: 96, Marketing: 140, Meals: 38 },
  { month: "Aug", Travel: 210, Software: 101, Marketing: 122, Meals: 41 },
  { month: "Sep", Travel: 264, Software: 104, Marketing: 118, Meals: 47 },
];

const spendRows = [
  { category: "Travel", q2: 498, q3: 656, cards: 14, owner: "Saif Kapadia" },
  { category: "Marketing", q2: 412, q3: 380, cards: 6, owner: "Candice Smith" },
  { category: "Software", q2: 271, q3: 301, cards: 22, owner: "Aisha Khan" },
  { category: "Meals", q2: 118, q3: 126, cards: 31, owner: "Sohrab Khan" },
];

const travelDaily = Array.from({ length: 30 }, (_, i) => ({ day: String(i + 1), Travel: Math.round(6 + ((i * 37) % 11) + i / 3), Budget: 9 }));

const steps: Step[] = [
  { label: "Read your question", detail: "Card spend, this quarter vs last, by category", icon: Icons.MessageSquareText },
  { label: "Queried card ledger", detail: "4,812 transactions · 1 Apr – 30 Sep 2026", icon: Icons.Database },
  { label: "Checked Q3 budget.xlsx", detail: "Category budgets and owners", icon: Icons.FileSpreadsheet },
  { label: "Built a chart and a table", detail: "Monthly spend by category", icon: Icons.ChartColumn },
];

const firstAnswer: Block[] = [
  {
    kind: "text",
    text: "Card spend was AED 1.46M in Q3, up 13% on Q2. Almost all of the growth came from Travel, which rose 32% as the sales team ramped up client visits in September. Marketing fell 8% after the summer campaign ended.",
  },
  { kind: "spend-chart" },
  { kind: "text", text: "By category, quarter on quarter (AED thousands):" },
  { kind: "spend-table" },
  { kind: "text", text: "Travel is now 11% over its Q3 budget. Want me to break it down by traveller, or set an alert when a category passes its budget?" },
  {
    kind: "sources",
    sources: [
      { label: "Card ledger · Q2–Q3", icon: Icons.Database },
      { label: "Q3 budget.xlsx", icon: Icons.FileSpreadsheet },
    ],
  },
];

const travelAnswer: Block[] = [
  { kind: "text", text: "Here is daily Travel spend for September against the daily budget of AED 9K. Spend crossed the budget line on 17 of 30 days, with the biggest jump in the last week — mostly flights to Riyadh for the Q4 kick-off." },
  { kind: "travel-chart" },
  { kind: "sources", sources: [{ label: "Card ledger · September", icon: Icons.Database }] },
];

const genericAnswer: Block[] = [
  {
    kind: "text",
    text: "I looked at the card ledger for the last 90 days. Spend is steady overall, with Travel the only category trending above budget. I can chart any category, compare teams, or list the largest transactions — just ask.",
  },
  { kind: "sources", sources: [{ label: "Card ledger · last 90 days", icon: Icons.Database }] },
];

const conversation: Message[] = [
  { id: 1, role: "user", text: "How did card spend change this quarter? Break it down by category.", attachments: ["Q3 budget.xlsx"] },
  { id: 2, role: "assistant", steps, blocks: firstAnswer, state: "done", shown: Infinity, seconds: 6 },
  { id: 3, role: "user", text: "Show me the daily trend for Travel in September." },
  { id: 4, role: "assistant", steps: steps.slice(0, 2), blocks: travelAnswer, state: "done", shown: Infinity, seconds: 3 },
];

const history = [
  { group: "Today", items: ["Q3 card spend by category", "Travel policy exceptions"] },
  { group: "Yesterday", items: ["Dormant accounts to close", "Approval backlog summary"] },
  { group: "Previous 7 days", items: ["Virtual IBAN reconciliation", "Top merchants in September", "Card limits for new hires"] },
];

const suggestions = [
  { icon: Icons.ChartColumn, title: "Chart my spend", prompt: "Chart card spend by category for the last 3 months." },
  { icon: Icons.TriangleAlert, title: "Find anomalies", prompt: "Which transactions this week look unusual?" },
  { icon: Icons.ListChecks, title: "Summarise approvals", prompt: "Summarise the pending approval requests by type." },
  { icon: Icons.FileText, title: "Draft a report", prompt: "Draft a one-page Q3 spend report for the finance team." },
];

const models = [
  { value: "fast", label: "Acme AI Fast", description: "Quick answers" },
  { value: "balanced", label: "Acme AI", description: "Best for most questions" },
  { value: "research", label: "Acme AI Research", description: "Slower, reads more sources" },
];

/** The text of a set of blocks, for copying and for streaming word by word. */
const blockWords = (blocks: Block[]) => blocks.filter((b): b is Extract<Block, { kind: "text" }> => b.kind === "text").map((b) => b.text.split(" ").length);
const textOf = (blocks: Block[]) => blocks.flatMap((b) => (b.kind === "text" ? [b.text] : [])).join("\n\n");

function SpendChart() {
  return (
    <QUI.BarChart
      aria-label="Card spend by category, July to September, AED thousands"
      height={220}
      categoryKey="month"
      stacked
      series={[
        { key: "Travel", label: "Travel" },
        { key: "Marketing", label: "Marketing" },
        { key: "Software", label: "Software" },
        { key: "Meals", label: "Meals" },
      ]}
      data={spendByCategory}
      valueFormatter={(v) => `${v}K`}
    />
  );
}

function TravelChart() {
  return (
    <QUI.LineChart
      aria-label="Daily travel spend in September against the daily budget, AED thousands"
      height={200}
      categoryKey="day"
      series={[
        { key: "Travel", label: "Travel spend" },
        { key: "Budget", label: "Daily budget" },
      ]}
      data={travelDaily}
      valueFormatter={(v) => `${v}K`}
    />
  );
}

function SpendTable() {
  return (
    <QUI.Table aria-label="Spend by category, Q2 vs Q3" density="compact" stickyHeader={false}>
      <QUI.TableHeader>
        <QUI.TableRow>
          <QUI.TableHead>Category</QUI.TableHead>
          <QUI.TableHead align="end">Q2</QUI.TableHead>
          <QUI.TableHead align="end">Q3</QUI.TableHead>
          <QUI.TableHead align="end">Change</QUI.TableHead>
          <QUI.TableHead align="end">Cards</QUI.TableHead>
          <QUI.TableHead>Budget owner</QUI.TableHead>
        </QUI.TableRow>
      </QUI.TableHeader>
      <QUI.TableBody>
        {spendRows.map((row) => (
          <QUI.TableRow key={row.category}>
            <QUI.TableCell>{row.category}</QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.NumberCell value={row.q2} format="integer" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.NumberCell value={row.q3} format="integer" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.ChangeCell value={Math.round(((row.q3 - row.q2) / row.q2) * 1000) / 10} good="down" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.NumberCell value={row.cards} format="integer" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.UserCell name={row.owner} />
            </QUI.TableCell>
          </QUI.TableRow>
        ))}
      </QUI.TableBody>
    </QUI.Table>
  );
}

/** Reasoning and tool steps, collapsed to one line ("Thought for 6s · 4 steps") once the answer starts. */
function Steps({ steps, thinking, seconds }: { steps: Step[]; thinking: boolean; seconds: number }) {
  const [open, setOpen] = React.useState(thinking);
  // Open while working so progress is visible; fold away once the answer starts.
  React.useEffect(() => setOpen(thinking), [thinking]);
  return (
    <QUI.Collapsible
      icon={<QUI.Icon icon={thinking ? Icons.LoaderCircle : Icons.Sparkles} />}
      trigger={thinking ? "Thinking…" : `Thought for ${seconds}s · ${steps.length} steps`}
      open={open}
      onOpenChange={setOpen}
    >
      <QUI.Stack as="ol" gap="2">
        {steps.map((step) => (
          <QUI.Inline as="li" key={step.label} gap="2" wrap={false} align="start">
            <QUI.Icon icon={step.icon ?? Icons.Circle} tint="secondary" />
            <QUI.Stack gap="0">
              <QUI.Text size="xs" weight="medium" color="primary">
                {step.label}
              </QUI.Text>
              <QUI.Text variant="caption" size="md" color="tertiary">
                {step.detail}
              </QUI.Text>
            </QUI.Stack>
          </QUI.Inline>
        ))}
      </QUI.Stack>
    </QUI.Collapsible>
  );
}

/** A copy button that confirms with a check for a moment. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <QUI.Tooltip label={copied ? "Copied" : label}>
      <QUI.IconButton
        variant="ghost"
        size="sm"
        aria-label={label}
        icon={<QUI.Icon icon={copied ? Icons.Check : Icons.Copy} />}
        onClick={() => {
          void navigator.clipboard?.writeText(text).catch(() => {});
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      />
    </QUI.Tooltip>
  );
}

function AnswerActions({ text, onRegenerate }: { text: string; onRegenerate: () => void }) {
  const [feedback, setFeedback] = React.useState<"good" | "bad" | null>(null);
  return (
    <QUI.Inline gap="0.5" wrap={false}>
      <CopyButton text={text} label="Copy answer" />
      <QUI.Tooltip label="Good answer">
        <QUI.IconToggle
          variant="ghost"
          size="sm"
          aria-label="Good answer"
          pressed={feedback === "good"}
          onPressedChange={(on) => setFeedback(on ? "good" : null)}
          icon={<QUI.Icon icon={Icons.ThumbsUp} />}
        />
      </QUI.Tooltip>
      <QUI.Tooltip label="Bad answer">
        <QUI.IconToggle
          variant="ghost"
          size="sm"
          aria-label="Bad answer"
          pressed={feedback === "bad"}
          onPressedChange={(on) => setFeedback(on ? "bad" : null)}
          icon={<QUI.Icon icon={Icons.ThumbsDown} />}
        />
      </QUI.Tooltip>
      <QUI.Tooltip label="Regenerate">
        <QUI.IconButton variant="ghost" size="sm" aria-label="Regenerate answer" icon={<QUI.Icon icon={Icons.RefreshCw} />} onClick={onRegenerate} />
      </QUI.Tooltip>
      {feedback === "bad" ? (
        <QUI.Text variant="caption" size="md" color="tertiary">
          Thanks — this helps us improve.
        </QUI.Text>
      ) : null}
    </QUI.Inline>
  );
}

function UserMessage({ message, onEdit }: { message: Extract<Message, { role: "user" }>; onEdit: (text: string) => void }) {
  return (
    <QUI.Stack gap="1" align="end">
      {message.attachments?.map((file) => (
        <QUI.Badge key={file} startIcon={<QUI.Icon icon={Icons.FileSpreadsheet} />} label={file} />
      ))}
      <QUI.Box background="layer-3" radius="xl" paddingX="4" paddingY="2" maxWidth="md">
        <QUI.Text as="p" size="sm" color="primary">
          {message.text}
        </QUI.Text>
      </QUI.Box>
      <QUI.Inline gap="0.5" wrap={false}>
        <QUI.Tooltip label="Edit">
          <QUI.IconButton variant="ghost" size="sm" aria-label="Edit question" icon={<QUI.Icon icon={Icons.Pencil} />} onClick={() => onEdit(message.text)} />
        </QUI.Tooltip>
        <CopyButton text={message.text} label="Copy question" />
      </QUI.Inline>
    </QUI.Stack>
  );
}

function AssistantMessage({ message, onRegenerate }: { message: Extract<Message, { role: "assistant" }>; onRegenerate: () => void }) {
  // While streaming, `shown` counts words revealed so far across the text blocks; rich blocks appear once the
  // text before them has finished.
  let budget = message.shown;
  const counts = blockWords(message.blocks);
  let textIndex = 0;
  const visible: React.ReactNode[] = [];
  for (const [i, block] of message.blocks.entries()) {
    if (budget <= 0 && message.state !== "done") break;
    if (block.kind === "text") {
      const words = block.text.split(" ");
      const take = Math.min(words.length, budget);
      budget -= counts[textIndex++]!;
      visible.push(
        <QUI.Text as="p" key={i} size="sm" color="primary">
          {words.slice(0, take).join(" ")}
          {take < words.length && message.state === "streaming" ? " ▍" : ""}
        </QUI.Text>
      );
    } else if (message.state === "done" || budget > 0) {
      visible.push(
        block.kind === "spend-chart" ? (
          <SpendChart key={i} />
        ) : block.kind === "travel-chart" ? (
          <TravelChart key={i} />
        ) : block.kind === "spend-table" ? (
          <SpendTable key={i} />
        ) : message.state === "done" ? (
          <QUI.Inline key={i} gap="1">
            <QUI.Text variant="caption" size="md" color="tertiary">
              Sources
            </QUI.Text>
            {block.sources.map((source) => (
              <QUI.Pill key={source.label} size="sm" variant="soft" startIcon={<QUI.Icon icon={source.icon ?? Icons.Link} />} label={source.label} />
            ))}
          </QUI.Inline>
        ) : null
      );
    }
  }
  return (
    <QUI.Inline gap="3" wrap={false} align="start">
      <QUI.WorkspaceAvatar size="md" alt="Acme AI" />
      <QUI.Stack gap="3" grow>
        <QUI.Box>
          <Steps steps={message.steps} thinking={message.state === "thinking"} seconds={message.seconds} />
        </QUI.Box>
        {visible}
        {message.state === "stopped" ? (
          <QUI.Text variant="caption" size="md" color="tertiary">
            Stopped — the answer above is incomplete.
          </QUI.Text>
        ) : null}
        {message.state === "done" || message.state === "stopped" ? <AnswerActions text={textOf(message.blocks)} onRegenerate={onRegenerate} /> : null}
      </QUI.Stack>
    </QUI.Inline>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <QUI.Stack gap="6" align="center" paddingY="12">
      <QUI.Stack gap="2" align="center">
        <QUI.WorkspaceAvatar size="lg" alt="Acme AI" />
        <QUI.Heading level={2} size={4} weight="semibold">
          What do you want to know?
        </QUI.Heading>
        <QUI.Text size="sm" color="tertiary" align="center">
          Ask about accounts, cards, spend or approvals. Answers come from your Acme data and show their sources.
        </QUI.Text>
      </QUI.Stack>
      <QUI.Grid columns={2} collapseBelow="sm" gap="2">
        {suggestions.map((s) => (
          <QUI.Button key={s.title} variant="secondary" size="lg" stretch="full" icon={<QUI.Icon icon={s.icon} />} label={s.title} onClick={() => onPick(s.prompt)} />
        ))}
      </QUI.Grid>
    </QUI.Stack>
  );
}

function HistoryNavigation({ current, onNew, onOpen }: { current: string | null; onNew: () => void; onOpen: (title: string) => void }) {
  return (
    <>
      <QUI.Box paddingX="2" paddingBottom="2">
        <QUI.Button variant="secondary" stretch="full" icon={<QUI.Icon icon={Icons.SquarePen} />} label="New chat" onClick={onNew} />
      </QUI.Box>
      {history.map((group) => (
        <QUI.ListSection key={group.group} label={group.group} defaultOpen>
          <QUI.List aria-label={group.group}>
            {group.items.map((title) => (
              <QUI.ListItem key={title}>
                <QUI.ListItemButton
                  aria-current={title === current ? "page" : undefined}
                  startIcon={<QUI.Icon icon={Icons.MessageSquare} />}
                  label={title}
                  onClick={() => onOpen(title)}
                />
              </QUI.ListItem>
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
    </>
  );
}

function ChatHeader({ title, model, onModel }: { title: string; model: string; onModel: (value: string) => void }) {
  const current = models.find((m) => m.value === model)!;
  return (
    <QUI.Inline as="header" justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          {title}
        </QUI.Heading>
        <QUI.Menu>
          <QUI.MenuTrigger render={<QUI.Pill variant="ghost" label={current.label} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} />} />
          <QUI.MenuContent align="start">
            <QUI.MenuGroup>
              <QUI.MenuGroupLabel>Model</QUI.MenuGroupLabel>
              {models.map((m) => (
                <QUI.MenuItem key={m.value} selected={m.value === model} trailing={m.description} onClick={() => onModel(m.value)}>
                  {m.label}
                </QUI.MenuItem>
              ))}
            </QUI.MenuGroup>
          </QUI.MenuContent>
        </QUI.Menu>
      </QUI.Inline>
      <QUI.Inline gap="1" wrap={false}>
        <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.Share} />} label="Share" />
        <QUI.Menu>
          <QUI.MenuTrigger render={<QUI.IconButton variant="ghost" aria-label="Chat actions" icon={<QUI.Icon icon={Icons.Ellipsis} />} />} />
          <QUI.MenuContent align="end">
            <QUI.MenuItem icon={<QUI.Icon icon={Icons.Pencil} />}>Rename</QUI.MenuItem>
            <QUI.MenuItem icon={<QUI.Icon icon={Icons.Download} />}>Export as PDF</QUI.MenuItem>
            <QUI.MenuSeparator />
            <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Trash2} />}>
              Delete chat
            </QUI.MenuItem>
          </QUI.MenuContent>
        </QUI.Menu>
      </QUI.Inline>
    </QUI.Inline>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  attachments,
  onAttach,
  onRemoveAttachment,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  attachments: string[];
  onAttach: () => void;
  onRemoveAttachment: (file: string) => void;
  inputRef: React.Ref<HTMLTextAreaElement>;
}) {
  return (
    <QUI.Stack gap="2">
      {attachments.length > 0 ? (
        <QUI.Inline gap="1">
          {attachments.map((file) => (
            <QUI.Pill
              key={file}
              size="sm"
              startIcon={<QUI.Icon icon={Icons.FileSpreadsheet} />}
              endIcon={<QUI.Icon icon={Icons.X} />}
              label={file}
              aria-label={`Remove ${file}`}
              onClick={() => onRemoveAttachment(file)}
            />
          ))}
        </QUI.Inline>
      ) : null}
      <QUI.TextArea
        ref={inputRef}
        aria-label="Message Acme AI"
        placeholder="Ask about accounts, cards, spend or approvals…"
        size="lg"
        autoResize
        maxRows={8}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter adds a line; ignore Enter while an IME is composing.
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (!busy) onSend();
          }
        }}
        footer={
          <>
            <QUI.Tooltip label="Attach a file">
              <QUI.IconButton variant="ghost" size="sm" aria-label="Attach a file" icon={<QUI.Icon icon={Icons.Paperclip} />} onClick={onAttach} />
            </QUI.Tooltip>
            <QUI.Pill size="sm" variant="ghost" startIcon={<QUI.Icon icon={Icons.Globe} />} label="Web search" />
            <QUI.Box grow />
            {busy ? (
              <QUI.Tooltip label="Stop generating">
                <QUI.IconButton variant="secondary" size="sm" aria-label="Stop generating" icon={<QUI.Icon icon={Icons.Square} />} onClick={onStop} />
              </QUI.Tooltip>
            ) : (
              <QUI.Tooltip label="Send">
                <QUI.IconButton variant="primary" size="sm" aria-label="Send message" disabled={!value.trim()} icon={<QUI.Icon icon={Icons.ArrowUp} />} onClick={onSend} />
              </QUI.Tooltip>
            )}
          </>
        }
      />
      <QUI.Inline justify="between" gap="2">
        <QUI.Text variant="caption" size="md" color="tertiary">
          Acme AI can make mistakes. Check important figures against the source.
        </QUI.Text>
        <QUI.Inline gap="1" wrap={false} hideBelow="sm">
          <QUI.Shortcut keys="↵" />
          <QUI.Text variant="caption" size="md" color="tertiary">
            send
          </QUI.Text>
          <QUI.Shortcut keys="⇧↵" />
          <QUI.Text variant="caption" size="md" color="tertiary">
            new line
          </QUI.Text>
        </QUI.Inline>
      </QUI.Inline>
    </QUI.Stack>
  );
}

/** Picks a canned answer for a question, so the demo responds to what was asked. */
function answerFor(question: string): { blocks: Block[]; steps: Step[] } {
  const q = question.toLowerCase();
  if (q.includes("travel") || q.includes("trend")) return { blocks: travelAnswer, steps: steps.slice(0, 2) };
  if (q.includes("category") || q.includes("chart") || q.includes("spend")) return { blocks: firstAnswer, steps };
  return { blocks: genericAnswer, steps: steps.slice(0, 2) };
}

/** Playground page: an AI chat with history, streaming answers, charts, a table and sources. */
export function AiChatPage() {
  const [messages, setMessages] = React.useState<Message[]>(conversation);
  const [title, setTitle] = React.useState<string | null>("Q3 card spend by category");
  const [draft, setDraft] = React.useState("");
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const [model, setModel] = React.useState("balanced");
  const [atBottom, setAtBottom] = React.useState(true);
  const scrollRef = React.useRef<HTMLElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const timer = React.useRef<number | undefined>(undefined);

  const last = messages[messages.length - 1];
  const busy = last?.role === "assistant" && (last.state === "thinking" || last.state === "streaming");
  const status = busy ? (last.state === "thinking" ? "Thinking…" : "Generating a response…") : last?.role === "assistant" && last.state === "stopped" ? "Stopped" : "";

  const scrollToBottom = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });

  // Follow the answer as it streams, unless the reader has scrolled up to read something else.
  React.useEffect(() => {
    if (atBottom) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, atBottom]);
  React.useEffect(() => () => window.clearInterval(timer.current), []);

  const updateLast = (fn: (m: Extract<Message, { role: "assistant" }>) => Message) =>
    setMessages((prev) => {
      const end = prev[prev.length - 1];
      return end?.role === "assistant" ? [...prev.slice(0, -1), fn(end)] : prev;
    });

  /** Thinks for a moment, then reveals the answer a few words at a time. */
  const respond = (question: string) => {
    const { blocks, steps } = answerFor(question);
    const total = blockWords(blocks).reduce((a, b) => a + b, 0);
    window.clearInterval(timer.current);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", steps, blocks, state: "thinking", shown: 0, seconds: 2 }]);
    timer.current = window.setTimeout(() => {
      updateLast((m) => ({ ...m, state: "streaming" }));
      timer.current = window.setInterval(() => {
        updateLast((m) => {
          if (m.state !== "streaming") return m;
          const shown = m.shown + 3;
          if (shown >= total) {
            window.clearInterval(timer.current);
            return { ...m, shown: Infinity, state: "done" };
          }
          return { ...m, shown };
        });
      }, 60);
    }, 1400);
  };

  const send = (text = draft) => {
    const question = text.trim();
    if (!question || busy) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: question, attachments: attachments.length ? attachments : undefined }]);
    if (!title) setTitle(question.length > 40 ? `${question.slice(0, 40)}…` : question);
    setDraft("");
    setAttachments([]);
    setAtBottom(true);
    respond(question);
  };

  const stop = () => {
    window.clearInterval(timer.current);
    window.clearTimeout(timer.current);
    updateLast((m) => (m.state === "done" ? m : { ...m, state: "stopped" }));
  };

  const regenerate = (index: number) => {
    const question = messages[index - 1];
    if (busy || question?.role !== "user") return;
    setMessages((prev) => prev.slice(0, index));
    respond(question.text);
  };

  const newChat = () => {
    stop();
    setMessages([]);
    setTitle(null);
    inputRef.current?.focus();
  };

  return (
    <AcmeShell
      current="AI chat"
      header={<ChatHeader title={title ?? "New chat"} model={model} onModel={setModel} />}
      navigation={
        <HistoryNavigation
          current={title}
          onNew={newChat}
          onOpen={(t) => {
            stop();
            setMessages(conversation);
            setTitle(t);
          }}
        />
      }
    >
      <QUI.Box
        ref={scrollRef}
        grow
        overflow="auto"
        paddingX="4"
        onScroll={(event) => {
          const el = event.currentTarget;
          setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
        }}
      >
        <QUI.Stack align="center">
          <QUI.Box width="full" maxWidth="2xl" paddingY="6">
            {messages.length === 0 ? (
              <EmptyState onPick={(prompt) => send(prompt)} />
            ) : (
              <QUI.Stack as="ol" gap="8" aria-label="Conversation">
                {messages.map((message, index) => (
                  <QUI.Box as="li" key={message.id}>
                    {message.role === "user" ? (
                      <UserMessage
                        message={message}
                        onEdit={(text) => {
                          setDraft(text);
                          inputRef.current?.focus();
                        }}
                      />
                    ) : (
                      <AssistantMessage message={message} onRegenerate={() => regenerate(index)} />
                    )}
                  </QUI.Box>
                ))}
              </QUI.Stack>
            )}
          </QUI.Box>
        </QUI.Stack>
      </QUI.Box>
      <QUI.Stack align="center" paddingX="4" paddingBottom="4">
        <QUI.Box width="full" maxWidth="2xl">
          <QUI.Stack gap="2">
            <QUI.Inline justify="between" gap="2">
              {/* Announced politely once per state change, never per streamed token. */}
              <QUI.Text role="status" aria-live="polite" variant="caption" size="md" color="tertiary">
                {status}
              </QUI.Text>
              {!atBottom ? <QUI.Button size="sm" variant="secondary" icon={<QUI.Icon icon={Icons.ArrowDown} />} label="Jump to latest" onClick={scrollToBottom} /> : null}
            </QUI.Inline>
            <Composer
              value={draft}
              onChange={setDraft}
              onSend={() => send()}
              onStop={stop}
              busy={busy}
              attachments={attachments}
              onAttach={() => setAttachments((a) => (a.includes("September statement.pdf") ? a : [...a, "September statement.pdf"]))}
              onRemoveAttachment={(file) => setAttachments((a) => a.filter((f) => f !== file))}
              inputRef={inputRef}
            />
          </QUI.Stack>
        </QUI.Box>
      </QUI.Stack>
    </AcmeShell>
  );
}
