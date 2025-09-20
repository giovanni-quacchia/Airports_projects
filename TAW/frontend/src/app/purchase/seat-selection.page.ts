import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

type SegmentKey = 'main' | 'stop1' | 'stop2';
type SeatsBySegment = Partial<Record<SegmentKey, (string | null)[]>>;

@Component({
  standalone: true,
  selector: 'taw-seat-selection-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="topbar">
        <button class="btn btn--ghost" (click)="goBack()">← Torna al pagamento</button>
        <h1>Seleziona i posti</h1>
        <button class="btn" (click)="confirmSeats()" [disabled]="!allPassengersSeated()">Conferma</button>
      </div>

      <ng-container *ngIf="passengers.length; else missing">
        <!-- Tabs segmenti -->
        <div class="tabs">
          <button *ngFor="let s of segments; let idx = index"
                  class="tab"
                  [class.active]="currentSegment === s.key"
                  (click)="switchSegment(s.key)">
            Volo {{ idx + 1 }} — {{ s.code }}
          </button>
        </div>

        <!-- Lista passeggeri con posto per segmento corrente -->
        <div class="passenger-list">
          <button *ngFor="let p of passengers; let i = index"
                  type="button"
                  class="pill"
                  [class.active]="i === currentPassengerIndex"
                  (click)="selectPassenger(i)">
            {{ (p.firstName || 'Passeggero ' + (i+1)) }} {{ (p.lastName || '') }}
            → {{ (selectedSeatsBySegment[currentSegment]?.[i]) || '—' }}
          </button>
        </div>

        <!-- Griglia aereo per segmento corrente -->
        <div class="plane">
          <div *ngFor="let row of rows" class="row">
            <div class="seat-group">
              <button *ngFor="let seat of leftSeats"
                      class="seat"
                      [class.occupied]="isTakenByAnother(currentSegment, row+seat)"
                      [class.selected]="selectedSeatsBySegment[currentSegment]?.[currentPassengerIndex] === (row+seat)"
                      (click)="assignSeat(currentSegment, row+seat)">
                {{row}}{{seat}}
              </button>
            </div>
            <div class="aisle"></div>
            <div class="seat-group">
              <button *ngFor="let seat of rightSeats"
                      class="seat"
                      [class.occupied]="isTakenByAnother(currentSegment, row+seat)"
                      [class.selected]="selectedSeatsBySegment[currentSegment]?.[currentPassengerIndex] === (row+seat)"
                      (click)="assignSeat(currentSegment, row+seat)">
                {{row}}{{seat}}
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #missing>
        <p class="empty">
          Nessun passeggero trovato. Torna alla <a routerLink="/purchase">pagina di acquisto</a>.
        </p>
      </ng-template>
    </div>
  `,
  styles: [`
    .container{max-width:900px;margin:24px auto;padding:0 16px}
    .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:12px}
    h1{font-size:20px;margin:0}
    .btn{background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:8px 14px;cursor:pointer}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .btn--ghost{background:transparent;border:1px solid #cbd5e1;color:#0f172a}

    .tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px}
    .tab{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:6px 10px;cursor:pointer}
    .tab.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9}

    .passenger-list{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 16px}
    .pill{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:6px 10px;cursor:pointer}
    .pill.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9}

    .plane{display:flex;flex-direction:column;gap:8px;margin:0 auto;background:#f8fafc;padding:16px;border-radius:12px;max-width:420px}
    .row{display:flex;align-items:center;justify-content:space-between}
    .seat-group{display:flex;gap:6px}
    .aisle{width:40px}
    .seat{width:48px;height:48px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer;transition:all .2s}
    .seat:hover:not(.occupied):not(.selected){background:#e0f2fe}
    .seat.occupied{background:#e2e8f0;color:#64748b;cursor:not-allowed}
    .seat.selected{background:#0ea5e9;color:#fff;font-weight:700}
    .empty{margin-top:16px}
  `]
})
export class SeatSelectionPage implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  flight: any = null;
  passengers: any[] = [];

  segments: Array<{ key: SegmentKey, flightId: string, code: string }> = [];
  currentSegment: SegmentKey = 'main';
  currentPassengerIndex = 0;

  // occupazioni per segmento
  occupiedBySegment: Partial<Record<SegmentKey, string[]>> = {};
  // selezioni correnti per segmento: idx passeggero -> "12A" | null
  selectedSeatsBySegment: SeatsBySegment = {};

  rows = Array.from({ length: 20 }, (_, i) => i + 1);
  leftSeats = ['A','B','C'];
  rightSeats = ['D','E','F'];

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state as any) || (this.isBrowser ? (window as any)?.history?.state : {});

    this.flight = state?.flight ?? this.parse(localStorage.getItem('lastFlight'));
    this.passengers = state?.passengers ?? this.parse(localStorage.getItem('lastPassengers')) ?? [];

    // mappa segmenti
    if (this.flight?._id) {
      this.segments.push({ key: 'main', flightId: this.flight._id, code: this.flight.code });
    }
    if (this.flight?.stop1?._id) {
      this.segments.push({ key: 'stop1', flightId: this.flight.stop1._id, code: this.flight.stop1.code });
    }
    if (this.flight?.stop2?._id) {
      this.segments.push({ key: 'stop2', flightId: this.flight.stop2._id, code: this.flight.stop2.code });
    }

    // ripristina selezioni per segmento
    const savedMap = this.parse(localStorage.getItem('lastSelectedSeatsBySegment')) as SeatsBySegment | null;
    for (const s of this.segments) {
      const savedArr = savedMap?.[s.key];
      this.selectedSeatsBySegment[s.key] =
        Array.isArray(savedArr) && savedArr.length === this.passengers.length
          ? savedArr
          : Array.from({ length: this.passengers.length }, () => null);
    }

    // carica occupazioni backend per ogni segmento
    const api = (environment as any).api || (environment as any).apiBase || '/api';
    this.segments.forEach(s => {
      this.http.get<string[]>(`${api}/seats/${s.flightId}`).subscribe({
        next: (res) => this.occupiedBySegment[s.key] = Array.isArray(res) ? res : [],
        error: () => {} // silenzioso
      });
    });

    // default segmento corrente
    if (this.segments.length) this.currentSegment = this.segments[0].key;
  }

  private parse<T = any>(raw: string | null): T | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  switchSegment(key: SegmentKey) {
    this.currentSegment = key;
    // opzionale: passa automaticamente al prossimo passeggero senza posto in questo segmento
    const arr = this.selectedSeatsBySegment[key] || [];
    const nextIdx = arr.findIndex(c => !c);
    if (nextIdx !== -1) this.currentPassengerIndex = nextIdx;
  }

  isTakenByAnother(seg: SegmentKey, code: string): boolean {
    const occ = this.occupiedBySegment[seg] ?? [];
    if (occ.includes(code)) return true;
    const arr = this.selectedSeatsBySegment[seg] ?? [];
    return arr.some((c, idx) => idx !== this.currentPassengerIndex && c === code);
  }

  selectPassenger(i: number) {
    this.currentPassengerIndex = i;
  }

  assignSeat(seg: SegmentKey, code: string) {
    if (!this.passengers.length) return;
    if (this.isTakenByAnother(seg, code)) return;

    const arr = this.selectedSeatsBySegment[seg] ?? [];
    arr[this.currentPassengerIndex] = code;
    this.selectedSeatsBySegment[seg] = arr;
    this.persist();

    // next passeggero senza posto per questo segmento
    const nextIdx = arr.findIndex((c, idx) => !c && idx > this.currentPassengerIndex);
    if (nextIdx !== -1) this.currentPassengerIndex = nextIdx;
    else if (!this.allPassengersSeated()) {
      const firstEmpty = arr.findIndex(c => !c);
      if (firstEmpty !== -1) this.currentPassengerIndex = firstEmpty;
    }
  }

  allPassengersSeated(): boolean {
    if (!this.passengers.length) return false;
    // tutti i segmenti devono avere un posto per ogni passeggero
    return this.segments.every(s =>
      (this.selectedSeatsBySegment[s.key] ?? []).every(Boolean)
    );
  }

  confirmSeats() {
    this.persist();
    const api = (environment as any).api || (environment as any).apiBase || '/api';

    // Invio per segmento (se ti serve realmente salvarli subito)
    // In alternativa, sposta questo salvataggio al pagamento.
    const requests = this.segments.map(s => ({
      flightId: s.flightId,
      seats: this.selectedSeatsBySegment[s.key],
      passengers: this.passengers
    })).map(payload => this.http.post(`${api}/seats`, payload));

    // esegui in serie o parallelamente; qui parallel:
    Promise.all(requests.map(r => r.toPromise()))
      .finally(() => this.router.navigate(['/purchase'], { state: { flight: this.flight } }));
  }

  goBack() {
    this.persist();
    this.router.navigate(['/purchase'], { state: { flight: this.flight } });
  }

  private persist() {
    if (!this.isBrowser) return;
    localStorage.setItem('lastFlight', JSON.stringify(this.flight ?? null));
    localStorage.setItem('lastPassengers', JSON.stringify(this.passengers ?? []));
    localStorage.setItem('lastSelectedSeatsBySegment', JSON.stringify(this.selectedSeatsBySegment ?? {}));
  }
}
