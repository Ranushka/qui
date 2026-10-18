/** Deterministic sample data for the travel screen: airports, flight and hotel search results, the travel policy and booked trips. */
import { people, type Person } from "./spend-data";

export type City = { code: string; city: string; country: string };
export const cities: City[] = [
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia" },
  { code: "LHR", city: "London", country: "UK" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "CAI", city: "Cairo", country: "Egypt" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
];
export const cityOf = (code: string) => cities.find((c) => c.code === code)!;

/** Flight time in minutes from Dubai; other pairs are estimated through it. */
const fromDubai: Record<string, number> = { DXB: 0, RUH: 125, LHR: 460, BOM: 190, CAI: 235, SIN: 445 };
export const flightMinutes = (from: string, to: string) => (from === "DXB" || to === "DXB" ? fromDubai[from === "DXB" ? to : from]! : Math.round((fromDubai[from]! + fromDubai[to]!) * 0.8));

const airlinesFor: Record<string, string[]> = {
  RUH: ["Saudia", "flydubai", "Emirates", "flynas"],
  LHR: ["Emirates", "British Airways", "Virgin Atlantic", "Qatar Airways"],
  BOM: ["Emirates", "Air India", "IndiGo", "flydubai"],
  CAI: ["EgyptAir", "Emirates", "flydubai", "Air Arabia"],
  SIN: ["Singapore Airlines", "Emirates", "Qatar Airways"],
  DXB: ["Emirates", "flydubai"],
};

const airlineCode: Record<string, string> = {
  Emirates: "EK", flydubai: "FZ", Saudia: "SV", flynas: "XY", "British Airways": "BA", "Virgin Atlantic": "VS", "Qatar Airways": "QR",
  "Air India": "AI", IndiGo: "6E", EgyptAir: "MS", "Air Arabia": "G9", "Singapore Airlines": "SQ",
};

export type Cabin = "Economy" | "Premium economy" | "Business";

/** The company travel policy the results are checked against. */
export const travelPolicy = {
  /** Business class is allowed only when a single flight is longer than this. */
  businessOverMinutes: 360,
  /** Fares more than this share above the cheapest comparable fare are out of policy. */
  fareTolerance: 0.25,
  /** Book at least this many days ahead. */
  advanceDays: 7,
  /** Nightly hotel cap per city, AED. */
  hotelCap: { DXB: 750, RUH: 900, LHR: 1400, BOM: 650, CAI: 600, SIN: 1100 } as Record<string, number>,
};

export type Leg = { airline: string; flight: string; from: string; to: string; depart: string; arrive: string; minutes: number; stops: number; via?: string };
export type FlightOffer = { id: string; outbound: Leg; inbound?: Leg; cabin: Cabin; fare: number; refundable: boolean; bags: string; seatsLeft: number; co2kg: number };

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7);
const addMinutes = (iso: string, m: number) => new Date(new Date(iso).getTime() + m * 60_000).toISOString();

function leg(from: string, to: string, date: string, i: number, seed: number, airline: string): Leg {
  const stops = i % 4 === 3 ? 1 : 0;
  const base = flightMinutes(from, to);
  const minutes = base + stops * (80 + (seed % 60)) + ((seed >> 2) % 20);
  const depart = `${date}T${String(1 + ((seed + i * 5) % 22)).padStart(2, "0")}:${["05", "20", "35", "50"][(seed + i) % 4]}:00.000Z`;
  return {
    airline,
    flight: `${airlineCode[airline] ?? "EK"} ${100 + ((seed * 7 + i * 13) % 800)}`,
    from,
    to,
    depart,
    arrive: addMinutes(depart, minutes),
    minutes,
    stops,
    via: stops ? (to === "LHR" || from === "LHR" ? "DOH" : "BAH") : undefined,
  };
}

/** Eight offers for a route and dates — the same search always gives the same results. */
export function searchFlights({ from, to, depart, ret, cabin }: { from: string; to: string; depart: string; ret?: string; cabin: Cabin }): FlightOffer[] {
  if (!from || !to || from === to || !depart) return [];
  const seed = hash(`${from}${to}${depart}${ret ?? ""}`);
  const perMinute = cabin === "Business" ? 9.5 : cabin === "Premium economy" ? 4.2 : 1.9;
  return Array.from({ length: 8 }, (_, i) => {
    const s = (seed + i * 977) % 10000;
    // One airline per itinerary, as a return ticket would be.
    const airlines = airlinesFor[to === "DXB" ? from : to] ?? airlinesFor.DXB!;
    const airline = airlines[(i + seed) % airlines.length]!;
    const outbound = leg(from, to, depart, i, s, airline);
    const inbound = ret ? leg(to, from, ret, i + 1, s >> 1, airline) : undefined;
    const minutes = outbound.minutes + (inbound?.minutes ?? 0);
    const premium = ["Emirates", "Singapore Airlines", "British Airways", "Qatar Airways", "Virgin Atlantic"].includes(outbound.airline) ? 1.35 : 1;
    const fare = Math.round((minutes * perMinute * premium * (0.85 + (s % 50) / 100) - outbound.stops * 120 + 180) / 5) * 5;
    return {
      id: `${from}-${to}-${i}`,
      outbound,
      inbound,
      cabin,
      fare,
      refundable: s % 3 === 0,
      bags: cabin === "Economy" && ["flydubai", "flynas", "Air Arabia", "IndiGo"].includes(outbound.airline) ? "Cabin bag only" : cabin === "Business" ? "2 × 32 kg" : "1 × 23 kg",
      seatsLeft: 1 + (s % 9),
      co2kg: Math.round(minutes * (cabin === "Business" ? 2.6 : 0.9)),
    };
  });
}

/** Why a flight is out of policy, or null when it's in. */
export function flightPolicy(offer: FlightOffer, cheapest: number, depart: string, today: Date): string | null {
  const longest = Math.max(offer.outbound.minutes, offer.inbound?.minutes ?? 0);
  if (offer.cabin === "Business" && longest <= travelPolicy.businessOverMinutes) return "Business class on a flight under 6 hours";
  if (offer.fare > cheapest * (1 + travelPolicy.fareTolerance)) return `More than ${travelPolicy.fareTolerance * 100}% above the cheapest fare`;
  if ((new Date(depart).getTime() - today.getTime()) / 86400_000 < travelPolicy.advanceDays) return `Booked less than ${travelPolicy.advanceDays} days ahead`;
  return null;
}

export type HotelOffer = { id: string; name: string; stars: number; area: string; km: number; nightly: number; rating: number; reviews: number; breakfast: boolean; freeCancel: boolean; preferred: boolean };

const hotelNames: Record<string, { name: string; area: string }[]> = {
  DXB: [{ name: "Address Downtown", area: "Downtown" }, { name: "Rove Downtown", area: "Downtown" }, { name: "JW Marriott Marquis", area: "Business Bay" }, { name: "Hyatt Place Al Rigga", area: "Deira" }, { name: "Novotel World Trade Centre", area: "Trade Centre" }],
  RUH: [{ name: "Marriott Riyadh Diplomatic Quarter", area: "Diplomatic Quarter" }, { name: "Hilton Riyadh Hotel & Residences", area: "King Fahd Rd" }, { name: "Fairmont Riyadh", area: "Business Gate" }, { name: "Novotel Riyadh Sahafa", area: "Al Sahafa" }, { name: "Radisson Blu Riyadh", area: "Olaya" }],
  LHR: [{ name: "Hilton London Bankside", area: "Southwark" }, { name: "Premier Inn City", area: "Aldgate" }, { name: "The Ned", area: "City of London" }, { name: "citizenM Tower of London", area: "Tower Hill" }, { name: "Novotel London Paddington", area: "Paddington" }],
  BOM: [{ name: "Trident Bandra Kurla", area: "BKC" }, { name: "Taj Mahal Palace", area: "Colaba" }, { name: "Courtyard by Marriott", area: "Andheri" }, { name: "Ibis Navi Mumbai", area: "Navi Mumbai" }, { name: "Sofitel BKC", area: "BKC" }],
  CAI: [{ name: "Four Seasons Nile Plaza", area: "Garden City" }, { name: "Steigenberger Tahrir", area: "Downtown" }, { name: "Novotel Cairo Airport", area: "Heliopolis" }, { name: "Kempinski Nile Hotel", area: "Garden City" }, { name: "Holiday Inn Citystars", area: "Nasr City" }],
  SIN: [{ name: "Marina Bay Sands", area: "Marina Bay" }, { name: "Hotel Jen Orchardgateway", area: "Orchard" }, { name: "Pan Pacific Singapore", area: "Marina Centre" }, { name: "Yotel Singapore", area: "Orchard" }, { name: "Andaz Singapore", area: "Bugis" }],
};

/** Hotels in a city for the dates — the same search always gives the same results. */
export function searchHotels({ city, checkIn, checkOut }: { city: string; checkIn: string; checkOut: string }): HotelOffer[] {
  if (!city || !checkIn || !checkOut || checkOut <= checkIn) return [];
  const seed = hash(`${city}${checkIn}${checkOut}`);
  const cap = travelPolicy.hotelCap[city] ?? 800;
  return (hotelNames[city] ?? []).map((h, i) => {
    const s = (seed + i * 613) % 10000;
    const stars = [5, 4, 5, 3, 4][i]!;
    return {
      id: `${city}-${i}`,
      name: h.name,
      stars,
      area: h.area,
      km: Math.round((0.4 + (s % 90) / 10) * 10) / 10,
      nightly: Math.round((cap * (stars === 5 ? 1.25 : stars === 4 ? 0.85 : 0.6) * (0.85 + (s % 35) / 100)) / 5) * 5,
      rating: Math.round((7.4 + (s % 24) / 10) * 10) / 10,
      reviews: 300 + (s % 4000),
      breakfast: s % 2 === 0,
      freeCancel: s % 3 !== 0,
      preferred: i === 2 || i === 4,
    };
  });
}

export const hotelPolicy = (hotel: HotelOffer, city: string) => {
  const cap = travelPolicy.hotelCap[city] ?? 800;
  return hotel.nightly > cap ? `Over the AED ${cap.toLocaleString("en-US")} nightly cap for ${cityOf(city).city}` : null;
};

export const nights = (checkIn: string, checkOut: string) => Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400_000));

export type TripStatus = "Awaiting approval" | "Booked" | "Completed" | "Cancelled";
export type Trip = {
  id: number;
  name: string;
  traveller: Person;
  destination: string;
  start: string;
  end: string;
  purpose: string;
  department: string;
  flight?: { summary: string; fare: number; ref: string; outbound: Leg; inbound?: Leg };
  hotel?: { name: string; nights: number; total: number; ref: string };
  status: TripStatus;
  /** Why it's out of policy, if it is. */
  exception?: string;
  approver: Person;
};

const saif = people[0]!;
const legOf = (from: string, to: string, depart: string, airline: string, flight: string): Leg => {
  const minutes = flightMinutes(from, to);
  return { airline, flight, from, to, depart, arrive: addMinutes(depart, minutes), minutes, stops: 0 };
};

/** Trips already in the system, newest first. */
export const trips: Trip[] = [
  {
    id: 812,
    name: "Riyadh client visit",
    traveller: people[1]!,
    destination: "RUH",
    start: "2026-10-26T00:00:00.000Z",
    end: "2026-10-28T00:00:00.000Z",
    purpose: "Client meeting",
    department: "Sales",
    flight: { summary: "Saudia, return, Economy", fare: 1240, ref: "K7QZ2M", outbound: legOf("DXB", "RUH", "2026-10-26T05:20:00.000Z", "Saudia", "SV 553"), inbound: legOf("RUH", "DXB", "2026-10-28T16:35:00.000Z", "Saudia", "SV 556") },
    hotel: { name: "Marriott Riyadh Diplomatic Quarter", nights: 2, total: 1720, ref: "MR-448120" },
    status: "Booked",
    approver: saif,
  },
  {
    id: 811,
    name: "GITEX Global follow-ups, London",
    traveller: people[2]!,
    destination: "LHR",
    start: "2026-11-09T00:00:00.000Z",
    end: "2026-11-13T00:00:00.000Z",
    purpose: "Conference",
    department: "Engineering",
    flight: { summary: "Emirates, return, Business", fare: 18450, ref: "EK9P4L", outbound: legOf("DXB", "LHR", "2026-11-09T02:50:00.000Z", "Emirates", "EK 001"), inbound: legOf("LHR", "DXB", "2026-11-13T20:35:00.000Z", "Emirates", "EK 004") },
    hotel: { name: "The Ned", nights: 4, total: 7600, ref: "NED-20931" },
    status: "Awaiting approval",
    exception: "Over the AED 1,400 nightly cap for London",
    approver: saif,
  },
  {
    id: 809,
    name: "Mumbai vendor audit",
    traveller: people[3]!,
    destination: "BOM",
    start: "2026-11-02T00:00:00.000Z",
    end: "2026-11-04T00:00:00.000Z",
    purpose: "Internal",
    department: "Operations",
    flight: { summary: "IndiGo, return, Economy", fare: 1385, ref: "6E3XK1", outbound: legOf("DXB", "BOM", "2026-11-02T09:05:00.000Z", "IndiGo", "6E 1462"), inbound: legOf("BOM", "DXB", "2026-11-04T19:50:00.000Z", "IndiGo", "6E 1461") },
    status: "Booked",
    approver: saif,
  },
  {
    id: 801,
    name: "Cairo partner kickoff",
    traveller: people[0]!,
    destination: "CAI",
    start: "2026-10-05T00:00:00.000Z",
    end: "2026-10-08T00:00:00.000Z",
    purpose: "Client meeting",
    department: "Sales",
    flight: { summary: "EgyptAir, return, Economy", fare: 1960, ref: "MS7Y2A", outbound: legOf("DXB", "CAI", "2026-10-05T06:35:00.000Z", "EgyptAir", "MS 911"), inbound: legOf("CAI", "DXB", "2026-10-08T15:20:00.000Z", "EgyptAir", "MS 910") },
    hotel: { name: "Steigenberger Tahrir", nights: 3, total: 1395, ref: "ST-77152" },
    status: "Completed",
    approver: people[1]!,
  },
  {
    id: 797,
    name: "Singapore fintech summit",
    traveller: people[4]!,
    destination: "SIN",
    start: "2026-09-21T00:00:00.000Z",
    end: "2026-09-25T00:00:00.000Z",
    purpose: "Conference",
    department: "Finance",
    hotel: { name: "Hotel Jen Orchardgateway", nights: 4, total: 3080, ref: "JEN-55018" },
    status: "Cancelled",
    approver: saif,
  },
];
