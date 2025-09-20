import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

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
        <div class="passenger-list">
          <button *ngFor="let p of passengers; let i = index"
                  type="button"
                  class="pill"
                  [class.active]="i === currentPassengerIndex"
                  (click)="selectPassenger(i)">
            {{ (p.firstName || '').trim() || 'Passeggero ' + (i+1) }}
            {{ (p.lastName || '').trim() }}
            → {{ selectedSeats[i] || '—' }}
          </button>
        </div>

        <div class="plane">
          <div *ngFor="let row of rows" class="row">
            <!-- blocco sinistro -->
            <div class="seat-group">
              <button *ngFor="let seat of leftSeats"
                      class="seat"
                      [class.occupied]="isTakenByAnother(row+seat)"
                      [class.selected]="selectedSeats[currentPassengerIndex] === (row+seat)"
                      (click)="assignSeat(row+seat)">
                {{row}}{{seat}}
              </button>
            </div>

            <div class="aisle"></div>

            <!-- blocco destro -->
            <div class="seat-group">
              <button *ngFor="let seat of rightSeats"
                      class="seat"
                      [class.occupied]="isTakenByAnother(row+seat)"
                      [class.selected]="selectedSeats[currentPassengerIndex] === (row+seat)"
                      (click)="assignSeat(row+seat)">
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
  currentPassengerIndex = 0;

  // dal backend (già prenotati in altri ordini)
  occupiedSeats: string[] = [];
  // selezioni correnti: indice passeggero -> "12A" | null
  selectedSeats: (string | null)[] = [];

  rows = Array.from({ length: 20 }, (_, i) => i + 1);
  leftSeats = ['A','B','C'];
  rightSeats = ['D','E','F'];

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state as any) || (this.isBrowser ? (window as any)?.history?.state : {});

    this.flight = state?.flight ?? this.parse(localStorage.getItem('lastFlight'));
    this.passengers = state?.passengers ?? this.parse(localStorage.getItem('lastPassengers')) ?? [];

    // inizializza selezioni dalla cache oppure reset
    const savedSel = this.parse(localStorage.getItem('lastSelectedSeats')) as (string | null)[] | null;
    if (Array.isArray(savedSel) && savedSel.length === this.passengers.length) {
      this.selectedSeats = savedSel;
    } else {
      this.selectedSeats = Array.from({ length: this.passengers.length }, () => null);
    }

    if (this.flight?._id) {
      const api = (environment as any).api || (environment as any).apiBase || '/api';
      this.http.get<string[]>(`${api}/seats/${this.flight._id}`).subscribe({
        next: (res) => this.occupiedSeats = Array.isArray(res) ? res : [],
        error: () => {} // silenzioso
      });
    }
  }

  private parse<T = any>(raw: string | null): T | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  // un posto è "taken" se è occupato dal backend o già scelto da un ALTRO passeggero
  isTakenByAnother(code: string): boolean {
    if (this.occupiedSeats.includes(code)) return true;
    return this.selectedSeats.some((c, idx) => idx !== this.currentPassengerIndex && c === code);
  }

  selectPassenger(i: number) {
    this.currentPassengerIndex = i;
  }

  assignSeat(code: string) {
    if (!this.passengers.length) return;

    // se il posto è occupato da un altro passeggero o dal backend, blocca
    if (this.isTakenByAnother(code)) return;

    // assegna a quello corrente (sovrascrive l'eventuale scelta precedente di quel passeggero)
    this.selectedSeats[this.currentPassengerIndex] = code;
    this.persist();

    // passa automaticamente al prossimo passeggero senza posto
    const nextIdx = this.selectedSeats.findIndex((c, idx) => !c && idx > this.currentPassengerIndex);
    if (nextIdx !== -1) {
      this.currentPassengerIndex = nextIdx;
    } else if (!this.allPassengersSeated()) {
      const firstEmpty = this.selectedSeats.findIndex(c => !c);
      if (firstEmpty !== -1) this.currentPassengerIndex = firstEmpty;
    }
  }

  allPassengersSeated(): boolean {
    return this.passengers.length > 0 && this.selectedSeats.every(Boolean);
  }

  // TODO: torna i dati sul posto ai passeggeri
  confirmSeats() {
    this.persist();
    const api = (environment as any).api || (environment as any).apiBase || '/api';
    const payload = {
      flightId: this.flight?._id,
      seats: this.selectedSeats,
      passengers: this.passengers
    };
    this.http.post(`${api}/seats`, payload).subscribe({
      next: () => this.router.navigate(['/purchase'], { state: { flight: this.flight } }),
      error: () => alert('Errore nella conferma dei posti')
    });
  }

  goBack() {
    this.persist();
    this.router.navigate(['/purchase'], { state: { flight: this.flight } });
  }

  private persist() {
    if (!this.isBrowser) return;
    localStorage.setItem('lastFlight', JSON.stringify(this.flight ?? null));
    localStorage.setItem('lastPassengers', JSON.stringify(this.passengers ?? []));
    localStorage.setItem('lastSelectedSeats', JSON.stringify(this.selectedSeats ?? []));
  }
}
