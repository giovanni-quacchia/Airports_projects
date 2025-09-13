import { Component, signal } from '@angular/core';
import { SearchbarComponent } from './searchbar.component';
import { ResultsListComponent } from './results-list.component';
import { FlightSearchService } from './flight-search.service';
import type { FlightSearchParams } from './searchbar.component';

@Component({
  selector: 'taw-search-page',
  standalone: true,
  imports: [SearchbarComponent, ResultsListComponent],
  template: `
    <taw-searchbar (search)="onSearch($event)"></taw-searchbar>
    <taw-results-list [results]="results()" [query]="lastQuery()"></taw-results-list>
  `,
})
export class SearchPage {
  readonly results = signal<any[]>([]);
  readonly lastQuery = signal<FlightSearchParams | null>(null);

  constructor(private api: FlightSearchService) {}

  onSearch(q: FlightSearchParams) {
    console.log('[SearchPage] query', q);
    this.lastQuery.set(q);
    this.api.search(q).subscribe(res => {
      console.log('[SearchPage] results', res);
      this.results.set(res);
    });
  }


}
 