import { Component, signal } from '@angular/core';
import { SearchbarComponent } from './searchbar.component';
import { ResultsListComponent } from './results-list.component';
import { FlightSearchService } from './flight-search.service';
import { FlightSearchParams, FlightSearchResponse, FlightResult, AirportDTO } from '../core/flight.models';

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
    this.flightService.search(q, 0, 20).subscribe({
      next: (res: FlightSearchResponse) => {
        this.results = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: e => {
        this.error = e?.error?.message || 'Errore';
        this.loading = false;
      }
    });
  }
}