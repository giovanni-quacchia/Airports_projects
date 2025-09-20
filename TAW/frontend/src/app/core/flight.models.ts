export const CABINS = ['ECONOMY', 'BUSINESS', 'FIRST', 'FIRST CLASS'] as const;
export type Cabin = typeof CABINS[number];

export function toCabin(v: any): Cabin {
  const up = String(v ?? 'ECONOMY').toUpperCase();
  return (CABINS as readonly string[]).includes(up) ? (up as Cabin) : 'ECONOMY';
}

export interface AirlineDTO {
  _id?: string;
  code?: string;
  name?: string;
  logo?: string;
}

export interface AirportDTO {
  _id?: string;
  code: string;
  city?: string;
  country?: string;
  name?: string;
}

export interface FlightBase {
  _id: string;
  code: string;
  arrival?: string;
  departure?: string;
  duration?: number;
  airline?: AirlineDTO; // <-- AGGIUNTO
  route?: {
    from?: AirportDTO;
    to?: AirportDTO;
  };
}

export interface Itinerary extends FlightBase {
  stop1?: FlightBase;
  stop2?: FlightBase;
  numStops?: number;
  finalArrival?: string;
  totDuration?: number;
}

export interface FlightSearchParams {
  _id?: string;
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  pax: number;
  cabin: Cabin;
  onlyDirect?: boolean
}

// compatibilità ticket
export interface TicketDTO {
  type?: string;
  quantity?: number;
  cabin?: string;
  available?: number;
  price?: number;
  flight?: FlightBase;
  _id?: string;
}

export type SegmentKey = 'main' | 'stop1' | 'stop2';
export type TicketsBySegment = Partial<Record<SegmentKey, TicketDTO[]>>;

export interface FlightResult extends Itinerary {
  ticketsBySegment?: TicketsBySegment;
  matchedTicketsBySegment?: TicketsBySegment;
}

export interface FlightSearchResponse {
  items: FlightResult[];
  total: number;
}

export const normalizeTicket = (t: TicketDTO): TicketDTO => ({
  ...t,
  type: (t.type ?? t.cabin ?? '').toString().trim().toUpperCase(),
  quantity: Number(t.quantity ?? t.available ?? 0),
});
