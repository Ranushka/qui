/** Deterministic sample data for the spend-management screens (overview and transactions). */

export type Person = { name: string; email: string };
export type Receipt = "Attached" | "Missing" | "Not required";
export type Sync = "Synced" | "Ready" | "Failed" | "Excluded";
export type PolicyFlag = "Over limit" | "Weekend spend" | "Blocked category" | null;

export type Transaction = {
  id: number;
  date: string;
  merchant: string;
  category: string;
  department: string;
  cardholder: Person;
  last4: string;
  amount: number;
  receipt: Receipt;
  policy: PolicyFlag;
  sync: Sync;
  memo: string | null;
};

export const people: Person[] = [
  { name: "Saif Kapadia", email: "saif@acme.com" },
  { name: "Candice Smith", email: "candice@acme.com" },
  { name: "Aisha Khan", email: "aisha@acme.com" },
  { name: "Sohrab Khan", email: "sohrab@acme.com" },
  { name: "Mashood Pookkadan", email: "mashood@acme.com" },
  { name: "Ranu Perera", email: "ranu@acme.com" },
];

export const merchants = [
  { merchant: "Emirates", category: "Travel" },
  { merchant: "Marriott Riyadh", category: "Travel" },
  { merchant: "Amazon Web Services", category: "Software" },
  { merchant: "Notion", category: "Software" },
  { merchant: "Google Ads", category: "Marketing" },
  { merchant: "LinkedIn Ads", category: "Marketing" },
  { merchant: "Careem", category: "Transport" },
  { merchant: "Starbucks", category: "Meals" },
  { merchant: "Zuma Dubai", category: "Meals" },
  { merchant: "Office Depot", category: "Office" },
];

/** Indexes into `merchants`, repeated by how often each is used. */
const merchantWeights = [0, 0, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7, 8, 9, 9];

export const departments = ["Sales", "Engineering", "Marketing", "Operations", "Finance"];

export const categoryColor = { Travel: "indigo", Software: "purple", Marketing: "pink", Transport: "orange", Meals: "yellow", Office: "grey" } as const;
export const syncColor = { Synced: "emerald", Ready: "indigo", Failed: "crimson", Excluded: "grey" } as const;

/** Today's date in the samples, so relative dates read the same on every visit. */
export const today = new Date("2026-10-17T12:00:00Z");

/** 320 card transactions, newest first. */
export const transactions: Transaction[] = Array.from({ length: 320 }, (_, i) => {
  const seed = (i * 7919 + 104729) % 100000;
  // Weighted so some merchants are used far more than others, like real card spend.
  const m = merchants[merchantWeights[seed % merchantWeights.length]!]!;
  const amount = m.category === "Travel" ? 800 + (seed % 9000) : m.category === "Meals" ? 25 + (seed % 600) : 60 + (seed % 3500);
  const day = 17 - Math.floor(i / 19);
  const date = new Date(Date.UTC(2026, 9, day, 7 + (i % 13), seed % 60));
  const weekend = date.getUTCDay() === 5 || date.getUTCDay() === 6;
  const receipt: Receipt = amount < 75 ? "Not required" : seed % 7 === 0 || i < 9 ? "Missing" : "Attached";
  const policy: PolicyFlag = amount > 8000 ? "Over limit" : m.category === "Meals" && weekend ? "Weekend spend" : seed % 53 === 0 ? "Blocked category" : null;
  return {
    id: 740210 - i,
    date: date.toISOString(),
    ...m,
    department: m.category === "Marketing" ? "Marketing" : m.category === "Software" && seed % 2 === 0 ? "Engineering" : departments[(seed >> 3) % departments.length]!,
    cardholder: people[(seed >> 2) % people.length]!,
    last4: String(1000 + ((seed * 3) % 9000)),
    amount: Math.round(amount * 100 + (seed % 100)) / 100,
    receipt,
    policy,
    sync: i < 40 ? "Ready" : seed % 29 === 0 ? "Failed" : seed % 31 === 0 ? "Excluded" : "Synced",
    memo: seed % 3 === 0 ? ["Client visit", "Team offsite", "Q4 campaign", "Monthly subscription"][seed % 4]! : null,
  };
});

/** Department budgets for the month (AED). */
export const budgets = [
  { department: "Sales", owner: "Saif Kapadia", budget: 260000 },
  { department: "Engineering", owner: "Aisha Khan", budget: 220000 },
  { department: "Marketing", owner: "Candice Smith", budget: 190000 },
  { department: "Operations", owner: "Sohrab Khan", budget: 140000 },
  { department: "Finance", owner: "Mashood Pookkadan", budget: 90000 },
];

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export type CardStatus = "Active" | "Frozen" | "Cancelled";
export type SpendCard = {
  id: number;
  nickname: string;
  holder: Person;
  last4: string;
  expiry: string;
  form: "virtual" | "physical";
  network: "visa" | "mastercard";
  color: "indigo" | "emerald" | "purple" | "crimson" | "grey";
  status: CardStatus;
  limit: number;
  period: "Monthly" | "Per transaction" | "One-time";
  spent: number;
  department: string;
  categories: string[];
  lastUsed: string;
};

const cardNames = ["AWS billing", "Team travel", "Ads – Google", "Ads – LinkedIn", "Office supplies", "SaaS tools", "Client dinners", "Fuel", "Conference fees", "Hardware"];
const cardColors = ["indigo", "emerald", "purple", "crimson", "grey"] as const;

/** 36 company cards across the team. */
export const cards: SpendCard[] = Array.from({ length: 36 }, (_, i) => {
  const seed = (i * 6151 + 92821) % 100000;
  const limit = [2000, 5000, 10000, 15000, 25000][seed % 5]!;
  const status: CardStatus = i % 11 === 4 ? "Frozen" : i % 17 === 9 ? "Cancelled" : "Active";
  return {
    id: 9100 + i,
    nickname: cardNames[i % cardNames.length]!,
    holder: people[(seed >> 2) % people.length]!,
    last4: String(1000 + ((seed * 7) % 9000)),
    expiry: i % 9 === 2 ? ["11/26", "12/26", "01/27"][i % 3]! : `${String(1 + (seed % 12)).padStart(2, "0")}/${27 + (seed % 3)}`,
    form: seed % 4 === 0 ? "physical" : "virtual",
    network: seed % 3 === 0 ? "mastercard" : "visa",
    color: cardColors[i % cardColors.length]!,
    status,
    limit,
    period: seed % 7 === 0 ? "Per transaction" : seed % 9 === 0 ? "One-time" : "Monthly",
    spent: status === "Cancelled" ? 0 : Math.round(((seed * 13) % 100) / 100 * limit * 1.05),
    department: departments[(seed >> 3) % departments.length]!,
    categories: [...new Set([merchants[seed % merchants.length]!.category, merchants[(seed >> 2) % merchants.length]!.category])],
    lastUsed: new Date(Date.UTC(2026, 9, 17 - (seed % 20), 9 + (seed % 9))).toISOString(),
  };
});

export type ClaimStatus = "Awaiting approval" | "Approved" | "Paid" | "Rejected";
export type Claim = {
  id: number;
  title: string;
  kind: "Expense" | "Mileage";
  employee: Person;
  approver: Person;
  category: string;
  amount: number;
  /** Mileage claims: distance driven. */
  km?: number;
  spentOn: string;
  submittedAt: string;
  status: ClaimStatus;
  receipt: string | null;
  note: string | null;
  rejection?: string;
};

/** AED paid per km for mileage claims. */
export const mileageRate = 0.75;

const claimTitles = [
  { title: "Client lunch, Zuma Dubai", category: "Meals" },
  { title: "Taxi to Abu Dhabi office", category: "Transport" },
  { title: "Mileage: site visit, Jebel Ali", category: "Transport", km: 64 },
  { title: "Printer ink and paper", category: "Office" },
  { title: "Conference parking", category: "Transport" },
  { title: "Team coffee, sprint review", category: "Meals" },
  { title: "Mileage: client meetings, Sharjah", category: "Transport", km: 112 },
  { title: "Figma plugin licence", category: "Software" },
];
const claimStatuses: ClaimStatus[] = ["Awaiting approval", "Awaiting approval", "Approved", "Paid", "Paid", "Paid", "Rejected"];

/** 42 reimbursement claims, newest first. */
export const claims: Claim[] = Array.from({ length: 42 }, (_, i) => {
  const seed = (i * 4421 + 7919) % 100000;
  const t = claimTitles[seed % claimTitles.length]!;
  const status = i < 3 ? "Awaiting approval" : claimStatuses[(seed >> 2) % claimStatuses.length]!;
  const employee = people[(seed >> 3) % people.length]!;
  const spentDay = Math.max(1, 16 - Math.floor(i / 3));
  return {
    id: 3300 - i,
    title: t.title,
    kind: t.km ? "Mileage" : "Expense",
    employee,
    approver: employee.name === "Saif Kapadia" ? people[1]! : people[0]!,
    category: t.category,
    km: t.km,
    amount: t.km ? t.km * mileageRate : Math.round(((seed % 60000) + 2500)) / 100,
    spentOn: new Date(Date.UTC(2026, 9, spentDay)).toISOString(),
    submittedAt: new Date(Date.UTC(2026, 9, Math.min(spentDay + 1, 17), 9 + (seed % 8), seed % 60)).toISOString(),
    status,
    receipt: t.km ? null : `receipt-${3300 - i}.${seed % 2 ? "jpg" : "pdf"}`,
    note: seed % 3 === 0 ? "Paid personally; company card was frozen." : null,
    rejection: status === "Rejected" ? "Receipt doesn't show the VAT number — please upload the tax invoice." : undefined,
  };
});

export type BillStatus = "Draft" | "Awaiting approval" | "Scheduled" | "Paid";
export type Bill = {
  id: number;
  number: string;
  vendor: string;
  category: string;
  amount: number;
  issuedOn: string;
  dueOn: string;
  /** Scheduled and paid bills: the payment date. */
  payOn?: string;
  status: BillStatus;
  owner: Person;
  approver: Person;
  sync: Sync;
  file: string;
};

const vendors = [
  { vendor: "Emaar Properties", category: "Rent", amount: 48500 },
  { vendor: "DEWA", category: "Utilities", amount: 3120 },
  { vendor: "e& business", category: "Utilities", amount: 1890 },
  { vendor: "Deloitte Middle East", category: "Professional fees", amount: 26250 },
  { vendor: "Aramex", category: "Logistics", amount: 4310 },
  { vendor: "Salesforce", category: "Software", amount: 18400 },
  { vendor: "WeWork Dubai Hills", category: "Rent", amount: 9600 },
  { vendor: "Dubai Chamber", category: "Professional fees", amount: 2750 },
  { vendor: "Noon Business", category: "Office", amount: 1460 },
  { vendor: "Al Tayer Motors", category: "Logistics", amount: 7240 },
];
const billStatuses: BillStatus[] = ["Draft", "Awaiting approval", "Awaiting approval", "Scheduled", "Scheduled", "Paid", "Paid", "Paid"];
const day = (offset: number) => new Date(today.getTime() + offset * 86400_000).toISOString().slice(0, 10) + "T00:00:00.000Z";

/** 28 supplier bills, due from early October to mid-November. */
export const bills: Bill[] = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 3301 + 6007) % 100000;
  const v = vendors[i % vendors.length]!;
  const status = billStatuses[(seed >> 1) % billStatuses.length]!;
  // Unpaid bills spread around today, so a few are overdue; paid ones were due earlier.
  const due = status === "Paid" ? -3 - (seed % 14) : -4 + (seed % 30);
  const owner = people[(seed >> 2) % people.length]!;
  return {
    id: 5600 + i,
    number: `INV-${2026}${String(1000 + ((seed * 7) % 9000))}`,
    vendor: v.vendor,
    category: v.category,
    amount: Math.round(v.amount * (0.85 + (seed % 30) / 100) * 100) / 100,
    issuedOn: day(due - 30),
    dueOn: day(due),
    payOn: status === "Scheduled" ? day(Math.max(due - 1, 1)) : status === "Paid" ? day(due - 1) : undefined,
    status,
    owner,
    approver: owner.name === "Mashood Pookkadan" ? people[0]! : people[4]!,
    sync: status === "Paid" ? (seed % 9 === 0 ? "Failed" : "Synced") : status === "Draft" ? "Excluded" : "Ready",
    file: `${v.vendor.toLowerCase().replace(/[^a-z]+/g, "-")}-${1000 + (seed % 9000)}.pdf`,
  };
});
