import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({providedIn:'root'})
export class AirlinesService {
  private base = `${environment.apiBase}/airlines`;
  constructor(private http: HttpClient) {}

  getAll(params?: {page?:number; size?:number; q?:string}) {
    let p = new HttpParams();
    if (params?.page!=null) p = p.set('page', params.page);
    if (params?.size!=null) p = p.set('size', params.size);
    if (params?.q) p = p.set('q', params.q);
    return this.http.get<any[]>(this.base, { params: p });
  }
  getById(id: string){ return this.http.get<any>(`${this.base}/${id}`); }
  create(body: any){ return this.http.post<any>(this.base, body); }       // admin
  update(id: string, body: any){ return this.http.put<any>(`${this.base}/${id}`, body); }
  remove(id: string){ return this.http.delete<void>(`${this.base}/${id}`); }
  getAirplanes(airlineId: string){ return this.http.get<any[]>(`${this.base}/${airlineId}/airplanes`); }
  getFlights(airlineId: string){ return this.http.get<any[]>(`${this.base}/${airlineId}/flights`); }
  getTickets(airlineId: string){ return this.http.get<any[]>(`${this.base}/${airlineId}/tickets`); }
  getRoutes(airlineId: string){ return this.http.get<any[]>(`${this.base}/${airlineId}/routes`); }
}
