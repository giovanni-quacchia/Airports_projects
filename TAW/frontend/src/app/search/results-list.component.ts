import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FlightSearchParams } from '../core/flight.models';

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
  imports: [CommonModule, DatePipe, MatIconModule, DurationPipe],
  template: `
  <!-- FILTRI (niente "Andata e ritorno") -->
  <div class="filters" *ngIf="query">
    <span class="badge">Passeggeri: {{query.pax}}</span>
    <span class="badge">Classe: {{query.cabin}}</span>
  </div>

  <article class="card" *ngFor="let r of results">
    <header class="head">
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

      <div class="badges">
        <span class="chip" [class.green]="!r.numStops">
          {{ r.numStops ? (r.numStops + ' scali') : 'Diretto' }}
        </span>
        <span class="chip light" *ngIf="r.totDuration">
          Totale: {{ r.totDuration | duration }}
        </span>
      </div>
    </header>


    <!-- SEGMENTI -->
    <section class="segments">
      <ng-container *ngFor="let s of segmentsOf(r); let i = index; let last = last">
        <div class="segment">
          <!-- left date -->
          <div class="when left">
            <div class="dow">{{ s.departure | date:'EEEE' }}</div>
            <div class="day">{{ s.departure | date:'dd' }}</div>
            <div class="month">{{ s.departure | date:'MMMM' }}</div>
            <div class="year">{{ s.departure | date:'yyyy' }}</div>
            <div class="hour">{{ s.departure | date:'HH:mm' }}</div>
          </div>

          <!-- timeline -->
          <div class="timeline">
            <div class="dot"></div>
            <div class="line"><mat-icon>flight_takeoff</mat-icon></div>
            <div class="dot end"></div>
          </div>

          <!-- right date -->
          <div class="when right">
            <div class="dow">{{ s.arrival | date:'EEEE' }}</div>
            <div class="day">{{ s.arrival | date:'dd' }}</div>
            <div class="month">{{ s.arrival | date:'MMMM' }}</div>
            <div class="year">{{ s.arrival | date:'yyyy' }}</div>
            <div class="hour">{{ s.arrival | date:'HH:mm' }}</div>
          </div>

          <!-- route + meta -->
          <div class="route">
            <div class="airports">
              {{ s.route.from.city }} ({{ s.route.from.code }}) → {{ s.route.to.city }} ({{ s.route.to.code }})
            </div>
            <div class="meta">
              {{ s.duration | duration }} · {{ r.airline?.name || ' ' }} · {{ s.code || '' }}
            </div>
          </div>

          <!-- prezzo segmento (in basso a destra di ogni scalo/segmento) -->
          <div class="seg-price" *ngIf="priceOf(s) as p">€ {{ p | number:'1.0-0' }}</div>
        </div>

        <!-- SCALO -->
        <div class="layover" *ngIf="!last">
          <mat-icon>schedule</mat-icon>
          Scalo a {{ segmentsOf(r)[i].route.to.city }} ({{ segmentsOf(r)[i].route.to.code }})
          · {{ layoverMinutes(segmentsOf(r)[i], segmentsOf(r)[i+1]) | duration }}
        </div>
      </ng-container>
    </section>

    <!-- FOOTER: totale a sinistra, bottoni a destra (stile come "Cerca voli") -->
    <footer class="foot">
      <div class="total">
        <span *ngIf="totalPrice(r) as tp">Totale: <strong>€ {{ tp | number:'1.0-0' }}</strong></span>
      </div>
      <div class="actions">
        <button class="cta ghost">Salva</button>&nbsp;
        <button class="cta primary">Seleziona</button>
      </div>
    </footer>
  </article>
  `,
  styles: [`
    /* badges top */
    .filters{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 16px }
    .badge{ padding:6px 10px; border-radius:999px; background:#eef6ff; font-size:.85rem }

    .card{ background:#fff; border-radius:18px; box-shadow:0 12px 30px rgba(0,0,0,.06);
           padding:16px; margin-bottom:16px }
    .head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
    .carrier-name{ font-weight:600; font-size:1.05rem; }
    .carrier small{ margin-left:6px; opacity:.7; font-weight:400 }
      .carrier-logo{
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

    /* CTA come "Cerca voli" (pill blu) */
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
  @Input() results: any[] = [];
  @Input() query: FlightSearchParams | null = null;
  private readonly FALLBACK_LOGO = 'https://cdn.worldvectorlogo.com/logos/ryanair-1.svg';

  segmentsOf(r: any): any[] {
    const segs = [r];
    if (r.stop1) segs.push(r.stop1);
    if (r.stop2) segs.push(r.stop2);
    if (r.stop3) segs.push(r.stop3);
    return segs;
  }

  layoverMinutes(a: any, b: any): number {
    const t = new Date(b.departure).getTime() - new Date(a.arrival).getTime();
    return Math.max(0, Math.round(t / 60000));
  }

  priceOf(s: any): number|null {
    // adatta qui se i prezzi sono annidati (es. s.fare.price)
    return typeof s?.price === 'number' ? s.price : null;
  }

  totalPrice(r: any): number|null {
    if (typeof r?.price === 'number') return r.price; // se il backend fornisce il totale
    const sum = this.segmentsOf(r).reduce((acc, s) => acc + (this.priceOf(s) || 0), 0);
    return sum > 0 ? sum : null;
  }

  logoOf(r: any): string {
    const url = r?.airline?.logo?.trim?.();
    return url && url.length ? url : this.FALLBACK_LOGO;
  }

  onLogoError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    // evita loop infinito se anche il fallback fallisce
    if (img && img.src !== this.FALLBACK_LOGO) {
      img.src = this.FALLBACK_LOGO;
    } else {
      img.style.display = 'none'; // nascondi del tutto in caso estremo
    }
  }
}
