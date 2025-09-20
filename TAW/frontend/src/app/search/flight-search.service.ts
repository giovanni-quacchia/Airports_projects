import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FlightSearchParams, FlightResult, AirportDTO, TicketDTO } from '../core/flight.models';

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  // autocomplete aeroporti (nome "canonico")
  getAirports(q: string): Observable<AirportDTO[]> {
    const params = new HttpParams().set('q', q || '');
    return this.http.get<AirportDTO[]>(`${this.base}/airports`, { params });
  }
  // alias per compatibilità con il componente che chiama "airports"
  airports(q: string) { return this.getAirports(q); }

  // ricerca voli
  search(body: FlightSearchParams, page = 0, size = 20): Observable<FlightResult[]> {
    let params = new HttpParams();
    const entries: Record<string, any> = {
      from: body.from,
      to: body.to,
      fromDate: body.departDate,
      toDate: body.returnDate,
      onlyDirect: body.onlyDirect === true ? 'true' : 'false',
      page,
      size,
    };
    Object.entries(entries).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<FlightResult[]>(`${this.base}/itineraries`, { params });
  }

  // tickets per volo
  searchTickets(body: FlightSearchParams) {
    console.log('[tickets] params →', body);
    const params = new HttpParams()
      .set('type', String(body.cabin ?? ''))
      .set('minQuantity', String(body.pax ?? 1));
    return this.http.get<TicketDTO[]>(`${this.base}/flights/${body._id}/tickets`, { params });
  }
}
