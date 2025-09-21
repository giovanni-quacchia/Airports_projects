import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { Observable, of, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

type SegmentKey = 'main' | 'stop1' | 'stop2';
interface AirportDTO { code: string; city?: string; name?: string; country?: string; }
interface FlightBase {
  _id: string; code: string;
  departure?: string | Date; arrival?: string | Date; duration?: number;
  route?: { from?: AirportDTO; to?: AirportDTO };
  airline?: { name?: string; code?: string; logo?: string };
}
type SeatsBySegment = Partial<Record<SegmentKey, (string | null)[]>>;
interface TicketDTO { id?: string; _id?: string; type?: string; quantity?: number; price?: number; }
interface FlightResult extends FlightBase {
  stop1?: FlightBase; stop2?: FlightBase;
  totDuration?: number; finalArrival?: string | Date;
  matchedTicketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
  ticketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
}
type PurchaseResponse = { id?: string; _id?: string; [k: string]: any };

@Component({
  standalone: true,
  selector: 'taw-purchase-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <a routerLink="/search" class="back">← Torna ai risultati</a>
      <h1>Riepilogo acquisto</h1>

      <ng-container *ngIf="flight; else missing">
        <section class="card">
          <h2>{{ airlineName }} — {{ flightCode }}</h2>

          <p *ngIf="legs.length <= 1">
            {{ originCode }} → {{ destinationCode }}<br>
            Partenza: {{ departTime | date:'short' }}<br>
            Arrivo:   {{ arriveTime | date:'short' }}<br>
            Durata:   {{ totalDuration }} min
          </p>

          <div *ngIf="legs.length > 1" class="itinerary">
            <div *ngFor="let l of legs; let i = index" class="leg">
              <div class="leg__route">
                {{ l.from }} → {{ l.to }} <span class="muted">({{ l.code }})</span>
              </div>
              <div class="leg__meta">
                Partenza: {{ l.depart | date:'short' }} ·
                Arrivo: {{ l.arrive | date:'short' }}
                <ng-container *ngIf="l.duration != null"> · Durata: {{ l.duration }} min</ng-container>
              </div>
            </div>
            <div class="total muted" style="margin-top:6px">
              Totale: {{ originCode }} → {{ destinationCode }} · {{ totalDuration }} min
            </div>
          </div>

          <p class="price">Prezzo stimato: {{ priceDisplay }}</p>
        </section>

        <form [formGroup]="form" (ngSubmit)="onPay()">
          <h3>Dati passeggeri</h3>
          <div formArrayName="passengers" class="stack">
            <div *ngFor="let grp of passengers.controls; let i = index" [formGroupName]="i" class="card passenger">
              <div class="row">
                <label>Nome <input formControlName="firstName" required /></label>
                <label>Cognome <input formControlName="lastName" required /></label>
                <label>CF <input formControlName="cf" placeholder="Codice fiscale" /></label>
                <label>Passaporto <input formControlName="passportNumber" placeholder="Numero passaporto" /></label>
                <button type="button" class="icon-btn danger"
                        (click)="removePassenger(i)"
                        *ngIf="passengers.length > 1"
                        aria-label="Rimuovi passeggero">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6 7h12l-1 13H7L6 7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z"/></svg>
                  Rimuovi
                </button>
              </div>

              <div class="extras">
                <div class="extras__label">Extra</div>
                <div class="chips">
                  <button type="button" class="chip" [class.chip--active]="hasExtra(i, 'LARGER SEAT')" (click)="toggleExtra(i, 'LARGER SEAT')">LARGER SEAT</button>
                  <button type="button" class="chip" [class.chip--active]="hasExtra(i, 'PRIORITY')"   (click)="toggleExtra(i, 'PRIORITY')">PRIORITY</button>
                  <button type="button" class="chip" [class.chip--active]="hasExtra(i, 'EXTRA BAG')"  (click)="toggleExtra(i, 'EXTRA BAG')">EXTRA BAG</button>
                </div>
              </div>

              <div class="seats-summary" *ngIf="seatSummaryFor(i).length">
                <div class="muted">Posti assegnati:</div>
                <ul>
                  <li *ngFor="let s of seatSummaryFor(i)">{{ s }}</li>
                </ul>
              </div>
            </div>
          </div>

          <button type="button" class="btn btn--outline" (click)="addPassenger()">+ Aggiungi passeggero</button>

          <div class="actions">
            <button type="button" class="btn btn--secondary" (click)="goToSeatSelection()" [disabled]="passengers.length === 0">Seleziona posti</button>
            <button class="btn" type="submit" [disabled]="loading || passengers.invalid">
              {{ loading ? 'Elaborazione…' : 'Paga e conferma' }}
            </button>
          </div>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">Acquisto completato! Controlla la tua email per la conferma.</p>
        </form>
      </ng-container>

      <ng-template #missing>
        <p>Nessun volo selezionato. Torna alla <a routerLink="/search">ricerca</a>.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .container{max-width:960px;margin:24px auto;padding:0 16px}
    .card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff}
    .stack{display:flex;flex-direction:column;gap:12px}
    .row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:12px;align-items:end}
    label{display:flex;flex-direction:column;font-weight:600}
    input{border:1px solid #cbd5e1;border-radius:10px;padding:10px;margin-top:6px}
    .price{font-size:18px;font-weight:700;margin:12px 0}
    .btn{margin-top:16px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:10px 16px;cursor:pointer}
    .btn--outline{background:#fff;color:#0b7285;border:1px solid #0b7285;margin-left:0}
    .btn--secondary{background:#64748b;color:#fff;margin-right:12px}
    .actions{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
    .error{color:#b42318;margin-top:12px}
    .success{color:#027a48;margin-top:12px}
    .back{display:inline-block;margin-bottom:16px;text-decoration:none}
    .icon-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:8px 10px;cursor:pointer}
    .icon-btn.danger{color:#b42318;border-color:#f1a7a4}
    .extras{margin-top:8px}
    .extras__label{font-weight:600;margin-bottom:6px}
    .chips{display:flex;gap:8px;flex-wrap:wrap}
    .chip{border:1px solid #cbd5e1;border-radius:999px;background:#fff;padding:6px 10px;cursor:pointer}
    .chip--active{background:#0ea5e9;color:#fff;border-color:#0ea5e9}
    .seats-summary{margin-top:8px}
    .muted{color:#64748b}
    .passenger{position:relative}
    @media (max-width: 1100px){ .row{grid-template-columns:1fr 1fr; } }
    @media (max-width: 700px){ .row{grid-template-columns:1fr; } }
    .itinerary{display:flex;flex-direction:column;gap:6px;margin-top:4px}
    .leg__route{font-weight:600}
    .leg__meta{font-size:14px}
  `]
})
export class PurchasePage implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  isBrowser = isPlatformBrowser(this.platformId);
  private cdr = inject(ChangeDetectorRef);

  readonly EXTRA_OPTIONS = ['LARGER SEAT','PRIORITY','EXTRA BAG'] as const;

  flight: FlightResult | null = null;
  loading = false;
  error = '';
  success = false;

  form = this.fb.group({
    passengers: this.fb.array([ this.createPassengerForm() ]),
  });

  segmentsMeta: Array<{ key: SegmentKey, code: string }> = [];

  ngOnInit() {
    if (!this.auth?.token) {
      this.router.navigate(['/login']);
      return;
    }
    const nav = this.router.getCurrentNavigation();
    const s1 = (nav?.extras?.state as any)?.flight;
    const s2 = this.isBrowser ? (window as any)?.history?.state?.flight : null;
    const raw = (s1 ?? s2) || null;
    this.flight = raw ? this.normalizeForPurchase(raw) : this.parse(localStorage.getItem('lastFlight'));

    if (this.flight) {
      this.segmentsMeta = [{ key: 'main', code: this.flight.code }];
      if (this.flight.stop1) this.segmentsMeta.push({ key: 'stop1', code: this.flight.stop1.code });
      if (this.flight.stop2) this.segmentsMeta.push({ key: 'stop2', code: this.flight.stop2.code });
    }

    const savedPassengers = this.parse(localStorage.getItem('lastPassengers'));
    if (Array.isArray(savedPassengers) && savedPassengers.length > 0) {
      const arr = this.fb.array(savedPassengers.map((p: any) => this.createPassengerForm(p)));
      this.form.setControl('passengers', arr);
    }

    this.passengers.valueChanges.subscribe(() => this.persistPassengers());
  }

  createPassengerForm(v?: any) {
    return this.fb.group({
      firstName:       [v?.firstName ?? '', Validators.required],
      lastName:        [v?.lastName ?? '', Validators.required],
      cf:              [v?.cf ?? ''],
      passportNumber:  [v?.passportNumber ?? ''],
      extras:          [Array.isArray(v?.extras) ? v.extras : []]
    });
  }
  get passengers(): FormArray { return this.form.get('passengers') as FormArray; }
  ctrlAt(i: number, name: string): AbstractControl | null { return (this.passengers.at(i) as any)?.get?.(name) ?? null; }

  addPassenger() {
    this.passengers.push(this.createPassengerForm());
    this.persistPassengers();
  }
  removePassenger(i: number) {
    const p = this.passengers.at(i)?.value;
    const label = `${p?.firstName ?? 'Passeggero'} ${p?.lastName ?? ''}`.trim();
    if (!confirm(`Rimuovere ${label || 'questo passeggero'}?`)) return;
    this.passengers.removeAt(i);
    this.persistPassengers();
  }

  normalizeExtras(input: any[]): string[] {
    const opts = Array.from(this.EXTRA_OPTIONS);
    const toUpper = (v: any) => {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < opts.length) return opts[v];
      return String(v ?? '').toUpperCase();
    };
    return Array.from(new Set((input ?? []).map(toUpper).filter(Boolean)));
  }
  hasExtra(i: number, extra: string): boolean {
    const ctrl = this.ctrlAt(i, 'extras');
    const normalized = this.normalizeExtras(Array.isArray(ctrl?.value) ? ctrl!.value : []);
    if (JSON.stringify(normalized) !== JSON.stringify(ctrl?.value)) {
      ctrl?.setValue(normalized, { emitEvent: false });
    }
    return normalized.includes(String(extra).toUpperCase());
  }
  toggleExtra(i: number, extra: (typeof this.EXTRA_OPTIONS)[number]) {
    const c = this.ctrlAt(i, 'extras');
    const current = this.normalizeExtras(Array.isArray(c?.value) ? c!.value : []);
    const value = String(extra).toUpperCase();
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1); else current.push(value);
    c?.setValue(current);
    c?.markAsDirty();
    this.persistPassengers();
  }

  private persistPassengers() {
    const arr = (this.passengers.value ?? []).map((p: any) => ({
      ...p,
      extras: this.normalizeExtras(Array.isArray(p?.extras) ? p.extras : []),
    }));
    localStorage.setItem('lastPassengers', JSON.stringify(arr));
  }
  private parse<T = any>(raw: string | null): T | null { try { return raw ? JSON.parse(raw) as T : null; } catch { return null; } }

  private getSeatsBySegment(): SeatsBySegment {
    return (this.parse<SeatsBySegment>(localStorage.getItem('lastSelectedSeatsBySegment')) ?? {}) as SeatsBySegment;
  }
  private seatForPassenger(index: number, key: SegmentKey = 'main'): string | null {
    const map = this.getSeatsBySegment();
    const arr = map?.[key] ?? [];
    return (arr[index] ?? null) as string | null;
  }
  seatSummaryFor(index: number): string[] {
    const map = this.getSeatsBySegment();
    const out: string[] = [];
    this.segmentsMeta.forEach((s, idx) => {
      const seat = (map?.[s.key] ?? [])[index] ?? null;
      out.push(`Volo ${idx + 1} (${s.code}): ${seat ?? '—'}`);
    });
    return out;
  }

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

  get originCode(): string {
    const first = this.firstSeg();
    return first?.route?.from?.code || this.flight?.route?.from?.code || (this.flight as any)?.from || '';
  }
  get destinationCode(): string {
    const last = this.lastSeg();
    return last?.route?.to?.code || this.flight?.route?.to?.code || (this.flight as any)?.to || (this.flight as any)?.destination?.code || '';
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

  get legs(): Array<{ code: string; from: string; to: string; depart: string | Date | null; arrive: string | Date | null; duration: number | null; }> {
    const segs = this.segments();
    return segs.map((s, i) => {
      const from = i === 0
        ? (this.originCode || s?.route?.from?.code || '')
        : (s?.route?.from?.code || segs[i - 1]?.route?.to?.code || '');
      const to = i < segs.length - 1
        ? (segs[i + 1]?.route?.from?.code || s?.route?.to?.code || '')
        : (this.destinationCode || s?.route?.to?.code || '');
      return {
        code: s?.code || '',
        from,
        to,
        depart: s?.departure ?? null,
        arrive: s?.arrival ?? null,
        duration: typeof s?.duration === 'number' ? s.duration : null,
      };
    });
  }

  private normalizeForPurchase(f: any): FlightResult {
    const segs: FlightBase[] = [];
    if (f) {
      segs.push(f);
      if (f.stop1) segs.push(f.stop1);
      if (f.stop2) segs.push(f.stop2);
    }
    const first = segs[0] ?? f;
    const last  = segs[segs.length - 1] ?? f;

    const route = {
      from: first?.route?.from ?? f?.route?.from ?? null,
      to:   last?.route?.to   ?? f?.route?.to   ?? null,
    };

    const departure = f?.departure ?? first?.departure ?? null;
    const arrival   = f?.finalArrival ?? f?.arrival ?? last?.arrival ?? null;

    let totDuration: number;
    if (typeof f?.totDuration === 'number') totDuration = f.totDuration;
    else {
      const sum = segs.reduce((acc, s) => acc + (typeof s?.duration === 'number' ? s.duration : 0), 0);
      if (sum > 0) totDuration = sum;
      else if (departure && arrival) totDuration = Math.round((new Date(arrival).getTime() - new Date(departure).getTime())/60000);
      else totDuration = 0;
    }

    return {
      ...f,
      route, departure, arrival, totDuration,
      matchedTicketsBySegment: f?.matchedTicketsBySegment ?? f?.ticketsBySegment ?? {}
    } as FlightResult;
  }

  private ticketsFor(key: SegmentKey): TicketDTO[] {
    const src = this.flight?.matchedTicketsBySegment ?? this.flight?.ticketsBySegment ?? {};
    return (src?.[key] ?? []) as TicketDTO[];
  }
  private minTicket(key: SegmentKey): TicketDTO | null {
    const arr = this.ticketsFor(key);
    if (!arr.length) return null;
    return [...arr].sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0))[0] || null;
  }
  get computedPrice(): number | null {
    if (!this.flight) return null;
    const keys: SegmentKey[] = ['main', ...(this.flight.stop1 ? ['stop1'] as const : []), ...(this.flight.stop2 ? ['stop2'] as const : [])];
    let total = 0;
    for (const k of keys) {
      const m = this.minTicket(k)?.price;
      if (m == null) return null;
      total += m;
    }
    return total > 0 ? total : null;
  }
  get priceDisplay(): string {
    const p = this.computedPrice;
    return p != null ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p) : '—';
  }

async onPay() {
  if (!this.flight || this.passengers.length === 0 || this.passengers.invalid) return;

  this.loading = true;
  this.error = '';
  this.success = false;

  const api = (environment as any).api || (environment as any).apiBase || '/api';
  const REQUEST_TIMEOUT_MS = 15000;

  try {
    const keys: SegmentKey[] = ['main', ...(this.flight.stop1 ? ['stop1'] as const : []), ...(this.flight.stop2 ? ['stop2'] as const : [])];

    const purchasePayloads = keys
      .map(k => {
        const t = this.minTicket(k);
        const ticket = (t?.id || t?._id) as string | undefined;
        return ticket ? { user: this.auth.decodeToken(this.auth.token || '')?.id, ticket, quantity: this.passengers.length } : null;
      })
      .filter(Boolean) as Array<{ user: any; ticket: string; quantity: number }>;

    if (!purchasePayloads.length) {
      this.error = 'Nessun biglietto disponibile per l’itinerario.';
      this.loading = false;
      return;
    }

    const purchases: PurchaseResponse[] = [];
    for (let i = 0; i < purchasePayloads.length; i++) {
      const p = purchasePayloads[i];
      try {
        const obs = this.http.post<PurchaseResponse>(`${api}/purchases`, p, { headers: this.buildHeaders() })
                      .pipe(timeout(REQUEST_TIMEOUT_MS));
        const res = await firstValueFrom(obs);
        purchases.push(res);
      } catch (err: any) {
        console.log(err)
        this.error = err?.error?.msg || `Errore durante l'acquisto (${i + 1})`;
        throw err;
      }
    }

    const purchaseIds = purchases.map((r:any) => (r?.id ?? r?._id)).filter(Boolean);
    if (!purchaseIds.length) throw new Error('Acquisto non riuscito: id acquisto mancante.');
    console.log('[onPay] purchaseIds:', purchaseIds);

    for (let pIndex = 0; pIndex < purchaseIds.length; pIndex++) {
      const purchaseId = purchaseIds[pIndex];
      for (let i = 0; i < this.passengers.length; i++) {
        const payload = this.buildPassengerPayload(i, purchaseId);
        try {
          const obs = this.http.post(`${api}/passengers`, payload, { headers: this.buildHeaders() })
                               .pipe(timeout(REQUEST_TIMEOUT_MS));
          const res = await firstValueFrom(obs);
          console.log(`[onPay] /passengers response passenger #${i}:`, res);
        } catch (err: any) {
          this.error = (err?.error?.msg) || err?.msg || `Errore invio passeggero ${i + 1}`;
          throw err;
        }
      }
    }

    alert('Acquisto completato! Controlla la tua email per la conferma.');
    this.router.navigate(['/search']);
  } catch (e: any) {
    this.error = this.error || (e?.error?.message) || e?.message || 'Pagamento non riuscito';
  } finally {
    setTimeout(() => {
      this.loading = false;
      this.cdr.markForCheck?.();
    }, 0);
  }
}

  private buildPassengerPayload(index: number, purchaseId: string) {
    const v = (this.passengers.at(index)?.value || {}) as any;
    return {
      name:            v.firstName ?? '',
      surname:         v.lastName ?? '',
      CF:              v.cf || undefined,
      passportNumber:  v.passportNumber || undefined,
      extra:           v.extras || [],
      seat:            this.seatForPassenger(index, 'main'),
      purchase:        purchaseId
    };
  }

  goToSeatSelection() {
    if (this.flight && this.passengers.value) {
      localStorage.setItem('lastFlight', JSON.stringify(this.flight));
      this.persistPassengers();
    }
    this.router.navigate(['/seat-selection'], { state: { flight: this.flight, passengers: this.passengers.value } });
  }

  private extractUserId(): any {
    const a = this.auth as any;
    return a?.currentUser?.id
        ?? this.parse<{ id?: any }>(localStorage.getItem('currentUser'))?.id
        ?? a?.userId
        ?? a?.user?.id
        ?? null;
  }
  private buildHeaders(): HttpHeaders {
    const token = this.auth.token;
    let h = new HttpHeaders();
    if (token) h = h.set('authorization', token);
    return h;
  }
}
