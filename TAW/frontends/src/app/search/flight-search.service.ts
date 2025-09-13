import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type { FlightSearchParams } from './searchbar.component';
export interface FlightResult {
  carrier: string;
  cabin: string;
  price: number;
  durationMin: number;
  direct: boolean;
  departTime: string;   // "07:15"
  arriveTime: string;   // "09:05"
  origin: { city: string; code: string; };
  destination: { city: string; code: string; };
}

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  search(q: FlightSearchParams): Observable<FlightResult[]> {
    // MOCK: costruisco origin/destination dai campi utente
    const origin = parsePlace(q.from);        // es. "Milano (MXP)"
    const destination = parsePlace(q.to);     // es. "Barcellona (BCN)"

    const base: FlightResult = {
      carrier: 'Alpine Air',
      cabin: q.cabin,
      price: 82,
      durationMin: 110,
      direct: true,
      departTime: '07:15',
      arriveTime: '09:05',
      origin,
      destination,
    };

    const results = [
      base,
      { ...base, carrier: 'BluJet', price: 89, departTime: '10:40', arriveTime: '12:30' },
      { ...base, carrier: 'SkyWings', price: 96, departTime: '18:15', arriveTime: '20:05' },
    ];

    // (opzionale) se hai returnDate, potresti aggiungere una proprietà returnAvailable: true
    return of(results).pipe(delay(200));
  }
}

function parsePlace(input: string): { city: string; code: string } {
  // supporta "Città (CODE)" oppure solo "CODE"
  const m = input.match(/^(.*)\(([^)]+)\)\s*$/);
  if (m) {
    return { city: m[1].trim(), code: m[2].trim().toUpperCase() };
  }
  // fallback: se l’utente scrive solo "MXP"
  const codeOnly = input.trim().toUpperCase();
  return { city: input.replace(/\(.*/, '').trim() || codeOnly, code: codeOnly };
}
