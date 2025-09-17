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
    return this.http.get<AirportDTO[]>(`${this.base}/airports`, { params });
  }

  search(body: FlightSearchParams, page = 0, size = 20): Observable<FlightSearchResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<FlightSearchResponse>(`${this.base}/flights/search`, body, { params });
  }
}
