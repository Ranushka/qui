import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { aed, formatDay } from "../examples/acme/claims";
import { cards, departments, people, today, type Person } from "../examples/acme/spend-data";
import {
  cities,
  cityOf,
  flightPolicy,
  hotelPolicy,
  nights,
  searchFlights,
  searchHotels,
  travelPolicy,
  trips as seedTrips,
  type Cabin,
  type FlightOffer,
  type HotelOffer,
  type Leg,
  type Trip,
  type TripStatus,
} from "../examples/acme/travel-data";

/**
 * Business travel in the Acme shell: search flights and hotels, see each result checked against the travel
 * policy (cabin, fare, advance booking, nightly cap), put a flight and a hotel into one trip, and book it on the
 * travel card — out-of-policy trips need a reason and go for approval. "Trips" lists what's booked, with each
 * trip's itinerary. Only qui components — no className or style anywhere in this file.
 */

const me = people.find((p) => p.name === "Ranu Perera")!;
const approver = people[0]!;
const travelCard = cards.find((c) => c.nickname === "Team travel" && c.status === "Active") ?? cards[0]!;

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const duration = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
const plusDays = (iso: string, d: number) => new Date(new Date(iso).getTime() + d * 86400_000).toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((new Date(b.slice(0, 10)).getTime() - new Date(a.slice(0, 10)).getTime()) / 86400_000);
const cityOptions = cities.map((c) => ({ value: c.code, label: `${c.city} (${c.code})` }));
const purposes = ["Client meeting", "Conference", "Sales visit", "Internal", "Training"];
const statusColor: Record<TripStatus, "yellow" | "indigo" | "emerald" | "grey"> = { "Awaiting approval": "yellow", Booked: "indigo", Completed: "emerald", Cancelled: "grey" };

type FlightSearch = { from: string; to: string; depart: string; ret: string; oneWay: boolean; cabin: Cabin };
type HotelSearch = { city: string; checkIn: string; checkOut: string };
type Picked<T> = { offer: T; exception: string | null };

function LegLine({ leg }: { leg: Leg }) {
  const nextDay = dayDiff(leg.depart, leg.arrive);
  return (
    <QUI.Inline gap="4" wrap={false}>
      <QUI.Stack gap="0.5">
        <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
          {time.format(new Date(leg.depart))} – {time.format(new Date(leg.arrive))}
          {nextDay > 0 ? ` +${nextDay}` : ""}
        </QUI.Text>
        <QUI.Text size="xs" color="secondary">
          {leg.airline} · {leg.flight} · {shortDay.format(new Date(leg.depart))}
        </QUI.Text>
      </QUI.Stack>
      <QUI.Stack gap="0.5">
        <QUI.Text size="xs" color="primary" tabularNums>
          {duration(leg.minutes)}
        </QUI.Text>
        <QUI.Text size="xs" color={leg.stops ? "warning" : "secondary"}>
          {leg.from}–{leg.to} · {leg.stops ? `1 stop, ${leg.via}` : "Non-stop"}
        </QUI.Text>
      </QUI.Stack>
    </QUI.Inline>
  );
}

function PolicyBadge({ exception }: { exception: string | null }) {
  return exception ? <QUI.Badge size="xs" variant="warning" label="Out of policy" /> : <QUI.Badge size="xs" variant="success" label="In policy" />;
}

function FlightResult({ offer, exception, selected, onSelect, oneWay }: { offer: FlightOffer; exception: string | null; selected: boolean; onSelect: () => void; oneWay: boolean }) {
  return (
    <QUI.Box as="li" border={selected ? "strong" : "subtle"} radius="lg" padding="4" background="layer-2">
      <QUI.Inline justify="between" gap="4" align="start" stackBelow="md">
        <QUI.Stack gap="3">
          <LegLine leg={offer.outbound} />
          {offer.inbound ? <LegLine leg={offer.inbound} /> : null}
          <QUI.Inline gap="1">
            <QUI.Badge size="xs" variant="neutral" label={offer.cabin} />
            <QUI.Badge size="xs" variant="neutral" label={offer.bags} />
            <QUI.Badge size="xs" variant={offer.refundable ? "info" : "neutral"} label={offer.refundable ? "Refundable" : "Non-refundable"} />
            <QUI.Badge size="xs" variant="neutral" label={`${offer.co2kg} kg CO₂`} />
            {offer.seatsLeft <= 3 ? <QUI.Badge size="xs" variant="danger" label={`${offer.seatsLeft} seats left`} /> : null}
          </QUI.Inline>
        </QUI.Stack>
        <QUI.Stack gap="1.5" align="end">
          <QUI.Heading level={3} size={4} weight="semibold">
            {aed.format(offer.fare)}
          </QUI.Heading>
          <QUI.Text size="xs" color="tertiary">
            {oneWay ? "One way" : "Return"}, per traveller
          </QUI.Text>
          <PolicyBadge exception={exception} />
          {exception ? (
            <QUI.Text variant="caption" size="md" color="warning">
              {exception}
            </QUI.Text>
          ) : null}
          <QUI.Button size="sm" variant={selected ? "secondary" : "primary"} icon={selected ? <QUI.Icon icon={Icons.Check} /> : undefined} label={selected ? "Selected" : "Select"} onClick={onSelect} aria-pressed={selected} />
        </QUI.Stack>
      </QUI.Inline>
    </QUI.Box>
  );
}

function HotelResult({ hotel, count, exception, selected, onSelect }: { hotel: HotelOffer; count: number; exception: string | null; selected: boolean; onSelect: () => void }) {
  return (
    <QUI.Box as="li" border={selected ? "strong" : "subtle"} radius="lg" padding="4" background="layer-2">
      <QUI.Inline justify="between" gap="4" align="start" stackBelow="md">
        <QUI.Stack gap="1.5">
          <QUI.Inline gap="2">
            <QUI.Text size="sm" weight="semibold" color="primary">
              {hotel.name}
            </QUI.Text>
            {hotel.preferred ? <QUI.Badge size="xs" variant="brand" label="Company rate" /> : null}
          </QUI.Inline>
          <QUI.Text size="xs" color="secondary">
            {hotel.stars}-star · {hotel.area} · {hotel.km} km from the meeting
          </QUI.Text>
          <QUI.Inline gap="1">
            <QUI.Badge size="xs" variant="info" label={`${hotel.rating.toFixed(1)} · ${hotel.reviews.toLocaleString("en-US")} reviews`} />
            {hotel.breakfast ? <QUI.Badge size="xs" variant="neutral" label="Breakfast included" /> : null}
            <QUI.Badge size="xs" variant={hotel.freeCancel ? "success" : "neutral"} label={hotel.freeCancel ? "Free cancellation" : "Non-refundable"} />
          </QUI.Inline>
        </QUI.Stack>
        <QUI.Stack gap="1.5" align="end">
          <QUI.Heading level={3} size={4} weight="semibold">
            {aed.format(hotel.nightly)}
          </QUI.Heading>
          <QUI.Text size="xs" color="tertiary">
            per night · {aed.format(hotel.nightly * count)} for {count} {count === 1 ? "night" : "nights"}
          </QUI.Text>
          <PolicyBadge exception={exception} />
          {exception ? (
            <QUI.Text variant="caption" size="md" color="warning">
              {exception}
            </QUI.Text>
          ) : null}
          <QUI.Button size="sm" variant={selected ? "secondary" : "primary"} icon={selected ? <QUI.Icon icon={Icons.Check} /> : undefined} label={selected ? "Selected" : "Select"} onClick={onSelect} aria-pressed={selected} />
        </QUI.Stack>
      </QUI.Inline>
    </QUI.Box>
  );
}

/** The trip being put together: the chosen flight and hotel, the total, and the way to checkout. */
function TripBasket({ flight, hotel, hotelNights, onRemoveFlight, onRemoveHotel, onReview }: { flight: Picked<FlightOffer> | null; hotel: (Picked<HotelOffer> & { city: string }) | null; hotelNights: number; onRemoveFlight: () => void; onRemoveHotel: () => void; onReview: () => void }) {
  const total = (flight?.offer.fare ?? 0) + (hotel ? hotel.offer.nightly * hotelNights : 0);
  const exceptions = [flight?.exception, hotel?.exception].filter(Boolean);
  return (
    <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2" as="aside" aria-label="Your trip">
      <QUI.Stack gap="4">
        <QUI.Text size="sm" weight="semibold" color="primary">
          Your trip
        </QUI.Text>
        {!flight && !hotel ? (
          <QUI.Text size="xs" color="tertiary">
            Pick a flight, a hotel, or both. They're booked together as one trip.
          </QUI.Text>
        ) : null}
        {flight ? (
          <QUI.Inline justify="between" gap="2" align="start" wrap={false}>
            <QUI.Inline gap="2" align="start" wrap={false}>
              <QUI.Icon icon={Icons.Plane} tint="secondary" size="md" />
              <QUI.Stack gap="0.5">
                <QUI.Text size="xs" weight="medium" color="primary">
                  {flight.offer.outbound.from} → {flight.offer.outbound.to}
                  {flight.offer.inbound ? " → " + flight.offer.inbound.to : ""}
                </QUI.Text>
                <QUI.Text variant="caption" size="md" color="secondary">
                  {flight.offer.outbound.airline} · {flight.offer.cabin} · {aed.format(flight.offer.fare)}
                </QUI.Text>
              </QUI.Stack>
            </QUI.Inline>
            <QUI.IconButton variant="ghost" size="xs" aria-label="Remove flight" icon={<QUI.Icon icon={Icons.X} />} onClick={onRemoveFlight} />
          </QUI.Inline>
        ) : null}
        {hotel ? (
          <QUI.Inline justify="between" gap="2" align="start" wrap={false}>
            <QUI.Inline gap="2" align="start" wrap={false}>
              <QUI.Icon icon={Icons.BedDouble} tint="secondary" size="md" />
              <QUI.Stack gap="0.5">
                <QUI.Text size="xs" weight="medium" color="primary">
                  {hotel.offer.name}
                </QUI.Text>
                <QUI.Text variant="caption" size="md" color="secondary">
                  {hotelNights} nights · {aed.format(hotel.offer.nightly * hotelNights)}
                </QUI.Text>
              </QUI.Stack>
            </QUI.Inline>
            <QUI.IconButton variant="ghost" size="xs" aria-label="Remove hotel" icon={<QUI.Icon icon={Icons.X} />} onClick={onRemoveHotel} />
          </QUI.Inline>
        ) : null}
        {flight || hotel ? (
          <>
            <QUI.Separator />
            <QUI.Inline justify="between" gap="2">
              <QUI.Text size="xs" color="secondary">
                Total
              </QUI.Text>
              <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
                {aed.format(total)}
              </QUI.Text>
            </QUI.Inline>
            {exceptions.length ? (
              <QUI.Banner variant="warning">
                {exceptions.length === 1 ? "One item is" : "Two items are"} out of policy. You'll give a reason, and {approver.name} approves before it's booked.
              </QUI.Banner>
            ) : null}
            <QUI.Button variant="primary" stretch="full" label="Review and book" onClick={onReview} />
          </>
        ) : null}
      </QUI.Stack>
    </QUI.Box>
  );
}

type Checkout = { name: string; purpose: string; department: string; reason: string };

/** The invite form a "Travellers" search offers when the person isn't on the team yet. */
function InviteForm({ query, onInvite, onCancel }: { query: string; onInvite: (person: Person) => void; onCancel: () => void }) {
  const typedEmail = query.includes("@");
  const [name, setName] = React.useState(typedEmail ? "" : query);
  const [email, setEmail] = React.useState(typedEmail ? query : "");
  const valid = name.trim() !== "" && /^\S+@\S+\.\S+$/.test(email);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onInvite({ name: name.trim(), email: email.trim() });
      }}
    >
      <QUI.Stack gap="3">
        <QUI.InputField label="Name" size="md" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        <QUI.InputField label="Work email" size="md" type="email" placeholder="name@acme.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <QUI.Inline justify="end" gap="2">
          <QUI.Button variant="secondary" size="sm" label="Cancel" onClick={onCancel} />
          <QUI.Button variant="primary" size="sm" type="submit" label="Send invite" disabled={!valid} />
        </QUI.Inline>
      </QUI.Stack>
    </form>
  );
}

function CheckoutDialog({
  open,
  onOpenChange,
  flight,
  hotel,
  hotelNights,
  defaultName,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: Picked<FlightOffer> | null;
  hotel: (Picked<HotelOffer> & { city: string; checkIn: string; checkOut: string }) | null;
  hotelNights: number;
  defaultName: string;
  onBook: (details: Checkout, needsApproval: boolean) => void;
}) {
  const [step, setStep] = React.useState(0);
  const [details, setDetails] = React.useState<Checkout>({ name: "", purpose: "", department: "", reason: "" });
  const [team, setTeam] = React.useState<Person[]>(people);
  const [travellers, setTravellers] = React.useState<Person[]>([me]);
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setDetails({ name: defaultName, purpose: "", department: "Sales", reason: "" });
      setSubmitted(false);
    }
  }, [open, defaultName]);
  const set = (patch: Partial<Checkout>) => setDetails((d) => ({ ...d, ...patch }));
  const exceptions = [flight?.exception, hotel?.exception].filter((e): e is string => Boolean(e));
  const needsApproval = exceptions.length > 0;
  const total = (flight?.offer.fare ?? 0) + (hotel ? hotel.offer.nightly * hotelNights : 0);
  const errors: Record<string, string | null> = {
    name: !details.name.trim() ? "Name the trip." : null,
    purpose: !details.purpose ? "Choose why you're going." : null,
    reason: needsApproval && details.reason.trim().length < 10 ? "Explain why the out-of-policy option is needed (a sentence is enough)." : null,
  };
  const show = (key: string) => (submitted ? (errors[key] ?? undefined) : undefined);
  const next = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    setSubmitted(false);
    setStep(1);
  };

  return (
    <QUI.Dialog open={open} onOpenChange={onOpenChange}>
      <QUI.DialogContent size="md">
        <QUI.Stack>
          <QUI.Box padding="5">
            <QUI.Stack gap="5">
              <QUI.Stack gap="1">
                <QUI.DialogTitle>Book trip</QUI.DialogTitle>
                <QUI.DialogDescription>{needsApproval ? `Goes to ${approver.name} for approval first. Prices are held for 24 hours.` : "In policy, so it's booked straight away."}</QUI.DialogDescription>
              </QUI.Stack>
              <QUI.Stepper steps={[{ label: "Trip details" }, { label: "Review and pay" }]} current={step} onStepClick={setStep} aria-label="Booking steps" />
              {step === 0 ? (
                <>
                  <QUI.InputField label="Trip name" value={details.name} onChange={(e) => set({ name: e.target.value })} error={show("name")} />
                  <QUI.Grid columns={2} gap="3" collapseBelow="sm">
                    <QUI.SelectField label="Purpose" placeholder="Choose" value={details.purpose || null} onValueChange={(v) => set({ purpose: String(v ?? "") })} options={purposes.map((p) => ({ value: p, label: p }))} error={show("purpose")} />
                    <QUI.SelectField label="Charge to department" value={details.department} onValueChange={(v) => set({ department: String(v ?? "") })} options={departments.map((d) => ({ value: d, label: d }))} />
                  </QUI.Grid>
                  <QUI.ComboboxField
                    label="Travellers"
                    multiple
                    placeholder="Add people…"
                    items={team}
                    itemToStringLabel={(p: Person) => p.name}
                    value={travellers}
                    onValueChange={(next) => setTravellers(next as Person[])}
                    create={{
                      label: (query) => (query ? `Invite "${query}"` : "Invite someone"),
                      title: "Invite to Acme",
                      form: ({ query, done, cancel }) => (
                        <InviteForm
                          query={query}
                          onCancel={cancel}
                          onInvite={(person) => {
                            setTeam((list) => [...list, person]);
                            done(person);
                          }}
                        />
                      ),
                    }}
                  />
                  {needsApproval ? (
                    <QUI.Stack gap="2">
                      <QUI.Banner variant="warning">
                        Out of policy: {exceptions.join("; ")}.
                      </QUI.Banner>
                      <QUI.TextAreaField label="Why do you need this option?" placeholder="e.g. The cheaper flights land after the 9:00 meeting starts." value={details.reason} onValueChange={(reason) => set({ reason })} error={show("reason")} />
                    </QUI.Stack>
                  ) : null}
                </>
              ) : (
                <QUI.Stack gap="4">
                  {flight ? (
                    <QUI.Box border="subtle" radius="lg" padding="4">
                      <QUI.Stack gap="3">
                        <QUI.Inline justify="between" gap="2">
                          <QUI.Text size="xs" weight="semibold" color="secondary">
                            Flight
                          </QUI.Text>
                          <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
                            {aed.format(flight.offer.fare)}
                          </QUI.Text>
                        </QUI.Inline>
                        <LegLine leg={flight.offer.outbound} />
                        {flight.offer.inbound ? <LegLine leg={flight.offer.inbound} /> : null}
                        <QUI.Text size="xs" color="tertiary">
                          {flight.offer.cabin} · {flight.offer.bags} · {flight.offer.refundable ? "Refundable" : "Non-refundable"} · traveller {me.name}
                        </QUI.Text>
                      </QUI.Stack>
                    </QUI.Box>
                  ) : null}
                  {hotel ? (
                    <QUI.Box border="subtle" radius="lg" padding="4">
                      <QUI.Stack gap="1">
                        <QUI.Inline justify="between" gap="2">
                          <QUI.Text size="xs" weight="semibold" color="secondary">
                            Hotel
                          </QUI.Text>
                          <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
                            {aed.format(hotel.offer.nightly * hotelNights)}
                          </QUI.Text>
                        </QUI.Inline>
                        <QUI.Text size="sm" weight="medium" color="primary">
                          {hotel.offer.name}
                        </QUI.Text>
                        <QUI.Text size="xs" color="secondary">
                          {formatDay(hotel.checkIn)} – {formatDay(hotel.checkOut)} · {hotelNights} nights × {aed.format(hotel.offer.nightly)} · {hotel.offer.freeCancel ? "Free cancellation" : "Non-refundable"}
                        </QUI.Text>
                      </QUI.Stack>
                    </QUI.Box>
                  ) : null}
                  <QUI.Inline gap="4" align="center" wrap={false} stackBelow="sm">
                    <QUI.CardVisual size="sm" holder={me.name} last4={travelCard.last4} expiry={travelCard.expiry} nickname="Team travel" network={travelCard.network} form="virtual" color="indigo" />
                    <QUI.Stack gap="1">
                      <QUI.Text size="sm" weight="medium" color="primary">
                        Paid with the Team travel card
                      </QUI.Text>
                      <QUI.Text size="xs" color="secondary">
                        The receipt and invoice attach to the transaction automatically. Charged to {details.department}, purpose {details.purpose.toLowerCase()}.
                      </QUI.Text>
                    </QUI.Stack>
                  </QUI.Inline>
                </QUI.Stack>
              )}
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" borderEdge="top" padding="4">
            <QUI.Inline justify="between" gap="2">
              <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
                {aed.format(total)}
              </QUI.Text>
              <QUI.Inline gap="2">
                <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
                {step === 0 ? (
                  <QUI.Button variant="primary" label="Continue" onClick={next} />
                ) : (
                  <QUI.Button variant="primary" icon={<QUI.Icon icon={needsApproval ? Icons.Send : Icons.Check} />} label={needsApproval ? "Send for approval" : "Book now"} onClick={() => onBook(details, needsApproval)} />
                )}
              </QUI.Inline>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Stack>
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}

function BookView({ onBooked }: { onBooked: (trip: Trip) => void }) {
  const [mode, setMode] = React.useState<"flights" | "hotels">("flights");
  const [fs, setFs] = React.useState<FlightSearch>({ from: "DXB", to: "RUH", depart: "2026-10-26", ret: "2026-10-29", oneWay: false, cabin: "Economy" });
  const [hs, setHs] = React.useState<HotelSearch>({ city: "RUH", checkIn: "2026-10-26", checkOut: "2026-10-29" });
  const [sort, setSort] = React.useState("best");
  const [inPolicyOnly, setInPolicyOnly] = React.useState(false);
  const [nonStopOnly, setNonStopOnly] = React.useState(false);
  const [flight, setFlight] = React.useState<Picked<FlightOffer> | null>(null);
  const [hotel, setHotel] = React.useState<(Picked<HotelOffer> & HotelSearch) | null>(null);
  const [checkout, setCheckout] = React.useState(false);

  const setF = (patch: Partial<FlightSearch>) =>
    setFs((s) => {
      const next = { ...s, ...patch };
      // Keep the hotel search in step with the trip, so a return flight and its hotel line up.
      if (patch.to || patch.depart || patch.ret) setHs({ city: next.to, checkIn: next.depart, checkOut: next.oneWay ? plusDays(next.depart, 2) : next.ret });
      return next;
    });

  const flightErrors = fs.from === fs.to ? "Pick two different cities." : !fs.oneWay && fs.ret < fs.depart ? "The return is before the departure." : fs.depart < today.toISOString().slice(0, 10) ? "That date has passed." : null;
  const hotelErrors = hs.checkOut <= hs.checkIn ? "Check-out has to be after check-in." : null;
  const offers = flightErrors ? [] : searchFlights({ from: fs.from, to: fs.to, depart: fs.depart, ret: fs.oneWay ? undefined : fs.ret, cabin: fs.cabin });
  const cheapest = Math.min(...searchFlights({ from: fs.from, to: fs.to, depart: fs.depart, ret: fs.oneWay ? undefined : fs.ret, cabin: "Economy" }).map((o) => o.fare));
  const ratedFlights = offers
    .map((offer) => ({ offer, exception: flightPolicy(offer, cheapest, fs.depart, today) }))
    .filter((r) => (!inPolicyOnly || !r.exception) && (!nonStopOnly || (r.offer.outbound.stops === 0 && (r.offer.inbound?.stops ?? 0) === 0)))
    .sort((a, b) => {
      const time = (o: FlightOffer) => o.outbound.minutes + (o.inbound?.minutes ?? 0);
      if (sort === "cheapest") return a.offer.fare - b.offer.fare;
      if (sort === "fastest") return time(a.offer) - time(b.offer);
      // "Best": in policy first, then a blend of price and time.
      return Number(Boolean(a.exception)) - Number(Boolean(b.exception)) || a.offer.fare / 10 + time(a.offer) - (b.offer.fare / 10 + time(b.offer));
    });
  const hotelCount = nights(hs.checkIn, hs.checkOut);
  const ratedHotels = (hotelErrors ? [] : searchHotels(hs))
    .map((offer) => ({ offer, exception: hotelPolicy(offer, hs.city) }))
    .filter((r) => !inPolicyOnly || !r.exception)
    .sort((a, b) => (sort === "cheapest" ? a.offer.nightly - b.offer.nightly : sort === "fastest" ? a.offer.km - b.offer.km : Number(Boolean(a.exception)) - Number(Boolean(b.exception)) || Number(b.offer.preferred) - Number(a.offer.preferred) || b.offer.rating - a.offer.rating));
  const hotelNights = hotel ? nights(hotel.checkIn, hotel.checkOut) : 0;
  const destination = flight?.offer.outbound.to ?? hotel?.city ?? fs.to;

  const book = (details: Checkout, needsApproval: boolean) => {
    const start = flight?.offer.outbound.depart ?? `${hotel!.checkIn}T00:00:00.000Z`;
    const end = flight?.offer.inbound?.arrive ?? (hotel ? `${hotel.checkOut}T00:00:00.000Z` : flight!.offer.outbound.arrive);
    const ref = () => Math.random().toString(36).slice(2, 8).toUpperCase();
    onBooked({
      id: 900 + Math.floor(Math.random() * 99),
      name: details.name.trim(),
      traveller: me,
      destination,
      start,
      end,
      purpose: details.purpose,
      department: details.department,
      flight: flight ? { summary: `${flight.offer.outbound.airline}, ${flight.offer.inbound ? "return" : "one way"}, ${flight.offer.cabin}`, fare: flight.offer.fare, ref: ref(), outbound: flight.offer.outbound, inbound: flight.offer.inbound } : undefined,
      hotel: hotel ? { name: hotel.offer.name, nights: hotelNights, total: hotel.offer.nightly * hotelNights, ref: ref() } : undefined,
      status: needsApproval ? "Awaiting approval" : "Booked",
      exception: needsApproval ? [flight?.exception, hotel?.exception].filter(Boolean).join("; ") + ` — "${details.reason.trim()}"` : undefined,
      approver,
    });
    setCheckout(false);
    setFlight(null);
    setHotel(null);
  };

  return (
    <QUI.Box grow overflow="auto" paddingX="4" paddingBottom="4">
      <QUI.Stack gap="4">
        <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
          <QUI.Stack gap="4">
            <QUI.Tabs value={mode} onValueChange={(v) => setMode(v as "flights" | "hotels")}>
              <QUI.TabsList aria-label="What to book">
                <QUI.Tab value="flights" label="Flights" icon={<QUI.Icon icon={Icons.Plane} />} />
                <QUI.Tab value="hotels" label="Hotels" icon={<QUI.Icon icon={Icons.BedDouble} />} />
              </QUI.TabsList>
            </QUI.Tabs>
            {mode === "flights" ? (
              <QUI.Stack gap="3">
                <QUI.Grid columns={6} collapseBelow="lg" gap="3">
                  <QUI.SelectField label="From" value={fs.from} onValueChange={(v) => setF({ from: String(v) })} options={cityOptions} />
                  <QUI.SelectField label="To" value={fs.to} onValueChange={(v) => setF({ to: String(v) })} options={cityOptions} />
                  <QUI.InputField label="Depart" type="date" value={fs.depart} min={today.toISOString().slice(0, 10)} onChange={(e) => setF({ depart: e.target.value })} />
                  <QUI.InputField label="Return" type="date" value={fs.ret} min={fs.depart} disabled={fs.oneWay} onChange={(e) => setF({ ret: e.target.value })} />
                  <QUI.SelectField label="Trip" value={fs.oneWay ? "one" : "return"} onValueChange={(v) => setF({ oneWay: v === "one" })} options={[{ value: "return", label: "Return" }, { value: "one", label: "One way" }]} />
                  <QUI.SelectField label="Cabin" value={fs.cabin} onValueChange={(v) => setF({ cabin: v as Cabin })} options={["Economy", "Premium economy", "Business"].map((c) => ({ value: c, label: c }))} />
                </QUI.Grid>
                {flightErrors ? <QUI.Banner variant="danger">{flightErrors}</QUI.Banner> : null}
              </QUI.Stack>
            ) : (
              <QUI.Stack gap="3">
                <QUI.Grid columns={3} collapseBelow="md" gap="3">
                  <QUI.SelectField label="City" value={hs.city} onValueChange={(v) => setHs((s) => ({ ...s, city: String(v) }))} options={cityOptions} />
                  <QUI.InputField label="Check-in" type="date" value={hs.checkIn} min={today.toISOString().slice(0, 10)} onChange={(e) => setHs((s) => ({ ...s, checkIn: e.target.value }))} />
                  <QUI.InputField label="Check-out" type="date" value={hs.checkOut} min={hs.checkIn} onChange={(e) => setHs((s) => ({ ...s, checkOut: e.target.value }))} />
                </QUI.Grid>
                {hotelErrors ? <QUI.Banner variant="danger">{hotelErrors}</QUI.Banner> : null}
              </QUI.Stack>
            )}
          </QUI.Stack>
        </QUI.Box>
        <QUI.Banner variant="info">
          Travel policy: economy unless a flight is over 6 hours, fares within {travelPolicy.fareTolerance * 100}% of the cheapest, book {travelPolicy.advanceDays}+ days ahead, hotels up to AED{" "}
          {(travelPolicy.hotelCap[mode === "flights" ? fs.to : hs.city] ?? 800).toLocaleString("en-US")} a night in {cityOf(mode === "flights" ? fs.to : hs.city).city}.
        </QUI.Banner>
        <QUI.Inline gap="4" align="start" wrap={false} stackBelow="lg">
          <QUI.Box grow>
            <QUI.Stack gap="3">
              <QUI.Stack gap="3">
                <QUI.Tabs variant="underline" value={sort} onValueChange={(v) => setSort(String(v))}>
                  <QUI.TabsList aria-label="Sort results">
                    <QUI.Tab value="best" label="Best" />
                    <QUI.Tab value="cheapest" label="Cheapest" />
                    <QUI.Tab value="fastest" label={mode === "flights" ? "Fastest" : "Closest"} />
                  </QUI.TabsList>
                </QUI.Tabs>
                <QUI.Inline gap="4">
                  {mode === "flights" ? <QUI.SwitchField size="md" label="Non-stop only" checked={nonStopOnly} onCheckedChange={setNonStopOnly} /> : null}
                  <QUI.SwitchField size="md" label="In policy only" checked={inPolicyOnly} onCheckedChange={setInPolicyOnly} />
                </QUI.Inline>
              </QUI.Stack>
              <QUI.Text size="xs" color="secondary" aria-live="polite">
                {mode === "flights"
                  ? `${ratedFlights.length} flights, ${cityOf(fs.from).city} to ${cityOf(fs.to).city}`
                  : `${ratedHotels.length} hotels in ${cityOf(hs.city).city}, ${hotelCount} ${hotelCount === 1 ? "night" : "nights"}`}
              </QUI.Text>
              <QUI.Stack as="ul" gap="3" aria-label={mode === "flights" ? "Flight results" : "Hotel results"}>
                {mode === "flights"
                  ? ratedFlights.map((r) => (
                      <FlightResult key={r.offer.id} offer={r.offer} exception={r.exception} oneWay={fs.oneWay} selected={flight?.offer.id === r.offer.id} onSelect={() => setFlight(flight?.offer.id === r.offer.id ? null : r)} />
                    ))
                  : ratedHotels.map((r) => (
                      <HotelResult key={r.offer.id} hotel={r.offer} count={hotelCount} exception={r.exception} selected={hotel?.offer.id === r.offer.id} onSelect={() => setHotel(hotel?.offer.id === r.offer.id ? null : { ...r, ...hs })} />
                    ))}
              </QUI.Stack>
              {(mode === "flights" ? ratedFlights : ratedHotels).length === 0 && !(mode === "flights" ? flightErrors : hotelErrors) ? (
                <QUI.Stack gap="2" align="center" paddingY="8">
                  <QUI.Icon icon={Icons.SearchX} size="lg" tint="placeholder" />
                  <QUI.Text weight="medium" color="primary">
                    Nothing matches
                  </QUI.Text>
                  <QUI.Text size="xs" color="tertiary">
                    Turn off a filter to see more.
                  </QUI.Text>
                </QUI.Stack>
              ) : null}
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box width="xs" shrink={false}>
            <TripBasket
              flight={flight}
              hotel={hotel}
              hotelNights={hotelNights}
              onRemoveFlight={() => setFlight(null)}
              onRemoveHotel={() => setHotel(null)}
              onReview={() => setCheckout(true)}
            />
          </QUI.Box>
        </QUI.Inline>
      </QUI.Stack>
      <CheckoutDialog open={checkout} onOpenChange={setCheckout} flight={flight} hotel={hotel} hotelNights={hotelNights} defaultName={`${cityOf(destination).city} trip`} onBook={book} />
    </QUI.Box>
  );
}

/** A trip's itinerary as a timeline: flights and hotel stays in date order, with what's still ahead pending. */
function itinerary(trip: Trip): QUI.TimelineItem[] {
  const when = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  const done = (iso: string) => trip.status === "Completed" || new Date(iso) < today;
  const items: { at: string; item: QUI.TimelineItem }[] = [];
  const legItem = (leg: Leg) => ({ at: leg.depart, item: { title: `${leg.airline} ${leg.flight}: ${cityOf(leg.from).city} → ${cityOf(leg.to).city}`, time: when.format(new Date(leg.depart)), description: `Arrives ${time.format(new Date(leg.arrive))} · booking ${trip.flight!.ref}`, icon: Icons.Plane, tone: done(leg.depart) ? ("done" as const) : ("pending" as const) } });
  if (trip.flight) items.push(legItem(trip.flight.outbound));
  if (trip.flight?.inbound) items.push(legItem(trip.flight.inbound));
  if (trip.hotel) {
    const checkIn = trip.flight?.outbound.arrive ?? trip.start;
    items.push({ at: checkIn, item: { title: `Check in: ${trip.hotel.name}`, time: formatDay(checkIn), description: `${trip.hotel.nights} nights · confirmation ${trip.hotel.ref}`, icon: Icons.BedDouble, tone: done(checkIn) ? "done" : "pending" } });
  }
  const sorted = items.sort((a, b) => a.at.localeCompare(b.at)).map((x) => x.item);
  if (trip.status === "Cancelled") return [...sorted.map((i) => ({ ...i, tone: "pending" as const })), { title: "Trip cancelled", description: "Refunds go back to the Team travel card.", tone: "danger" }];
  if (trip.status === "Awaiting approval") return [{ title: `Waiting for ${trip.approver.name} to approve`, time: "Now", tone: "current", description: trip.exception }, ...sorted];
  const nextIndex = sorted.findIndex((i) => i.tone === "pending");
  return sorted.map((i, n) => (n === nextIndex ? { ...i, tone: "current" as const } : i));
}

function TripsView({ trips, setTrips, notice, setNotice }: { trips: Trip[]; setTrips: React.Dispatch<React.SetStateAction<Trip[]>>; notice: string | null; setNotice: (n: string | null) => void }) {
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [view, setView] = React.useState("upcoming");
  const views = [
    { value: "upcoming", label: "Upcoming", test: (t: Trip) => t.status === "Booked" || t.status === "Awaiting approval" },
    { value: "approval", label: "Awaiting approval", test: (t: Trip) => t.status === "Awaiting approval" },
    { value: "past", label: "Past", test: (t: Trip) => t.status === "Completed" || t.status === "Cancelled" },
    { value: "all", label: "All trips", test: () => true },
  ];
  const rows = trips.filter(views.find((v) => v.value === view)!.test).sort((a, b) => a.start.localeCompare(b.start));
  const trip = trips.find((t) => t.id === openId) ?? null;
  const total = (t: Trip) => (t.flight?.fare ?? 0) + (t.hotel?.total ?? 0);
  const update = (id: number, status: TripStatus, message: string) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setNotice(message);
    setOpenId(null);
  };

  return (
    <>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="card" value={view} onValueChange={(v) => setView(String(v))}>
          <QUI.TabsList aria-label="Trip status">
            {views.map((v) => (
              <QUI.Tab key={v.value} value={v.value} label={v.label} count={trips.filter(v.test).length} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="Trips">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Trip</QUI.TableHead>
              <QUI.TableHead>Traveller</QUI.TableHead>
              <QUI.TableHead>Dates</QUI.TableHead>
              <QUI.TableHead>Booked</QUI.TableHead>
              <QUI.TableHead align="end">Total</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Policy</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((t) => (
              <QUI.TableRow key={t.id}>
                <QUI.TableCell>
                  <QUI.TextCell primary={t.name} secondary={`${cityOf(t.destination).city} · ${t.purpose}`} tone="link" onClick={() => setOpenId(t.id)} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={t.traveller.name} secondary={t.department} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={`${formatDay(t.start)} – ${formatDay(t.end)}`} secondary={`${Math.max(1, dayDiff(t.start, t.end))} days`} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={[t.flight ? "Flight" : null, t.hotel ? "Hotel" : null].filter(Boolean).join(" + ")} secondary={t.flight?.summary ?? t.hotel?.name} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={total(t)} currency="AED" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={t.status} color={statusColor[t.status]} />
                </QUI.TableCell>
                <QUI.TableCell>{t.exception ? <QUI.TagCell label="Exception" color="orange" /> : <QUI.TagCell label="In policy" color="emerald" />}</QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <QUI.Drawer open={trip != null} onOpenChange={(open) => (open ? null : setOpenId(null))}>
        <QUI.DrawerContent aria-label="Trip details">
          {trip ? (
            <QUI.Stack height="full">
              <QUI.Box grow overflow="auto" padding="4">
                <QUI.Stack gap="5">
                  <QUI.Stack gap="1">
                    <QUI.Inline gap="2" wrap={false}>
                      <QUI.TagCell label={trip.status} color={statusColor[trip.status]} />
                      <QUI.Text variant="caption" size="md" color="tertiary">
                        Trip #{trip.id}
                      </QUI.Text>
                    </QUI.Inline>
                    <QUI.DrawerTitle>{trip.name}</QUI.DrawerTitle>
                    <QUI.Heading level={3} size={3} weight="semibold">
                      {aed.format(total(trip))}
                    </QUI.Heading>
                    <QUI.DrawerDescription>
                      {formatDay(trip.start)} – {formatDay(trip.end)} · {cityOf(trip.destination).city}, {cityOf(trip.destination).country}
                    </QUI.DrawerDescription>
                  </QUI.Stack>
                  {trip.exception ? <QUI.Banner variant="warning">Out of policy: {trip.exception}</QUI.Banner> : null}
                  <QUI.Stack gap="2">
                    <QUI.Text size="xs" weight="semibold" color="secondary">
                      Itinerary
                    </QUI.Text>
                    <QUI.Timeline items={itinerary(trip)} />
                  </QUI.Stack>
                  <QUI.Grid columns={2} gap="4">
                    <QUI.Property icon={Icons.UserRound} label="Traveller">
                      <QUI.UserCell name={trip.traveller.name} />
                    </QUI.Property>
                    <QUI.Property icon={Icons.UserCheck} label="Approver">
                      <QUI.UserCell name={trip.approver.name} />
                    </QUI.Property>
                    <QUI.Property icon={Icons.Briefcase} label="Purpose">
                      <QUI.Text size="xs">{trip.purpose}</QUI.Text>
                    </QUI.Property>
                    <QUI.Property icon={Icons.Building2} label="Department">
                      <QUI.Text size="xs">{trip.department}</QUI.Text>
                    </QUI.Property>
                  </QUI.Grid>
                </QUI.Stack>
              </QUI.Box>
              {trip.status === "Awaiting approval" || trip.status === "Booked" ? (
                <QUI.Box border="subtle" borderEdge="top" padding="4">
                  <QUI.Inline justify="end" gap="2">
                    <QUI.Button variant="danger-outline" label={trip.status === "Awaiting approval" ? "Reject" : "Cancel trip"} onClick={() => update(trip.id, "Cancelled", `${trip.name} ${trip.status === "Awaiting approval" ? "was rejected" : "was cancelled"}. Refunds go back to the travel card.`)} />
                    {trip.status === "Awaiting approval" ? (
                      <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Check} />} label="Approve and book" onClick={() => update(trip.id, "Booked", `Approved and booked ${trip.name}. ${trip.traveller.name} gets the confirmations by email.`)} />
                    ) : null}
                  </QUI.Inline>
                </QUI.Box>
              ) : null}
            </QUI.Stack>
          ) : null}
        </QUI.DrawerContent>
      </QUI.Drawer>
    </>
  );
}

/** Playground page: book flights and hotels against the travel policy, and manage booked trips. */
export function TravelPage() {
  const [tab, setTab] = React.useState(() => (window.location.hash.includes("view=trips") ? "trips" : "book"));
  const [trips, setTrips] = React.useState(seedTrips);
  const [notice, setNotice] = React.useState<string | null>(null);
  const upcoming = trips.filter((t) => t.status === "Booked" || t.status === "Awaiting approval").length;

  return (
    <AcmeShell
      current="Travel"
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.Plane} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Travel
            </QUI.Heading>
            <QUI.Badge size="xs" variant="info" label={`${upcoming} upcoming trips`} />
          </QUI.Inline>
        </QUI.Inline>
      }
    >
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="underline" value={tab} onValueChange={(v) => setTab(String(v))}>
          <QUI.TabsList aria-label="Travel">
            <QUI.Tab value="book" label="Book" />
            <QUI.Tab value="trips" label="Trips" count={trips.filter((t) => t.status === "Awaiting approval").length || undefined} />
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      {tab === "book" ? (
        <BookView
          onBooked={(trip) => {
            setTrips((prev) => [trip, ...prev]);
            setTab("trips");
            setNotice(trip.status === "Booked" ? `Booked ${trip.name}. Confirmations are on their way to ${trip.traveller.email}.` : `${trip.name} sent to ${trip.approver.name} for approval. Prices are held for 24 hours.`);
          }}
        />
      ) : (
        <TripsView trips={trips} setTrips={setTrips} notice={notice} setNotice={setNotice} />
      )}
    </AcmeShell>
  );
}
