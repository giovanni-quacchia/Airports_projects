import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

type SegmentKey = 'main' | 'stop1' | 'stop2';
type SeatsBySegment = Partial<Record<SegmentKey, (string | null)[]>>;
type Segment = { key: SegmentKey; flightId: string; code: string };

type SeatLayout = {
  letters: number;
  rows: number;
  lettersArray: string[];
  leftLetters: string[];
  rightLetters: string[];
};

type OccupiedSeatMap = Record<string, true>;

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

        <!-- Lista passeggeri -->
        <div class="passenger-list">
          <button *ngFor="let p of passengers; let i = index"
                  type="button"
                  class="pill"
                  [class.active]="i === currentPassengerIndex"
                  (click)="selectPassenger(i)">
            {{ (p.firstName || 'Passeggero ' + (i+1)) }} {{ (p.lastName || '') }}
            → {{ displaySeat(selectedSeatsBySegment[currentSegment]?.[i]) || '—' }}
          </button>
        </div>

        <!-- Griglia aereo -->
        <div class="plane" *ngIf="layoutBySegment[currentSegment] as lay">
          <div *ngFor="let r of rowsArray(lay.rows)" class="row">
            <!-- blocco sinistro -->
            <div class="seat-group" [style.gridTemplateColumns]="'repeat(' + lay.leftLetters.length + ', 1fr)'">
              <button *ngFor="let L of lay.leftLetters"
                      class="seat"
                      [disabled]="isTakenByAnother(currentSegment, seatKey(r, L))"
                      [class.occupied]="isTakenByAnother(currentSegment, seatKey(r, L))"
                      [class.selected]="selectedSeatsBySegment[currentSegment]?.[currentPassengerIndex] === seatKey(r, L)"
                      (click)="assignSeat(currentSegment, seatKey(r, L))">
                {{r}}{{L}}
              </button>
            </div>

            <div class="aisle"></div>

            <!-- blocco destro -->
            <div class="seat-group" [style.gridTemplateColumns]="'repeat(' + lay.rightLetters.length + ', 1fr)'">
              <button *ngFor="let R of lay.rightLetters"
                      class="seat"
                      [disabled]="isTakenByAnother(currentSegment, seatKey(r, R))"
                      [class.occupied]="isTakenByAnother(currentSegment, seatKey(r, R))"
                      [class.selected]="selectedSeatsBySegment[currentSegment]?.[currentPassengerIndex] === seatKey(r, R)"
                      (click)="assignSeat(currentSegment, seatKey(r, R))">
                {{r}}{{R}}
              </button>
            </div>
          </div>
        </div>

        <div class="muted" *ngIf="!layoutBySegment[currentSegment]">
          Caricamento layout posti…
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
    .plane{display:flex;flex-direction:column;gap:8px;margin:0 auto;background:#f8fafc;padding:16px;border-radius:12px;max-width:520px}
    .row{display:flex;align-items:center;justify-content:space-between}
    .seat-group{display:grid;gap:6px;min-width:0;flex:1}
    .aisle{width:40px}
    .seat{height:48px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer;transition:all .2s; display:flex;align-items:center;justify-content:center}
    .seat:hover:not(.occupied):not(.selected):not(:disabled){background:#e0f2fe}
    .seat:disabled{cursor:not-allowed}
    .seat.occupied{background:#e2e8f0;color:#64748b;border-color:#e2e8f0}
    .seat.selected{background:#0ea5e9;color:#fff;font-weight:700;border-color:#0ea5e9}
    .empty{margin-top:16px}
    .muted{color:#64748b}
  `]
})
export class SeatSelectionPage implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  isBrowser = isPlatformBrowser(this.platformId);

  flight: any = null;
  passengers: any[] = [];

  segments: Segment[] = [];
  currentSegment: SegmentKey = 'main';
  currentPassengerIndex = 0;

  // posti occupati per segmento
  occupiedBySegment: Partial<Record<SegmentKey, string[]>> = {};
  private occupiedMapBySegment: Partial<Record<SegmentKey, OccupiedSeatMap>> = {};

  // selezioni correnti per segmento: idx passeggero -> "D4" | null
  selectedSeatsBySegment: SeatsBySegment = {};
  // layout per segmento
  layoutBySegment: Partial<Record<SegmentKey, SeatLayout>> = {};

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state as any) || (this.isBrowser ? (window as any)?.history?.state : {});

    this.flight = state?.flight ?? this.parse(localStorage.getItem('lastFlight'));
    this.passengers = state?.passengers ?? this.parse(localStorage.getItem('lastPassengers')) ?? [];

    // mappa segmenti
    if (this.flight?._id) this.segments.push({ key: 'main', flightId: this.flight._id, code: this.flight.code });
    if (this.flight?.stop1?._id) this.segments.push({ key: 'stop1', flightId: this.flight.stop1._id, code: this.flight.stop1.code });
    if (this.flight?.stop2?._id) this.segments.push({ key: 'stop2', flightId: this.flight.stop2._id, code: this.flight.stop2.code });

    // ripristina selezioni per segmento
    const savedMap = this.parse<SeatsBySegment>(localStorage.getItem('lastSelectedSeatsBySegment')) ?? {};
    for (const s of this.segments) {
      const savedArr = savedMap?.[s.key];
      this.selectedSeatsBySegment[s.key] =
        Array.isArray(savedArr) && savedArr.length === this.passengers.length
          ? savedArr
          : Array.from({ length: this.passengers.length }, () => null);
    }

    // normalizza "4D" -> "D4"
    for (const key of Object.keys(this.selectedSeatsBySegment) as SegmentKey[]) {
      const arr = this.selectedSeatsBySegment[key] ?? [];
      this.selectedSeatsBySegment[key] = arr.map(v => this.toLetterNumber(this.normSeat(v ?? '')));
    }

    // default
    if (this.segments.length) {
      this.currentSegment = this.segments[0].key;
      this.fetchSegmentData(this.segments[0]);
    }
  }

  buildHeaders(): HttpHeaders {
    const token = this.auth.token;
    let h = new HttpHeaders();
    if (token) h = h.set('authorization', token);
    return h;
  }

  get apiBase(): string {
    const e: any = environment as any;
    return e.api ?? e.apiBase ?? '/api';
  }

  // Carica occupati + layout per un segmento
  fetchSegmentData(seg: Segment) {
    // 1) posti già occupati (backend manda { _id, seat } o { ID, Seat })
    this.http.get<Array<{ _id?: any; seat?: string; Seat?: string }>>(
      `${this.apiBase}/flights/${seg.flightId}/passengers`,
      { headers: this.buildHeaders() }
    ).subscribe({
      next: (res) => {
        const map: OccupiedSeatMap = {};
        const arr: string[] = [];
        for (const row of Array.isArray(res) ? res : []) {
          const s = this.toLetterNumber(this.normSeat((row as any)?.seat ?? (row as any)?.Seat));
          if (s) { map[s] = true; arr.push(s); }
        }
        this.occupiedMapBySegment[seg.key] = map;
        this.occupiedBySegment[seg.key] = arr;
      },
      error: (err) => {
        console.error('GET passengers failed', err);
        this.occupiedMapBySegment[seg.key] = {};
        this.occupiedBySegment[seg.key] = [];
      }
    });

    // 2) layout sedili
    this.http.get<any>(`${this.apiBase}/flights/${seg.flightId}`, { headers: this.buildHeaders() })
      .subscribe({
        next: res => {
          const letters = Number(res?.airplane?.letters);
          const rows    = Number(res?.airplane?.rows);
          this.layoutBySegment[seg.key] = this.buildLayout(letters, rows);
        },
        error: err => {
          console.error('GET flight failed', err);
          this.layoutBySegment[seg.key] = this.buildLayout(6, 20);
        }
      });
  }

  // === Utils seats ===
  seatKey(row: number, letter: string): string {
    // chiave normalizzata Letter+Number, es. D4
    return this.toLetterNumber(`${letter}${row}`);
  }

  displaySeat(key: string | null | undefined): string {
    // mostra testo Number+Letter (4D) in UI
    const k = this.toLetterNumber(this.normSeat(key ?? ''));
    const m = k.match(/^([A-Z]+)(\d+)$/);
    return m ? `${m[2]}${m[1]}` : k;
  }

  toLetterNumber(v: string): string {
    if (!v) return '';
    const s = this.normSeat(v);
    // se è Number+Letter (4D) -> Letter+Number (D4)
    let m = s.match(/^(\d+)([A-Z]+)$/);
    if (m) return `${m[2]}${m[1]}`;
    // se è già Letter+Number (D4) lascia così
    m = s.match(/^([A-Z]+)(\d+)$/);
    if (m) return s;
    return s; // fallback
  }

  normSeat(v: any): string {
    return String(v ?? '').toUpperCase().replace(/\s+/g, '');
  }

  // === UI + altri utils ===
  buildLayout(lettersCount: number, rows: number): SeatLayout {
    const lettersArray = Array.from({ length: Math.max(1, lettersCount || 0) }, (_, i) =>
      String.fromCharCode('A'.charCodeAt(0) + i)
    );
    const leftCount = Math.ceil(lettersArray.length / 2);
    const leftLetters = lettersArray.slice(0, leftCount);
    const rightLetters = lettersArray.slice(leftCount);
    return { letters: lettersArray.length, rows: Math.max(1, rows || 0), lettersArray, leftLetters, rightLetters };
  }

  parse<T = any>(raw: string | null): T | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  rowsArray(n: number): number[] { return Array.from({ length: Math.max(1, n) }, (_, i) => i + 1); }

  switchSegment(key: SegmentKey) {
    this.currentSegment = key;
    const seg = this.segments.find(s => s.key === key);
    if (seg && !this.layoutBySegment[key]) this.fetchSegmentData(seg);

    const arr = this.selectedSeatsBySegment[key] || [];
    const nextIdx = arr.findIndex(c => !c);
    if (nextIdx !== -1) this.currentPassengerIndex = nextIdx;
  }

  isTakenByAnother(seg: SegmentKey, code: string): boolean {
    const seat = this.toLetterNumber(code);
    // occupati backend
    const occMap = this.occupiedMapBySegment[seg] ?? {};
    if (occMap[seat]) return true;
    // selezioni degli altri passeggeri
    const arr = this.selectedSeatsBySegment[seg] ?? [];
    return arr.some((c, idx) => idx !== this.currentPassengerIndex && this.toLetterNumber(c ?? '') === seat);
  }

  selectPassenger(i: number) { this.currentPassengerIndex = i; }

  assignSeat(seg: SegmentKey, code: string) {
    if (!this.passengers.length) return;
    if (this.isTakenByAnother(seg, code)) return;

    const arr = this.selectedSeatsBySegment[seg] ?? [];
    arr[this.currentPassengerIndex] = this.toLetterNumber(code);
    this.selectedSeatsBySegment[seg] = arr;
    this.persist();

    const nextIdx = arr.findIndex((c, idx) => !c && idx > this.currentPassengerIndex);
    if (nextIdx !== -1) this.currentPassengerIndex = nextIdx;
    else if (!this.allPassengersSeated()) {
      const firstEmpty = arr.findIndex(c => !c);
      if (firstEmpty !== -1) this.currentPassengerIndex = firstEmpty;
    }
  }

  allPassengersSeated(): boolean {
    if (!this.passengers.length) return false;
    return this.segments.every(s => (this.selectedSeatsBySegment[s.key] ?? []).every(Boolean));
  }

  confirmSeats() {
    this.persist();
    this.router.navigate(['/purchase'], { state: { flight: this.flight } });
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
