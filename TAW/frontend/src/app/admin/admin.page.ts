import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

type AirlineDTO = {
  code?: string;
  name?: string;
  PIVA?: string;   // ✅ partita IVA
};

type UserDTO = {
  id?: string | number;
  email?: string;
  name?: string;
  role?: string;
};

@Component({
  standalone: true,
  selector: 'taw-admin-page',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="wrap">
      <h1>Area Admin</h1>
      <p class="muted">Solo gli utenti con ruolo <strong>admin</strong> possono accedere.</p>

      <div class="grid">

        <!-- Compagnie aeree -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Compagnie aeree</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="airlineQuery">
              <button class="btn btn--sm" (click)="loadAirlines()" [disabled]="loadingAirlines">↻</button>
            </div>
          </div>

          <ng-container *ngIf="loadingAirlines; else airlinesBody">
            <p class="muted">Caricamento compagnie…</p>
          </ng-container>
          <ng-template #airlinesBody>
            <p *ngIf="airlinesError" class="error">{{ airlinesError }}</p>
            <p class="muted" *ngIf="!airlinesError">
              Trovate: <strong>{{ (airlinesFiltered?.length ?? 0) }}</strong>
            </p>

            <div class="table">
              <div class="thead thead-airlines">
                <div>Codice</div>
                <div>Nome</div>
                <div>PIVA</div>
              </div>
              <div class="row row-airlines" *ngFor="let a of airlinesFiltered">
                <div>{{ a.code || '—' }}</div>
                <div>{{ a.name || '—' }}</div>
                <div>{{ a.PIVA || '—' }}</div>
              </div>
              <div *ngIf="(airlinesFiltered?.length ?? 0) === 0" class="muted pad">
                Nessuna compagnia trovata.
              </div>
            </div>
          </ng-template>
        </div>

        <!-- Utenti -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Utenti</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="userQuery">
              <button class="btn btn--sm" (click)="loadUsers()" [disabled]="loadingUsers">↻</button>
            </div>
          </div>

          <ng-container *ngIf="loadingUsers; else usersBody">
            <p class="muted">Caricamento utenti…</p>
          </ng-container>
          <ng-template #usersBody>
            <p *ngIf="usersError" class="error">{{ usersError }}</p>
            <p class="muted" *ngIf="!usersError">
              Trovati: <strong>{{ (usersFiltered?.length ?? 0) }}</strong>
            </p>

            <div class="table">
              <div class="thead">
                <div>Email</div>
                <div>Nome</div>
                <div>Ruolo</div>
                <div>ID</div>
              </div>
              <div class="row" *ngFor="let u of usersFiltered">
                <div>{{ u.email || '—' }}</div>
                <div>{{ u.name || '—' }}</div>
                <div>{{ u.role || '—' }}</div>
                <div class="muted">{{ u.id || '—' }}</div>
              </div>
              <div *ngIf="(usersFiltered?.length ?? 0) === 0" class="muted pad">
                Nessun utente trovato.
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
    .muted{color:#475569}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:16px}
    .card{display:block;border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff;text-decoration:none;color:inherit}
    .card.stretch{grid-column:span 3}
    .card h3{margin:0 0 8px;font-size:18px}
    .btn{margin-top:12px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:8px 14px;cursor:pointer}
    .btn--outline{background:#fff;color:#0b7285;border:1px solid #0b7285}
    .btn--sm{margin-top:0;padding:6px 10px;border-radius:10px}
    .error{color:#b42318;margin:6px 0 0}
    .card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .actions{display:flex;align-items:center;gap:8px}
    .input{padding:8px 10px;border:1px solid #cbd5e1;border-radius:10px}
    .table{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-top:8px}

    /* griglie */
    .thead,.row{display:grid;grid-template-columns:200px 1fr 160px 160px}
    .thead{background:#f8fafc;font-weight:600}
    .row > div, .thead > div{padding:8px 10px;border-bottom:1px solid #e2e8f0}
    .row:last-child > div{border-bottom:none}
    .pad{padding:10px}

    /* colonne specifiche airlines (3 colonne) */
    .thead-airlines, .row-airlines{grid-template-columns:200px 1fr 200px}

    @media (max-width:900px){
      .grid{grid-template-columns:1fr}
      .card.stretch{grid-column:span 1}
      /* compattazione: nascondo le ultime colonne degli utenti per mobile */
      .thead:not(.thead-airlines), .row:not(.row-airlines){grid-template-columns:1fr 1fr}
      .thead:not(.thead-airlines) > div:nth-child(n+3),
      .row:not(.row-airlines) > div:nth-child(n+3){display:none}
      /* airlines mobile mantiene 2 colonne (codice+nome); PIVA a capo sotto nome */
      .thead-airlines{grid-template-columns:1fr 1fr}
      .row-airlines{grid-template-columns:1fr 1fr}
      .row-airlines > div:nth-child(3){grid-column:1 / span 2; color:#64748b}
    }
  `]
})
export class AdminPage implements OnInit {
  base = environment.apiBase;
  private AIRLINES_ENDPOINT = `${this.base}/airlines`;
  private USERS_ENDPOINT = `${this.base}/users`;

  airlines: AirlineDTO[] = [];
  users: UserDTO[] = [];

  airlineQuery = '';
  userQuery = '';

  loadingAirlines = false;
  loadingUsers = false;

  airlinesError = '';
  usersError = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAirlines();
    this.loadUsers();
  }

  get airlinesFiltered(): AirlineDTO[] {
    const q = this.airlineQuery.trim().toLowerCase();
    if (!q) return this.airlines;
    return this.airlines.filter(a =>
      [a.code, a.name, a.PIVA]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }

  get usersFiltered(): UserDTO[] {
    const q = this.userQuery.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      [u.email, u.name, u.role, String(u.id ?? '')]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }

  loadAirlines(): void {
    this.loadingAirlines = true;
    this.airlinesError = '';
    this.http.get<AirlineDTO[]>(this.AIRLINES_ENDPOINT).subscribe({
      next: (res) => { this.airlines = Array.isArray(res) ? res : []; },
      error: (err) => { this.airlinesError = err?.error?.msg || 'Errore nel caricamento delle compagnie'; },
      complete: () => { this.loadingAirlines = false; }
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.usersError = '';
    this.http.get<UserDTO[]>(this.USERS_ENDPOINT).subscribe({
      next: (res) => { this.users = Array.isArray(res) ? res : []; },
      error: (err) => { this.usersError = err?.error?.msg || 'Errore nel caricamento degli utenti'; },
      complete: () => { this.loadingUsers = false; }
    });
  }
}
