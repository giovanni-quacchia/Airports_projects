import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { FlightSearchParams, FlightResult, TicketDTO} from '../core/flight.models';
import { environment } from '../../environments/environment';

@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(mins?: number|null): string {
    if (mins == null) return '';
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h}h ${m}m`;
  }
}
 
@Component({
  selector: 'taw-results-list',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, DurationPipe, RouterLink],
  template: `
  <div class="filters" *ngIf="query">
    <span class="badge">Passeggeri: {{query.pax}}</span>
    <span class="badge">Classe: {{query.cabin}}</span>
  </div>

  <div *ngIf="query && sortedResults().length === 0" class="card no-results-card">
    No results found.
  </div>

  <article class="card" *ngFor="let r of sortedResults(); trackBy: trackRes">
    <header class="head">
      <!-- <div class="carrier">
        <img
          class="carrier-logo"
          [src]="logoOf(r)"
          (error)="onLogoError($event)"
          [alt]="(r.airline?.name || r.airline?.code || 'Airline') + ' logo'"
          loading="lazy"
          decoding="async"
        />
        <span class="carrier-name">
          {{ r.airline?.name || r.airline?.code || '—' }}
        </span>
        <small *ngIf="query?.cabin">· {{ query?.cabin }}</small>
      </div> -->

      <div class="badges">
        <span class="chip" [class.green]="!r.numStops">
          {{ r.numStops ? (r.numStops + ' scali') : 'Diretto' }}
        </span>
        <span class="chip light" *ngIf="r.totDuration">
          Totale: {{ r.totDuration | duration }}
        </span>
      </div>
    </header>

    <section class="segments">
      <ng-container *ngFor="let s of segmentsOf(r); let i = index; let last = last">
        <!-- logo -->
        <div class="carrier">
          <img
            class="carrier-logo"
            [src]="logoOf(r)"
            (error)="onLogoError($event)"
            [alt]="(r.airline?.name || r.airline?.code || 'Airline') + ' logo'"
            loading="lazy"
            decoding="async"
          />
          <span class="carrier-name">
            {{ r.airline?.name || r.airline?.code || '—' }}
          </span>
          <small *ngIf="query?.cabin">· {{ query?.cabin }}</small>
        </div>
        <!-- logo -->  
        <div class="segment">
            
          <div class="when left">
            <div class="dow">{{ s.departure | date:'EEEE' }}</div>
            <div class="day">{{ s.departure | date:'dd' }}</div>
            <div class="month">{{ s.departure | date:'MMMM' }}</div>
            <div class="year">{{ s.departure | date:'yyyy' }}</div>
            <div class="hour">{{ s.departure | date:'HH:mm' }}</div>
          </div>

          <div class="timeline">
            <div class="dot"></div>
            <div class="line"><mat-icon>flight_takeoff</mat-icon></div>
            <div class="dot end"></div>
          </div>

          <div class="when right">
            <div class="dow">{{ s.arrival | date:'EEEE' }}</div>
            <div class="day">{{ s.arrival | date:'dd' }}</div>
            <div class="month">{{ s.arrival | date:'MMMM' }}</div>
            <div class="year">{{ s.arrival | date:'yyyy' }}</div>
            <div class="hour">{{ s.arrival | date:'HH:mm' }}</div>
          </div>

          <div class="route">
            <div class="airports">
              {{ s.route.from.city }} ({{ s.route.from.code }}) → {{ s.route.to.city }} ({{ s.route.to.code }})
            </div>
            <div class="meta">
              {{ s.duration | duration }} · {{ r.airline?.name || ' ' }} · {{ s.code || '' }}
            </div>
          </div>

          <div class="seg-tickets" [ngSwitch]="i">


            <!-- Stop1 -->
            <ng-container *ngSwitchCase="1">
              <ng-container *ngIf="hasTickets(r,'flight1')">
                  <ng-container *ngIf="lowestTicket(r,'flight1') as t">
                    <span class="seg-price">€ {{ t.price || 0 | number:'1.0-0' }}</span>
                    <small class="seg-qty">{{ t.quantity }} posti</small>
                  </ng-container>
              </ng-container>
            </ng-container>

            <!-- Stop2 -->
            <ng-container *ngSwitchCase="2">
              <ng-container *ngIf="hasTickets(r,'flight2')">
                  <ng-container *ngIf="lowestTicket(r,'flight2') as t">
                    <span class="seg-price">€ {{ t.price || 0 | number:'1.0-0' }}</span>
                    <small class="seg-qty">{{ t.quantity }} posti</small>
                  </ng-container>
              </ng-container>
            </ng-container>
          </div>
        </div>

        <div class="layover" *ngIf="!last">
          <mat-icon>schedule</mat-icon>
          Scalo a {{ segmentsOf(r)[i].route.to.city }} ({{ segmentsOf(r)[i].route.to.code }})
          · {{ layoverMinutes(segmentsOf(r)[i], segmentsOf(r)[i+1]) | duration }}
        </div>
      </ng-container>
    </section>

    <footer class="foot">
      <div class="total">
        <span *ngIf="totalPrice(r) as tp">Totale: <strong>€ {{ tp | number:'1.0-0' }}</strong></span>
      </div>
      <div class="actions">
        <button
          class="cta primary"
          [routerLink]="['/purchase']"
          [state]="{ flight: buildPurchaseFlight(r) }">
          Acquista
        </button>
      </div>
    </footer>
  </article>
  `,
  styles: [`
    .no-results-card {
      margin: 0 0 16px 0;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,.06);
      padding: 16px;
      text-align: center;
    }
    .filters{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 16px }
    .badge{ padding:6px 10px; border-radius:999px; background:#eef6ff; font-size:.85rem }
    .card{ background:#fff; border-radius:18px; box-shadow:0 12px 30px rgba(0,0,0,.06);
           padding:16px; margin-bottom:16px }
    .head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
    .carrier-name{ font-weight:600; font-size:1.05rem; }
    .carrier small{ margin-left:6px; opacity:.7; font-weight:400; }
    .carrier-logo{
      margin-top: 10px;
      height:22px; width:auto; object-fit:contain;
      filter: drop-shadow(0 1px 0 rgba(0,0,0,.04));
    }
    .badges{ display:flex; gap:8px; align-items:center }
    .chip{ padding:4px 10px; border-radius:999px; background:#f3f4f6; font-size:.85rem }
    .chip.green{ background:#dcfce7; color:#166534 }
    .chip.light{ background:#eef2ff; color:#3730a3 }
    .segments{ display:flex; flex-direction:column; gap:12px }
    .segment{
      position: relative;
      display:grid; grid-template-columns: 180px 1fr 180px;
      gap:16px; align-items:center; padding:14px 12px;
      border-radius:14px; background:#f8fafc;
    }
    .when{ display:grid; grid-template-areas:
            "dow" "day" "month" "year" "hour";
           gap:2px; text-transform:capitalize }
    .when .dow{ grid-area:dow; font-size:.85rem; color:#6b7280 }
    .when .day{ grid-area:day; font-size:2.1rem; font-weight:800; line-height:1 }
    .when .month{ grid-area:month; letter-spacing:.3px }
    .when .year{ grid-area:year; color:#6b7280; font-size:.9rem }
    .when .hour{ grid-area:hour; font-weight:700 }
    .when.right{ text-align:right }
    .timeline{ display:grid; grid-template-columns:16px 1fr 16px; align-items:center; gap:6px }
    .dot{ width:10px; height:10px; border-radius:999px; background:#0ea5e9 }
    .timeline .line{ height:4px; background:#0ea5e922; border-radius:999px; display:flex; align-items:center; justify-content:center }
    .timeline mat-icon{ font-size:20px; width:20px; height:20px }
    .route{ grid-column:1 / -1; display:flex; flex-direction:column; gap:2px; margin-top:6px }
    .airports{ font-weight:700 }
    .meta{ color:#6b7280; font-size:.9rem }
    .seg-price{
      position:absolute; right:12px; bottom:10px;
      font-weight:700; color:#0f172a; background:#ffffffc7;
      padding:4px 8px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,.06);
    }
    .layover{ display:flex; align-items:center; gap:6px; color:#6b7280; font-size:.9rem; padding:6px 2px }
    .foot{ display:flex; align-items:center; justify-content:space-between; margin-top:12px }
    .total{ color:#0f172a; font-size:1rem }
    .total strong{ font-size:1.05rem }
    .cta{
      appearance:none; border:0; cursor:pointer;
      border-radius:999px; padding:10px 18px; font-weight:600;
      transition: filter .15s ease, transform .02s ease;
    }
    .cta.primary{ background:#0ea5e9; color:#fff; }
    .cta.ghost{ background:#e2e8f0; color:#0f172a; }
    .cta:hover{ filter:brightness(.95) }
    .cta:active{ transform:translateY(1px) }
  `]
})

export class ResultsListComponent {
  @Input() results: FlightResult[] = [];
  @Input() query: FlightSearchParams | null = null;
  private readonly FALLBACK_LOGO = '';
  private base = environment.apiBase;
  private readonly SEG_KEYS = ['flight1','flight2'] as const;

  constructor(private http: HttpClient) {}

  /** Prodotto cartesiano per tutte le combinazioni di ticket */
  private cartesian<T>(...arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, arr) => acc.flatMap(a => arr.map(v => [...a, v])),
      [[]]
    );
  }

  private expandByTickets(r: FlightResult): (FlightResult & { __ticket?: TicketDTO; __key: string })[] {
    const allTickets = r.matchedTicketsBySegment ?? (r as any).ticketsBySegment ?? {};

    // prendo i ticket per ciascun segmento
    const segTickets: TicketDTO[][] = this.SEG_KEYS.map(k => (allTickets?.[k] ?? []) as TicketDTO[]);

    // se non c’è nessun ticket, ritorno il volo così com’è
    if (segTickets.every(list => list.length === 0)) {
      return [{ ...(r as any), __key: `${(r as any)?._id || r.code || Math.random()}` }];
    }

    // calcolo tutte le combinazioni
    const combos = this.cartesian(...segTickets.map(l => l.length ? l : [null as any]));

    return combos.map(combo => {
      const perTicket: any = {};
      this.SEG_KEYS.forEach((k, i) => {
        perTicket[k] = combo[i] ? [combo[i]] : [];
      });

      return {
        ...(r as any),
        matchedTicketsBySegment: perTicket,
        __ticket: combo.find(Boolean) ?? null,
        __key: `${(r as any)?._id || r.code || 'r'}::${combo.map(c => c?._id || c?.type || c?.price).join('-')}`
      };
    });
  }

  private expandedResults(): (FlightResult & { __ticket?: TicketDTO; __key: string })[] {
    const src = Array.isArray(this.results) ? this.results : [];
    return src.flatMap(r => this.expandByTickets(r));
  }

  sortedResults(): FlightResult[] {
    const arr = this.expandedResults();
    arr.sort((a, b) => {
      const pa = this.totalPrice(a);
      const pb = this.totalPrice(b);
      const aa = pa == null ? Number.POSITIVE_INFINITY : pa;
      const bb = pb == null ? Number.POSITIVE_INFINITY : pb;
      if (aa !== bb) return aa - bb;
      const da = a?.totDuration ?? 0;
      const db = b?.totDuration ?? 0;
      return da - db;
    });
    return arr;
  }

  trackRes(_: number, r: any) {
    return r?.__key || r?._id || r?.id || r?.code || _;
  }

  segmentsOf(r: any): any[] {
    const segs = [r];
    if (r.flight1) segs.push(r.flight1);
    if (r.flight2) segs.push(r.flight2);
    if (r.flight3) segs.push(r.flight3);
    return segs;
  }

  layoverMinutes(a: any, b: any): number {
    const t = new Date(b.departure).getTime() - new Date(a.arrival).getTime();
    return Math.max(0, Math.round(t / 60000));
  }

  logoOf(r: any): string {
    const url = r?.airline?.logo?.trim?.();
    return url && url.length ? url : this.FALLBACK_LOGO;
  }

  onLogoError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.FALLBACK_LOGO) {
      img.src = this.FALLBACK_LOGO;
    } else {
      img.style.display = 'none';
    }
  }

  tickets(r: FlightResult, key: 'flight1'|'flight2'): TicketDTO[] {
    return (r?.matchedTicketsBySegment?.[key] ?? []) as TicketDTO[];
  }
  hasTickets(r: FlightResult, key: 'flight1'|'flight2'): boolean {
    return this.tickets(r, key).length > 0;
  }

  lowestTicket(r: FlightResult, key: 'flight1'|'flight2'): TicketDTO | null {
    const list = this.tickets(r, key);
    if (!list.length) return null;
    return [...list].sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0] || null;
  }
  private lowestPrice(r: FlightResult, key:'flight1'|'flight2'): number|null {
    const t = this.lowestTicket(r, key);
    return typeof t?.price === 'number' ? t!.price! : null;
  }

  totalPrice(r: FlightResult): number | null {
    const parts = this.SEG_KEYS.filter(k => this.hasTickets(r, k));
    if (!parts.length) return null;
    let total = 0;
    for (const k of parts) {
      const p = this.lowestPrice(r, k);
      if (p == null) return null;
      total += p;
    }
    return total > 0 ? total : null;
  }

  buildPurchaseFlight(r: FlightResult): FlightResult {
    const segs: any[] = [];
    segs.push(r);
    if (r.flight1) segs.push(r.flight1);
    if (r.flight2) segs.push(r.flight2);

    const first = segs[0] ?? r;
    const last  = segs[segs.length - 1] ?? r;

    const route = r.route ?? {
      from: first?.route?.from,
      to:   last?.route?.to,
    };

    const departure = r.departure ?? first?.departure ?? null;
    const arrival   = r.finalArrival ?? r.arrival ?? last?.arrival ?? null;

    let totDuration = typeof r.totDuration === 'number' ? r.totDuration : undefined;
    if (totDuration == null) {
      const sum = segs.reduce((acc, s) => acc + (typeof s?.duration === 'number' ? s.duration : 0), 0);
      if (sum > 0) totDuration = sum;
      else if (departure && arrival) totDuration = Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000);
      else totDuration = 0;
    }

    const matchedTicketsBySegment = r.matchedTicketsBySegment ?? (r as any).ticketsBySegment ?? {};

    return {
      ...r,
      route,
      departure,
      arrival,
      totDuration,
      matchedTicketsBySegment
    } as FlightResult;
  }
}
