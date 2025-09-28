export const CABINS = ['ECONOMY', 'BUSINESS', 'FIRST', 'FIRST CLASS'] as const;
export type Cabin = typeof CABINS[number];

export function toCabin(v: any): Cabin {
  const up = String(v ?? 'ECONOMY').toUpperCase();
  return (CABINS as readonly string[]).includes(up) ? (up as Cabin) : 'ECONOMY';
}

export interface AirlineDTO {
  id?: string;
  code?: string;
  name?: string;
  logo?: string;
}

export interface AirportDTO {
  id?: string;
  code: string;
  city?: string;
  country?: string;
  name?: string;
}

export interface FlightBase {
  id: string;
  code: string;
  arrival?: string;
  departure?: string;
  duration?: number;
  airline?: AirlineDTO;
  route?: { from?: AirportDTO; to?: AirportDTO; code?: string };
}

export interface Itinerary extends FlightBase {
  flight1?: FlightBase;
  flight2?: FlightBase;
  numStops?: number;
  finalArrival?: string;
  totDuration?: number;
}

export interface FlightSearchParams {
  id?: string;
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  pax: number;
  cabin: Cabin;
  onlyDirect?: boolean
}

export interface TicketDTO {
  type?: string;
  quantity?: number;
  cabin?: string;
  available?: number;
  price?: number;
  flight?: FlightBase;
  id?: string;
}

export type SegmentKey = 'flight1' | 'flight2';
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
