export type Cabin = 'economy' | 'premium' | 'business' | 'first';

export interface FlightSearchParams {
  _id: string
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  pax: number;
  cabin: Cabin;
}

export interface AirportDTO {
  code: string;
  city: string;
  name?: string;
  country?: string;
}


export interface FlightResult {
  id: string;
  carrier: string;
  number: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  durationMinutes: number;
  cabin: Cabin;
  price: number;
}

export interface FlightSearchResponse {
  items: FlightResult[];
  total: number;
}
