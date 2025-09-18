// src/app/search/flight-search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FlightSearchParams, FlightSearchResponse, AirportDTO } from '../core/flight.models';

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  airports(q: string) {
    const params = new HttpParams().set('q', q || '');
    return this.http.get<AirportDTO[]>(`${this.base}/airports`, {params});
  }

  search(body: FlightSearchParams, page = 0, size = 20){
    const params = new HttpParams().set('from', body.from).set('to', body.to).set('fromDate',body.departDate).set('toDate',body.returnDate);
    return this.http.get<AirportDTO[]>(`${this.base}/itineraries`, { params });
  }
  searchTickets(body: FlightSearchParams, page = 0, size = 20){
    const params = new HttpParams().set('type', body.cabin).set('quantity',body.pax)
    return this.http.get<AirportDTO[]>(`${this.base}/flights/${body._id}/tickets`, { params });
  }

}
