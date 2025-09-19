import { Component } from '@angular/core';
import { SearchbarComponent } from './searchbar.component';
import { ResultsListComponent } from './results-list.component';
import { FlightSearchService } from './flight-search.service';

import { FlightSearchParams, FlightResult, TicketDTO, SegmentKey, normalizeTicket, toCabin } from '../core/flight.models';

import { switchMap, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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
  results: FlightResult[] = [];
  lastQuery: FlightSearchParams | null = null;
  loading = false;
  error: string | null = null;
  total = 0;

  constructor(private flightService: FlightSearchService) {}

  private norm(v: any): string {
    return (v ?? '').toString().trim().toUpperCase();
  }


  onSearch(ev: any) {
    const q: FlightSearchParams = {
      _id: ev._id, // ignorato se non c'è
      from: ev.from,
      to: ev.to,
      departDate: ev.departDate,
      returnDate: ev.returnDate,
      pax: Number(ev.pax ?? 1),
      cabin: toCabin(ev.cabin),
      onlyDirect: ev.onlyDirect
    };

    this.lastQuery = q;
    this.loading = true;
    this.error = null;

    this.flightService.search(q, 0, 20).pipe(
      switchMap((itins: FlightResult[]) => {
        if (!itins?.length) return of([]);

        return forkJoin(
          itins.map((itin) => {
            // segmenti presenti, chiavi come letterali
            const segments: { key: SegmentKey; id: string }[] = [
              { key: 'main' as const, id: itin._id },
              ...(itin.stop1 ? [{ key: 'stop1' as const, id: itin.stop1._id }] : []),
              ...(itin.stop2 ? [{ key: 'stop2' as const, id: itin.stop2._id }] : []),
            ];

            return forkJoin(
              segments.map(seg =>
                this.flightService.searchTickets({ ...q, _id: seg.id }).pipe(
                  map((tickets: TicketDTO[]) => ({
                    key: seg.key,
                    tickets: (tickets || []).map(normalizeTicket),
                  }))
                )
              )
            ).pipe(
              map(bySeg => {
                const ticketsBySegment = bySeg.reduce((acc, cur) => {
                  acc[cur.key] = cur.tickets;
                  return acc;
                }, {} as Record<SegmentKey, TicketDTO[] | undefined>);

                return { ...itin, ticketsBySegment } as FlightResult;
              })
            );
          })
        );
      }),
      map((itinsWithTickets: FlightResult[]) => {
        const wantClass = this.norm(q.cabin);         // "ECONOMY" | "BUSINESS" | "FIRST"/"FIRST CLASS"
        const wantQty = Number(q.pax ?? 1);

        const matchesTicket = (t: TicketDTO) =>
          this.norm(t.type) === wantClass && Number(t.quantity ?? 0) >= wantQty;

        const filtered = itinsWithTickets
          .filter(itin => {
            const presentSegs: SegmentKey[] = [
              'main',
              ...(itin.stop1 ? (['stop1'] as const) : []),
              ...(itin.stop2 ? (['stop2'] as const) : []),
            ];
            return presentSegs.every(k => (itin.ticketsBySegment?.[k] ?? []).some(matchesTicket));
          })
          .map(itin => {
            // console.log('[segments]', itin);
            const matched: Record<SegmentKey, TicketDTO[] | undefined> = {
              main: (itin.ticketsBySegment?.main ?? []).filter(matchesTicket),
              stop1: itin.stop1 ? (itin.ticketsBySegment?.stop1 ?? []).filter(matchesTicket) : undefined,
              stop2: itin.stop2 ? (itin.ticketsBySegment?.stop2 ?? []).filter(matchesTicket) : undefined,
            };
            return { ...itin, matchedTicketsBySegment: matched } as FlightResult;
          });

        this.total = filtered.length;
        return filtered;
      })
    ).subscribe({
      next: flights => { this.results = flights; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Errore'; this.loading = false; }
    });
  }
}
