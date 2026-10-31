import * as React from "react";
import { Plus, X } from "../icons";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Input } from "../atoms/Input";
import { TextButton } from "../atoms/TextButton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./Select";

export type RuleFieldType = "number" | "text" | "select";

export interface RuleField {
  /** Key read from the record, e.g. "amount". */
  value: string;
  label: string;
  /** Decides the operators offered and the value control: a number box, a text box or a list. */
  type: RuleFieldType;
  /** For `select` fields: the values to pick from. */
  options?: readonly { value: string; label: string }[];
  /** Shown inside the value box, e.g. "AED". */
  unit?: string;
}

export type RuleOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "neq" | "contains";

export interface RuleCondition {
  /** Stable key for the row. */
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
}

export type RuleMatch = "all" | "any";

export const ruleOperators: Record<RuleFieldType, readonly { value: RuleOperator; label: string }[]> = {
  number: [
    { value: "gt", label: "is more than" },
    { value: "gte", label: "is at least" },
    { value: "lt", label: "is less than" },
    { value: "lte", label: "is at most" },
    { value: "eq", label: "equals" },
  ],
  text: [
    { value: "contains", label: "contains" },
    { value: "eq", label: "is" },
    { value: "neq", label: "is not" },
  ],
  select: [
    { value: "eq", label: "is" },
    { value: "neq", label: "is not" },
  ],
};

function testCondition(condition: RuleCondition, field: RuleField | undefined, record: Record<string, unknown>) {
  if (!field || condition.value.trim() === "") return false;
  const actual = record[field.value];
  if (field.type === "number") {
    const a = Number(actual);
    const b = Number(condition.value);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    return { gt: a > b, gte: a >= b, lt: a < b, lte: a <= b, eq: a === b, neq: a !== b, contains: false }[condition.operator];
  }
  const a = String(actual ?? "").toLowerCase();
  const b = condition.value.trim().toLowerCase();
  return condition.operator === "contains" ? a.includes(b) : condition.operator === "neq" ? a !== b : a === b;
}

/**
 * Whether `record` meets the rule — every condition (`all`) or at least one (`any`). Conditions with no value
 * yet are left out; a rule with none left matches nothing, so an unfinished rule never catches everything.
 */
export function matchesRule(record: Record<string, unknown>, conditions: readonly RuleCondition[], match: RuleMatch, fields: readonly RuleField[]) {
  const ready = conditions.filter((c) => c.value.trim() !== "");
  if (ready.length === 0) return false;
  const test = (c: RuleCondition) => testCondition(c, fields.find((f) => f.value === c.field), record);
  return match === "all" ? ready.every(test) : ready.some(test);
}

/** A sentence for a condition, e.g. "Amount is more than AED 5,000". */
export function describeCondition(condition: RuleCondition, fields: readonly RuleField[]) {
  const field = fields.find((f) => f.value === condition.field);
  if (!field) return "";
  const operator = ruleOperators[field.type].find((o) => o.value === condition.operator)?.label ?? condition.operator;
  const value =
    field.type === "select"
      ? (field.options?.find((o) => o.value === condition.value)?.label ?? condition.value)
      : field.type === "number" && condition.value !== "" && !Number.isNaN(Number(condition.value))
        ? `${field.unit ? `${field.unit} ` : ""}${Number(condition.value).toLocaleString("en-US")}`
        : condition.value;
  return `${field.label} ${operator} ${value || "…"}`;
}

let nextId = 0;
const newId = () => `condition-${++nextId}`;

export interface RuleBuilderProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "onChange">> {
  /** The fields a condition can test. */
  fields: readonly RuleField[];
  /** The condition rows (controlled). */
  conditions?: readonly RuleCondition[];
  /** Starting rows when uncontrolled. @default one empty condition on the first field */
  defaultConditions?: readonly RuleCondition[];
  onConditionsChange?: (conditions: RuleCondition[]) => void;
  /** Whether every condition must hold, or any one (controlled). The choice shows once there are two or more conditions. */
  match?: RuleMatch;
  /** @default "all" */
  defaultMatch?: RuleMatch;
  onMatchChange?: (match: RuleMatch) => void;
  /** The outcome, shown under the conditions after a "Then" label, e.g. an approver picker. */
  then?: React.ReactNode;
  disabled?: boolean;
}

const blankCondition = (field: RuleField): RuleCondition => ({ id: newId(), field: field.value, operator: ruleOperators[field.type][0]!.value, value: "" });

/**
 * Builds a "When … then …" rule out of condition rows — field, operator, value — such as "Amount is more than
 * AED 5,000 and Category is Travel". Operators and the value control follow each field's type. Pair it with
 * `matchesRule` to preview which records a rule would catch.
 */
export const RuleBuilder = React.forwardRef<HTMLDivElement, RuleBuilderProps>(
  (
    { fields, conditions: conditionsProp, defaultConditions, onConditionsChange: onConditionsProp, match: matchProp, defaultMatch = "all", onMatchChange: onMatchProp, then, disabled = false, ...props },
    ref
  ) => {
    const [ownConditions, setOwnConditions] = React.useState<readonly RuleCondition[]>(() => defaultConditions ?? [blankCondition(fields[0]!)]);
    const [ownMatch, setOwnMatch] = React.useState<RuleMatch>(defaultMatch);
    const conditions = conditionsProp ?? ownConditions;
    const match = matchProp ?? ownMatch;
    const onConditionsChange = (next: RuleCondition[]) => {
      if (conditionsProp === undefined) setOwnConditions(next);
      onConditionsProp?.(next);
    };
    const onMatchChange = (next: RuleMatch) => {
      if (matchProp === undefined) setOwnMatch(next);
      onMatchProp?.(next);
    };
    const update = (id: string, patch: Partial<RuleCondition>) => onConditionsChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const add = () => onConditionsChange([...conditions, blankCondition(fields[0]!)]);
    const joiner = match === "all" ? "and" : "or";

    return (
      <div ref={ref} className="flex w-full flex-col gap-3" {...props}>
        {conditions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2 text-body-xs-regular text-secondary">
            <span>Match</span>
            <Select
              value={match}
              onValueChange={(value) => onMatchChange(value as RuleMatch)}
              items={[
                { value: "all", label: "all conditions" },
                { value: "any", label: "any condition" },
              ]}
              disabled={disabled}
            >
              <span className="w-44">
                <SelectTrigger aria-label="How conditions combine" />
              </span>
              <SelectContent>
                <SelectItem value="all">all conditions</SelectItem>
                <SelectItem value="any">any condition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <ol className="flex flex-col gap-2">
          {conditions.map((condition, i) => {
            const field = fields.find((f) => f.value === condition.field) ?? fields[0]!;
            const operators = ruleOperators[field.type];
            const n = i + 1;
            return (
              <li key={condition.id} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="w-12 shrink-0 text-body-xs-medium text-secondary">{i === 0 ? "When" : joiner}</span>
                <span className="min-w-40 flex-1">
                  <Select
                    value={field.value}
                    items={fields.map((f) => ({ value: f.value, label: f.label }))}
                    disabled={disabled}
                    onValueChange={(value) => {
                      const next = fields.find((f) => f.value === value)!;
                      update(condition.id, { field: next.value, operator: ruleOperators[next.type][0]!.value, value: "" });
                    }}
                  >
                    <SelectTrigger aria-label={`Condition ${n} field`} />
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </span>
                <span className="min-w-40 flex-1">
                  <Select
                    value={operators.some((o) => o.value === condition.operator) ? condition.operator : operators[0]!.value}
                    items={operators.map((o) => ({ value: o.value, label: o.label }))}
                    disabled={disabled}
                    onValueChange={(value) => update(condition.id, { operator: value as RuleOperator })}
                  >
                    <SelectTrigger aria-label={`Condition ${n} operator`} />
                    <SelectContent>
                      {operators.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </span>
                <span className="min-w-40 flex-1">
                  {field.type === "select" ? (
                    <Select
                      value={condition.value || null}
                      items={(field.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
                      disabled={disabled}
                      onValueChange={(value) => update(condition.id, { value: String(value ?? "") })}
                    >
                      <SelectTrigger aria-label={`Condition ${n} value`} placeholder="Choose…" />
                      <SelectContent>
                        {(field.options ?? []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      aria-label={`Condition ${n} value`}
                      inputMode={field.type === "number" ? "decimal" : undefined}
                      placeholder={field.type === "number" ? "0" : "Type a value"}
                      value={condition.value}
                      disabled={disabled}
                      aria-invalid={field.type === "number" && condition.value !== "" && Number.isNaN(Number(condition.value)) ? true : undefined}
                      onChange={(event) => update(condition.id, { value: event.target.value })}
                      startSlot={field.unit ? <span className="text-body-xs-regular text-tertiary">{field.unit}</span> : undefined}
                    />
                  )}
                </span>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove condition ${n}`}
                  icon={<Icon icon={X} />}
                  disabled={disabled || conditions.length === 1}
                  onClick={() => onConditionsChange(conditions.filter((c) => c.id !== condition.id))}
                />
              </li>
            );
          })}
        </ol>
        <span className={cn("ps-14", disabled && "pointer-events-none")}>
          <TextButton label="Add condition" icon={<Icon icon={Plus} />} onClick={add} disabled={disabled} />
        </span>
        {then != null ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-subtle pt-3 sm:flex-nowrap">
            <span className="w-12 shrink-0 text-body-xs-medium text-secondary">Then</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{then}</div>
          </div>
        ) : null}
      </div>
    );
  }
);
RuleBuilder.displayName = "RuleBuilder";

/* __DOC_BLOCK
<div className="flex max-w-3xl flex-col gap-4 p-4">
  <QUI.RuleBuilder
    fields={[
      { value: "amount", label: "Amount", type: "number", unit: "AED" },
      { value: "category", label: "Category", type: "select", options: [{ value: "Travel", label: "Travel" }, { value: "Meals", label: "Meals" }, { value: "Software", label: "Software" }] },
      { value: "merchant", label: "Merchant", type: "text" },
    ]}
    defaultConditions={[
      { id: "a", field: "amount", operator: "gt", value: "5000" },
      { id: "b", field: "category", operator: "eq", value: "Travel" },
    ]}
    then={<QUI.Text size="xs">Require approval from Finance</QUI.Text>}
  />
</div>
DOC__ */

/* __PROPS
{ "disabled": "boolean" }
PROPS__ */
