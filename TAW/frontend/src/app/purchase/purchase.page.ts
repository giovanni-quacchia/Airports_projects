import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { DebugPanelComponent } from '../core/debug-panel.component';

type SegmentKey = 'main' | 'stop1' | 'stop2';
interface AirportDTO { code: string; city?: string; name?: string; country?: string; }
interface FlightBase {
  _id: string; code: string;
  departure?: string | Date; arrival?: string | Date; duration?: number;
  route?: { from?: AirportDTO; to?: AirportDTO };
  airline?: { name?: string; code?: string; logo?: string };
}
interface TicketDTO { type?: string; quantity?: number; price?: number; }
interface FlightResult extends FlightBase {
  stop1?: FlightBase; stop2?: FlightBase;
  totDuration?: number; finalArrival?: string | Date;
  matchedTicketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
  ticketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
}

@Component({
  standalone: true,
  selector: 'taw-purchase-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DebugPanelComponent],
  template: `
    <div class="container">
      <a routerLink="/search" class="back">← Torna ai risultati</a>
      <h1>Riepilogo acquisto</h1>

      <ng-container *ngIf="flight; else missing">
        <section class="card">
          <h2>{{ airlineName }} — {{ flightCode }}</h2>
          <p>
            {{ originCode }} → {{ destinationCode }}<br>
            Partenza: {{ departTime | date:'short' }}<br>
            Arrivo:   {{ arriveTime | date:'short' }}<br>
            Durata:   {{ totalDuration }} min
          </p>
          <p class="price">Prezzo: {{ priceDisplay }}</p>
        </section>

        <form [formGroup]="form" (ngSubmit)="onPay()">
          <h3>Dati passeggero</h3>
          <div class="grid">
            <label>Nome <input formControlName="firstName" required /></label>
            <label>Cognome <input formControlName="lastName" required /></label>
            <label>Email <input formControlName="email" type="email" required /></label>
          </div>

          <h3>Pagamento</h3>
          <div class="grid">
            <label>Numero carta
              <input formControlName="cardNumber" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" required />
            </label>
            <label>Scadenza (MM/YY)
              <input formControlName="exp" placeholder="12/30" required />
            </label>
            <label>CVC
              <input formControlName="cvc" inputmode="numeric" maxlength="4" required />
            </label>
          </div>

          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Elaborazione…' : 'Paga e conferma' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">Acquisto completato! Controlla la tua email per la conferma.</p>
        </form>
      </ng-container>

      <ng-template #missing>
        <p>Nessun volo selezionato. Torna alla <a routerLink="/search">ricerca</a>.</p>
      </ng-template>
    </div>
    <taw-debug-panel [flight]="flight"></taw-debug-panel>
  `,
  styles: [`
    .container{max-width:960px;margin:24px auto;padding:0 16px}
    .card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-bottom:16px;background:#fff}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    label{display:flex;flex-direction:column;font-weight:600}
    input{border:1px solid #cbd5e1;border-radius:10px;padding:10px;margin-top:6px}
    .price{font-size:18px;font-weight:700}
    .btn{margin-top:16px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:10px 16px;cursor:pointer}
    .error{color:#b42318;margin-top:12px}
    .success{color:#027a48;margin-top:12px}
    .back{display:inline-block;margin-bottom:16px;text-decoration:none}
    @media (max-width: 800px){ .grid{grid-template-columns:1fr} }
  `]
})
export class PurchasePage implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  flight: FlightResult | null = null;
  loading = false;
  error = '';
  success = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    cardNumber:['', [Validators.required, Validators.minLength(12)]],
    exp:       ['', Validators.required],
    cvc:       ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const s1 = (nav?.extras?.state as any)?.flight;
    const s2 = this.isBrowser ? (window as any)?.history?.state?.flight : null;
    const raw = (s1 ?? s2) || null;

    this.flight = raw ? this.normalizeForPurchase(raw) : null; // 👈 normalizza SEMPRE
  }

  // ---- normalizza: route/orari/durata anche se mancano dal root
  private normalizeForPurchase(f: any): FlightResult {
    const segs: FlightBase[] = [];
    if (f) {
      segs.push(f);
      if (f.stop1) segs.push(f.stop1);
      if (f.stop2) segs.push(f.stop2);
    }
    const first = segs[0] ?? f;
    const last  = segs[segs.length - 1] ?? f;

    const route = f?.route ?? { from: first?.route?.from, to: last?.route?.to };
    const departure = f?.departure ?? first?.departure ?? null;
    const arrival   = f?.finalArrival ?? f?.arrival ?? last?.arrival ?? null;

    let totDuration: number;
    if (typeof f?.totDuration === 'number') {
      totDuration = f.totDuration;
    } else {
      const sum = segs.reduce((acc, s) => acc + (typeof s?.duration === 'number' ? s.duration : 0), 0);
      if (sum > 0) totDuration = sum;
      else if (departure && arrival) totDuration = Math.round((new Date(arrival).getTime() - new Date(departure).getTime())/60000);
      else totDuration = 0;
    }

    return {
      ...f,
      route,
      departure,
      arrival,
      totDuration,
      matchedTicketsBySegment: f?.matchedTicketsBySegment ?? f?.ticketsBySegment ?? {}
    } as FlightResult;
  }

  // ---- getters per il template
  private segments(): FlightBase[] {
    if (!this.flight) return [];
    const arr: FlightBase[] = [this.flight];
    if (this.flight.stop1) arr.push(this.flight.stop1);
    if (this.flight.stop2) arr.push(this.flight.stop2);
    return arr;
  }
  private firstSeg(): FlightBase | null { const s = this.segments(); return s[0] ?? null; }
  private lastSeg(): FlightBase  | null { const s = this.segments(); return s[s.length-1] ?? null; }

  get airlineName(): string { return this.flight?.airline?.name || this.flight?.airline?.code || 'Compagnia'; }
  get flightCode(): string { return this.flight?.code || this.firstSeg()?.code || ''; }
  get originCode(): string { return this.flight?.route?.from?.code || this.firstSeg()?.route?.from?.code || ''; }
  get destinationCode(): string {
    return this.flight?.route?.to?.code || this.lastSeg()?.route?.to?.code || '';
  }
  get departTime(): string | Date | null { return this.firstSeg()?.departure || this.flight?.departure || null; }
  get arriveTime(): string | Date | null { return this.lastSeg()?.arrival || this.flight?.finalArrival || this.flight?.arrival || null; }

  get totalDuration(): number {
    if (typeof this.flight?.totDuration === 'number') return this.flight!.totDuration!;
    const segs = this.segments();
    const sum = segs.reduce((acc, s) => acc + (typeof s?.duration === 'number' ? s.duration! : 0), 0);
    if (sum > 0) return sum;
    const d = this.departTime ? new Date(this.departTime).getTime() : NaN;
    const a = this.arriveTime ? new Date(this.arriveTime).getTime() : NaN;
    if (!isNaN(d) && !isNaN(a) && a > d) return Math.round((a - d) / 60000);
    return 0;
  }

  private ticketsFor(key: SegmentKey): TicketDTO[] {
    const src = this.flight?.matchedTicketsBySegment ?? this.flight?.ticketsBySegment ?? {};
    return (src?.[key] ?? []) as TicketDTO[];
  }
  private minPrice(key: SegmentKey): number | null {
    const arr = this.ticketsFor(key);
    if (!arr.length) return null;
    let min = Number.POSITIVE_INFINITY;
    for (const t of arr) {
      const p = Number(t?.price ?? NaN);
      if (!isNaN(p) && p < min) min = p;
    }
    return isFinite(min) ? min : null;
  }
  get computedPrice(): number | null {
    if (!this.flight) return null;
    const keys: SegmentKey[] = ['main', ...(this.flight.stop1 ? ['stop1'] as const : []), ...(this.flight.stop2 ? ['stop2'] as const : [])];
    let total = 0;
    for (const k of keys) {
      const m = this.minPrice(k);
      if (m == null) return null;
      total += m;
    }
    return total > 0 ? total : null;
  }
  get priceDisplay(): string {
    const p = this.computedPrice;
    return p != null
      ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p)
      : '—';
  }

  onPay() {
    if (this.form.invalid || !this.flight) return;
    this.loading = true; this.error = ''; this.success = false;

    const sel = {
      main:  this.ticketsFor('main').sort((a,b)=> (a.price||0)-(b.price||0))[0] || null,
      stop1: this.flight.stop1 ? (this.ticketsFor('stop1').sort((a,b)=> (a.price||0)-(b.price||0))[0] || null) : null,
      stop2: this.flight.stop2 ? (this.ticketsFor('stop2').sort((a,b)=> (a.price||0)-(b.price||0))[0] || null) : null,
    };

    const api = (environment as any).api || (environment as any).apiBase || '/api';
    const payload = {
      flightId: this.flight._id,
      itinerary: this.flight,
      selectedTickets: sel,
      totalPrice: this.computedPrice,
      passenger: this.form.value,
    };

    this.http.post(`${api}/bookings`, payload).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (e) => { this.error = (e?.error?.message) || 'Pagamento non riuscito'; this.loading = false; }
    });
  }
}
