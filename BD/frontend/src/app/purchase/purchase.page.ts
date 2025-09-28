import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

type SegmentKey = 'flight1' | 'flight2';
interface AirportDTO { code: string; city?: string; name?: string; country?: string; }
interface FlightBase {
  id: string; code: string;
  departure?: string | Date; arrival?: string | Date; duration?: number;
  route?: { from?: AirportDTO; to?: AirportDTO; code?: string };
  airline?: { name?: string; code?: string; logo?: string };
}
type SeatsBySegment = Partial<Record<SegmentKey, (string | null)[]>>;
interface TicketDTO { id?: string; type?: string; quantity?: number; price?: number; }
interface FlightResult extends FlightBase {
  flight1?: FlightBase; flight2?: FlightBase;
  totDuration?: number; finalArrival?: string | Date;
  matchedTicketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
  ticketsBySegment?: Partial<Record<SegmentKey, TicketDTO[]>>;
}
type PurchaseResponse = { id?: string; [k: string]: any };

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
          <h2>{{ airlineName }}</h2>

          <p *ngIf="legs.length <= 1">
            {{ originCode }} → {{ destinationCode }}<br>
            Partenza: {{ departTime | date:'short' }}<br>
            Arrivo:   {{ arriveTime | date:'short' }}<br>
            Durata:   {{ totalDuration }} min
          </p>

          <div *ngIf="legs.length > 1" class="itinerary">
            <div *ngFor="let l of legs; let i = index" class="leg">
              <div class="leg__route">
                {{ l.from_ }} → {{ l.to_ }} <span class="muted">({{ l.code }})</span>
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

          <button type="button" class="btn btn--outline" (click)="addPassenger()" [disabled]="purchases.length > 0">+ Aggiungi passeggero</button>

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
  purchases: PurchaseResponse[] = [];
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
      if (this.flight.flight1) this.segmentsMeta.push({ key: 'flight1', code: this.flight.flight1.code });
      if (this.flight.flight2) this.segmentsMeta.push({ key: 'flight2', code: this.flight.flight2.code });
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

  // Mappa dei posti selezionati per segmento → viene caricata da localStorage
  private get selectedSeatsBySegment(): SeatsBySegment {
    return this.parse<SeatsBySegment>(localStorage.getItem('lastSelectedSeatsBySegment')) ?? {};
  }

  // Ritorna la lista di extra del passeggero (normalizzati)
  private getExtrasFor(index: number): string[] {
    const ctrl = this.ctrlAt(index, 'extras');
    if (!ctrl) return [];
    const raw = Array.isArray(ctrl.value) ? ctrl.value : [];
    return this.normalizeExtras(raw);
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
  private seatForPassenger(index: number, key: SegmentKey): string | null {
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
    const arr: FlightBase[] = [];
    if (this.flight.flight1) arr.push(this.flight.flight1);
    if (this.flight.flight2) arr.push(this.flight.flight2);
    return arr;
  }
  private firstSeg(): FlightBase | null { const s = this.segments(); return s[0] ?? null; }
  private lastSeg(): FlightBase  | null { const s = this.segments(); return s[s.length-1] ?? null; }

  get airlineName(){
    if (!this.flight) return 'Compagnia';
    const names: string[] = [];
    if (this.flight.flight1?.airline || this.flight.flight1?.airline?.code) {
      names.push(this.flight.flight1.airline as string || this.flight.flight1.airline.code!);
    }
    if (this.flight.flight2?.airline || this.flight.flight2?.airline?.code) {
      names.push(this.flight.flight2.airline as string || this.flight.flight2.airline.code!);
    }

    if (names.length == 2 && names[0] === names[1]) {
      return names[0];
    }
    return names.join(' — ') || 'Compagnia';
  } 

get flightCode(): string {
  if (!this.flight) return '';
  // Prende tutti i segmenti e concatena i codici separati da " — "
  return this.segments()
    .map(s => s.code || '')
    .filter(Boolean) // elimina eventuali stringhe vuote
    .join(' — ');
}


  get originCode(): string {
    const first:any = this.firstSeg();
    return first?.from_ || ''
  }
  get destinationCode(): string {
    const last:any = this.lastSeg();
    return last?.to_ || ''
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

get legs(): Array<any> {
  if (!this.flight) return [];

  const segs = [this.flight.flight1, this.flight.flight2].filter(Boolean) as FlightBase[];
  return segs.map((s:any) => ({
    code: s.code || '',
    from_: s.from_ || s.route?.from?.code || '',
    to_: s.to_ || s.route?.to?.code || '',
    depart: s.departure ?? null,
    arrive: s.arrival ?? null,
    duration: typeof s.duration === 'number' ? s.duration : null
  }));
}

private normalizeForPurchase(f: any): FlightResult {
  if (!f) return null as any;

  // Creiamo array dei segmenti
  const segs: FlightBase[] = [];
  if (f.flight1) segs.push({
    ...f.flight1,
    departure: f.flight1.departure ? new Date(f.flight1.departure) : null,
    arrival: f.flight1.arrival ? new Date(f.flight1.arrival) : null,
  });
  if (f.flight2) segs.push({
    ...f.flight2,
    departure: f.flight2.departure ? new Date(f.flight2.departure) : null,
    arrival: f.flight2.arrival ? new Date(f.flight2.arrival) : null,
  });

  const first:any = segs[0] ?? null;
  const last:any  = segs[segs.length - 1] ?? null;

  const route = {
    from: first?.from_ || first?.route?.from || null,
    to: last?.to_ || last?.route?.to || null,
    code: first?.code ?? last?.code ?? ''
  };

  const departure = first?.departure ?? null;
  const arrival   = last?.arrival ?? null;

  const totDuration = typeof f.tot_duration === 'number'
      ? f.tot_duration
      : segs.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  const ticketsBySegment: Partial<Record<SegmentKey, TicketDTO[]>> = {};
  if (f.flight1?.tickets) ticketsBySegment['flight1'] = f.flight1.tickets;
  if (f.flight2?.tickets) ticketsBySegment['flight2'] = f.flight2.tickets;

  return {
    ...f,
    flight1: segs[0] ?? undefined,
    flight2: segs[1] ?? undefined,
    route,
    departure,
    arrival,
    totDuration,
    ticketsBySegment
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
    const keys: SegmentKey[] = [ ...(this.flight.flight1 ? ['flight1'] as const : []), ...(this.flight.flight2 ? ['flight2'] as const : [])];
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
    const keys: SegmentKey[] = [
      ...(this.flight.flight1 ? ['flight1'] as const : []),
      ...(this.flight.flight2 ? ['flight2'] as const : [])
    ];

    // --- ricava ticket IDs
    const tickets = keys
      .map(k => this.minTicket(k)?.id as string | undefined)
      .filter(Boolean) as string[];

    if (!tickets.length) {
      this.error = 'Nessun biglietto disponibile per l’itinerario.';
      this.loading = false;
      return;
    }

    // --- costruisci passengers[]
    const passengersPayload = (this.passengers.value as any[]).map((p, idx) => {

      const seats = keys.map(k => ({
        ticket: this.minTicket(k)?.id,
        seat: this.selectedSeatsBySegment[k]?.[idx] || null,
        extra: this.getExtrasFor(idx)
      })).filter(s => s.ticket);

      return {
        name: p.firstName,
        surname: p.lastName,
        CF: p.cf,
        passportNumber: p.passportNumber,
        seats
      };
    });


    const payload = {
      user: this.auth.currentUser.id || this.extractUserId(),
      tickets,
      passengers: passengersPayload,
      quantity: this.passengers.length,
    };

    console.log('[onPay] sending payload:', payload);

    // --- unica chiamata a /purchases
    const obs = this.http.post(`${api}/purchases/`, payload, {withCredentials: true})
                         .pipe(timeout(REQUEST_TIMEOUT_MS));
    const res = await firstValueFrom(obs);

    console.log('[onPay] response:', res);

    // aggiorna saldo
    this.auth.putCurrentBalance();
    alert('Acquisto completato! Controlla la tua email per la conferma.');
    this.router.navigate(['/search']);

  } catch (e: any) {
    console.error('[onPay] error', e);
    this.error = (e?.error?.msg) || e?.msg || 'Pagamento non riuscito';
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
      seat:            this.seatForPassenger(index, 'flight1') || undefined,
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