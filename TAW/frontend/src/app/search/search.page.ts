import { Component, signal } from '@angular/core';
import { SearchbarComponent } from './searchbar.component';
import { ResultsListComponent } from './results-list.component';
import { FlightSearchService } from './flight-search.service';
import { FlightSearchParams, FlightSearchResponse, FlightResult, AirportDTO } from '../core/flight.models';
import { switchMap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'taw-search-page',
  standalone: true,
  imports: [SearchbarComponent, ResultsListComponent],
  template: `
    <taw-searchbar (search)="onSearch($event)"></taw-searchbar>
    <taw-results-list [results]="results" [query]="lastQuery"></taw-results-list>
  `,
})
export class SearchPage {
  loading = false;
  error = '';
  results: FlightResult[] = [];
  total = 0;
  lastQuery: FlightSearchParams | null = null;

  constructor(private flightService: FlightSearchService) {}

  onSearch(q: FlightSearchParams) {
  this.loading = true;
  this.error = '';
  this.lastQuery = q;

  this.flightService.search(q, 0, 20).pipe(
    switchMap((flights: any[]) => {
      // Per ogni volo trovato, faccio la chiamata ai tickets
      const requests = flights.map(flight =>
        this.flightService.searchTickets(
          { ...q, _id: flight._id }, // passo query + id volo
        ).pipe(
          map(tickets => ({ ...flight, tickets })) // arricchisco volo con i suoi tickets
        )
      );
      return forkJoin(requests); // attendo tutte le chiamate
    })
  ).subscribe({
    next: (flightsWithTickets) => {
      this.results = flightsWithTickets;
      this.loading = false;
    },
    error: e => {
      this.error = e?.error?.message || 'Errore';
      this.loading = false;
    }
  });
}

}