// src/app/compagnia/compagnia.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

/* ---- Tipi ---- */
type Airport = { name?: string; city?: string; code?: string; country?: string };
type RouteDTO = { _id?: string; from: Airport; to: Airport };
type AirplaneDTO = {
  _id?: string;
  code: string;
  model: string;
  airline: string;     // codice o id compagnia (come espone il backend)
  rows: number;
  letters: string;     // es: "ABCDEF"
  route?: RouteDTO | string; // si accetta id o oggetto
  startDate?: string;  // ISO yyyy-mm-dd
  endDate?: string;    // ISO yyyy-mm-dd
};
type FlightDTO = {
  _id?: string;
  code: string;
  departure: string;   // ISO datetime
  arrival: string;     // ISO datetime
  duration: number;    // minuti
  route: RouteDTO | string;
  airline: string;
  airplane: AirplaneDTO | string;
};

@Component({
  standalone: true,
  selector: 'taw-compagnia-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <h1>Area Compagnia</h1>
      <p class="muted">Solo gli utenti con ruolo <strong>compagnia aerea</strong> possono accedere.</p>

      <div class="grid">

        <!-- ROTTE -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Rotte</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="routeQuery">
              <button class="btn btn--sm" (click)="loadRoutes()" [disabled]="loadingRoutes">↻</button>
            </div>
          </div>

          <ng-container *ngIf="loadingRoutes; else routesBody">
            <p class="muted">Caricamento rotte…</p>
          </ng-container>
          <ng-template #routesBody>
            <p *ngIf="routesError" class="error">{{ routesError }}</p>
            <p class="muted" *ngIf="!routesError">Trovate: <strong>{{ routesFiltered.length }}</strong></p>

            <div class="table">
              <div class="thead thead-routes">
                <div>From</div><div>To</div>
              </div>
              <div class="row row-routes" *ngFor="let r of routesFiltered">
                <div>{{ fmtAirport(r.from) }}</div>
                <div>{{ fmtAirport(r.to) }}</div>
              </div>
              <div *ngIf="routesFiltered.length===0" class="muted pad">Nessuna rotta.</div>
            </div>

            <div class="below-table">
              <button class="btn btn--circle" (click)="showAddRoute = !showAddRoute">{{ showAddRoute ? '–' : '+' }}</button>
              <span class="muted small">{{ showAddRoute ? 'Nascondi modulo' : 'Aggiungi nuova rotta' }}</span>
            </div>

            <form *ngIf="showAddRoute" class="add-form" (ngSubmit)="addRoute()" novalidate>
              <div class="grid-form">
                <fieldset class="subcard">
                  <legend>From</legend>
                  <input class="input" placeholder="Name" [(ngModel)]="newRoute.from.name" name="rfname">
                  <input class="input" placeholder="City" [(ngModel)]="newRoute.from.city" name="rfcity">
                  <input class="input" placeholder="Code" [(ngModel)]="newRoute.from.code" name="rfcode" required>
                  <input class="input" placeholder="Country" [(ngModel)]="newRoute.from.country" name="rfcountry">
                </fieldset>
                <fieldset class="subcard">
                  <legend>To</legend>
                  <input class="input" placeholder="Name" [(ngModel)]="newRoute.to.name" name="rtname">
                  <input class="input" placeholder="City" [(ngModel)]="newRoute.to.city" name="rtcity">
                  <input class="input" placeholder="Code" [(ngModel)]="newRoute.to.code" name="rtcode" required>
                  <input class="input" placeholder="Country" [(ngModel)]="newRoute.to.country" name="rtcountry">
                </fieldset>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn--outline" (click)="resetRoute()">Annulla</button>
                <button type="submit" class="btn" [disabled]="creatingRoute">{{ creatingRoute ? 'Salvo…' : 'Conferma' }}</button>
              </div>
              <p *ngIf="createRouteError" class="error">{{ createRouteError }}</p>
            </form>
          </ng-template>
        </div>

        <!-- AEROPLANI -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Aeroplani</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="airplaneQuery">
              <button class="btn btn--sm" (click)="loadAirplanes()" [disabled]="loadingAirplanes">↻</button>
            </div>
          </div>

          <ng-container *ngIf="loadingAirplanes; else airplanesBody">
            <p class="muted">Caricamento aeroplani…</p>
          </ng-container>
          <ng-template #airplanesBody>
            <p *ngIf="airplanesError" class="error">{{ airplanesError }}</p>
            <p class="muted" *ngIf="!airplanesError">Trovati: <strong>{{ airplanesFiltered.length }}</strong></p>

            <div class="table">
              <div class="thead thead-airplanes">
                <div>Code</div><div>Model</div><div>Airline</div><div>Route</div><div>Periodo</div>
              </div>
              <div class="row row-airplanes" *ngFor="let a of airplanesFiltered">
                <div>{{ a.code }}</div>
                <div>{{ a.model }}</div>
                <div>{{ a.airline }}</div>
                <div>{{ fmtRoute(a.route) }}</div>
                <div>{{ a.startDate || '—' }} → {{ a.endDate || '—' }}</div>
              </div>
              <div *ngIf="airplanesFiltered.length===0" class="muted pad">Nessun aeroplano.</div>
            </div>

            <div class="below-table">
              <button class="btn btn--circle" (click)="showAddAirplane = !showAddAirplane">{{ showAddAirplane ? '–' : '+' }}</button>
              <span class="muted small">{{ showAddAirplane ? 'Nascondi modulo' : 'Aggiungi nuovo aeroplano' }}</span>
            </div>

            <form *ngIf="showAddAirplane" class="add-form" (ngSubmit)="addAirplane()" novalidate>
              <div class="grid-form">
                <input class="input" placeholder="Code" [(ngModel)]="newAirplane.code" name="apcode" required>
                <input class="input" placeholder="Model" [(ngModel)]="newAirplane.model" name="apmodel" required>
                <input class="input" placeholder="Airline" [(ngModel)]="newAirplane.airline" name="apairline" required>
                <input class="input" placeholder="Route (id o from-to)" [(ngModel)]="newAirplaneRouteRef" name="aproute">
                <input class="input" placeholder="Rows (es. 30)" type="number" [(ngModel)]="newAirplane.rows" name="aprows" required>
                <input class="input" placeholder="Letters (es. ABCDEF)" [(ngModel)]="newAirplane.letters" name="apletters" required>
                <input class="input" type="date" placeholder="Start date" [(ngModel)]="newAirplane.startDate" name="apstart">
                <input class="input" type="date" placeholder="End date" [(ngModel)]="newAirplane.endDate" name="apend">
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn--outline" (click)="resetAirplane()">Annulla</button>
                <button type="submit" class="btn" [disabled]="creatingAirplane">{{ creatingAirplane ? 'Salvo…' : 'Conferma' }}</button>
              </div>
              <p *ngIf="createAirplaneError" class="error">{{ createAirplaneError }}</p>
            </form>
          </ng-template>
        </div>

        <!-- VOLI -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Voli</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="flightQuery">
              <button class="btn btn--sm" (click)="loadFlights()" [disabled]="loadingFlights">↻</button>
            </div>
          </div>

          <ng-container *ngIf="loadingFlights; else flightsBody">
            <p class="muted">Caricamento voli…</p>
          </ng-container>
          <ng-template #flightsBody>
            <p *ngIf="flightsError" class="error">{{ flightsError }}</p>
            <p class="muted" *ngIf="!flightsError">Trovati: <strong>{{ flightsFiltered.length }}</strong></p>

            <div class="table">
              <div class="thead thead-flights">
                <div>Code</div><div>Route</div><div>Airline</div><div>Airplane</div><div>Partenza</div><div>Arrivo</div><div>Durata</div>
              </div>
              <div class="row row-flights" *ngFor="let f of flightsFiltered">
                <div>{{ f.code }}</div>
                <div>{{ fmtRoute(f.route) }}</div>
                <div>{{ f.airline }}</div>
                <div>{{ fmtAirplane(f.airplane) }}</div>
                <div>{{ f.departure }}</div>
                <div>{{ f.arrival }}</div>
                <div>{{ f.duration }} min</div>
              </div>
              <div *ngIf="flightsFiltered.length===0" class="muted pad">Nessun volo.</div>
            </div>

            <div class="below-table">
              <button class="btn btn--circle" (click)="showAddFlight = !showAddFlight">{{ showAddFlight ? '–' : '+' }}</button>
              <span class="muted small">{{ showAddFlight ? 'Nascondi modulo' : 'Crea nuovo volo' }}</span>
            </div>

            <form *ngIf="showAddFlight" class="add-form" (ngSubmit)="addFlight()" novalidate>
              <div class="grid-form">
                <input class="input" placeholder="Code" [(ngModel)]="newFlight.code" name="flcode" required>
                <input class="input" placeholder="Route (id)" [(ngModel)]="newFlightRouteRef" name="flroute" required>
                <input class="input" placeholder="Airline" [(ngModel)]="newFlight.airline" name="flairline" required>
                <input class="input" placeholder="Airplane (id)" [(ngModel)]="newFlightAirplaneRef" name="flairplane" required>
                <input class="input" type="datetime-local" placeholder="Departure" [(ngModel)]="newFlight.departure" name="fldep" required>
                <input class="input" type="datetime-local" placeholder="Arrival" [(ngModel)]="newFlight.arrival" name="flarr" required>
                <input class="input" type="number" placeholder="Duration (min)" [(ngModel)]="newFlight.duration" name="fldur" required>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn--outline" (click)="resetFlight()">Annulla</button>
                <button type="submit" class="btn" [disabled]="creatingFlight">{{ creatingFlight ? 'Salvo…' : 'Conferma' }}</button>
              </div>
              <p *ngIf="createFlightError" class="error">{{ createFlightError }}</p>
            </form>
          </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
    .muted{color:#475569}
    .small{font-size:12px;margin-left:8px}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:16px}
    .card{display:block;border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff}
    .card.stretch{grid-column:span 3}
    .card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .actions{display:flex;align-items:center;gap:8px}
    .btn{margin-top:12px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:8px 14px;cursor:pointer}
    .btn--outline{background:#fff;color:#0b7285;border:1px solid #0b7285}
    .btn--sm{margin-top:0;padding:6px 10px;border-radius:10px}
    .btn--circle{width:36px;height:36px;border-radius:999px;padding:0;display:inline-flex;align-items:center;justify-content:center;font-size:20px;margin-top:8px}
    .error{color:#b42318;margin:6px 0 0}
    .table{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-top:8px}
    .thead,.row{display:grid}
    .row > div, .thead > div{padding:8px 10px;border-bottom:1px solid #e2e8f0}
    .row:last-child > div{border-bottom:none}
    .pad{padding:10px}
    .below-table{display:flex;align-items:center;gap:8px;margin-top:10px}
    .add-form{margin-top:8px;border:1px dashed #cbd5e1;border-radius:12px;padding:12px;background:#f9fafb}
    .grid-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .subcard{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;border:1px solid #e2e8f0;border-radius:8px;padding:8px}
    .input{padding:8px 10px;border:1px solid #cbd5e1;border-radius:10px;width:100%}

    .thead-routes,.row-routes{grid-template-columns:1fr 1fr}
    .thead-airplanes,.row-airplanes{grid-template-columns:120px 1fr 120px 1fr 1fr}
    .thead-flights,.row-flights{grid-template-columns:120px 1fr 120px 1fr 1fr 1fr 100px}

    .form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}

    @media (max-width:900px){
      .grid{grid-template-columns:1fr}
      .card.stretch{grid-column:span 1}
      .grid-form{grid-template-columns:1fr}
      .subcard{grid-template-columns:1fr}
      .thead-airplanes,.row-airplanes{grid-template-columns:1fr 1fr}
      .thead-flights,.row-flights{grid-template-columns:1fr 1fr}
    }
  `]
})
export class CompagniaPage implements OnInit {
  base = environment.apiBase;
  private ROUTES_ENDPOINT = `${this.base}/routes`;
  private AIRPLANES_ENDPOINT = `${this.base}/airplanes`;
  private FLIGHTS_ENDPOINT = `${this.base}/flights`;
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  /* ---- Stato liste/filtri ---- */
  routes: RouteDTO[] = [];
  airplanes: AirplaneDTO[] = [];
  flights: FlightDTO[] = [];

  routeQuery = ''; airplaneQuery = ''; flightQuery = '';

  loadingRoutes = false; loadingAirplanes = false; loadingFlights = false;
  routesError = ''; airplanesError = ''; flightsError = '';

  /* ---- Stato creazione ---- */
  showAddRoute = false; creatingRoute = false; createRouteError = '';
  newRoute: RouteDTO = { from: {}, to: {} };

  showAddAirplane = false; creatingAirplane = false; createAirplaneError = '';
  newAirplane: AirplaneDTO = { code:'', model:'', airline:'', rows:0, letters:'' };
  newAirplaneRouteRef = ''; // id rotta o lasciato vuoto

  showAddFlight = false; creatingFlight = false; createFlightError = '';
  newFlight: FlightDTO = { code:'', departure:'', arrival:'', duration:0, route:'', airline:'', airplane:'' };
  newFlightRouteRef = ''; newFlightAirplaneRef = '';

  ngOnInit(): void {
    this.loadRoutes();
    this.loadAirplanes();
    this.loadFlights();
  }

  /* ---- Helpers ---- */
  private headers(): HttpHeaders {
    const t = this.auth.token;
    let h = new HttpHeaders();
    if (t) h = h.set('authorization', t);
    return h;
  }
  fmtAirport(a?: Airport): string {
    if (!a) return '—';
    const parts = [a.city, a.name, a.code, a.country].filter(Boolean);
    return parts.join(' · ');
    }
  fmtRoute(r: any): string {
    if (!r) return '—';
    if (typeof r === 'string') return r; // id
    return `${this.fmtAirport(r.from)} → ${this.fmtAirport(r.to)}`;
  }
  fmtAirplane(a: any): string {
    if (!a) return '—';
    if (typeof a === 'string') return a;
    return `${a.code} (${a.model})`;
  }

  /* ---- Filtri ---- */
  get routesFiltered() {
    const q = this.routeQuery.trim().toLowerCase();
    if (!q) return this.routes;
    return this.routes.filter(r =>
      this.fmtRoute(r).toLowerCase().includes(q)
    );
  }
  get airplanesFiltered() {
    const q = this.airplaneQuery.trim().toLowerCase();
    if (!q) return this.airplanes;
    return this.airplanes.filter(a =>
      [a.code, a.model, a.airline, this.fmtRoute(a.route)].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }
  get flightsFiltered() {
    const q = this.flightQuery.trim().toLowerCase();
    if (!q) return this.flights;
    return this.flights.filter(f =>
      [f.code, f.airline, this.fmtRoute(f.route), this.fmtAirplane(f.airplane)]
        .some(v => String(v).toLowerCase().includes(q))
    );
  }

  /* ---- Load ---- */
  loadRoutes() {
    this.loadingRoutes = true; this.routesError = '';
    this.http.get<RouteDTO[]>(this.ROUTES_ENDPOINT, { headers: this.headers() }).subscribe({
      next: res => this.routes = Array.isArray(res) ? res : [],
      error: err => this.routesError = err?.error?.msg || 'Errore caricamento rotte',
      complete: () => this.loadingRoutes = false
    });
  }
  loadAirplanes() {
    this.loadingAirplanes = true; this.airplanesError = '';
    this.http.get<AirplaneDTO[]>(this.AIRPLANES_ENDPOINT, { headers: this.headers() }).subscribe({
      next: res => this.airplanes = Array.isArray(res) ? res : [],
      error: err => this.airplanesError = err?.error?.msg || 'Errore caricamento aeroplani',
      complete: () => this.loadingAirplanes = false
    });
  }
  loadFlights() {
    this.loadingFlights = true; this.flightsError = '';
    this.http.get<FlightDTO[]>(this.FLIGHTS_ENDPOINT, { headers: this.headers() }).subscribe({
      next: res => this.flights = Array.isArray(res) ? res : [],
      error: err => this.flightsError = err?.error?.msg || 'Errore caricamento voli',
      complete: () => this.loadingFlights = false
    });
  }

  /* ---- Create: Rotte ---- */
  resetRoute(){ this.newRoute = { from:{}, to:{} }; this.createRouteError=''; this.showAddRoute=false; }
  addRoute(){
    this.createRouteError = '';
    const payload: RouteDTO = {
      from: { ...this.newRoute.from },
      to: { ...this.newRoute.to }
    };
    if (!payload.from?.code || !payload.to?.code){
      this.createRouteError = 'Inserisci almeno i codici From/To.';
      return;
    }
    this.creatingRoute = true;
    this.http.post<RouteDTO>(this.ROUTES_ENDPOINT, payload, { headers: this.headers() }).subscribe({
      next: () => { this.resetRoute(); this.loadRoutes(); },
      error: err => this.createRouteError = err?.error?.msg || 'Errore creazione rotta',
      complete: () => this.creatingRoute = false
    });
  }

  /* ---- Create: Aeroplani ---- */
  resetAirplane(){ this.newAirplane = { code:'', model:'', airline:'', rows:0, letters:'' }; this.newAirplaneRouteRef=''; this.createAirplaneError=''; this.showAddAirplane=false; }
  addAirplane(){
    this.createAirplaneError = '';
    const payload: any = { ...this.newAirplane };
    if (this.newAirplaneRouteRef) payload.route = this.newAirplaneRouteRef;
    if (!payload.code || !payload.model || !payload.airline){
      this.createAirplaneError = 'Compila code, model e airline.';
      return;
    }
    this.creatingAirplane = true;
    this.http.post(this.AIRPLANES_ENDPOINT, payload, { headers: this.headers() }).subscribe({
      next: () => { this.resetAirplane(); this.loadAirplanes(); },
      error: err => this.createAirplaneError = err?.error?.msg || 'Errore creazione aeroplano',
      complete: () => this.creatingAirplane = false
    });
  }

  /* ---- Create: Voli ---- */
  resetFlight(){ this.newFlight = { code:'', departure:'', arrival:'', duration:0, route:'', airline:'', airplane:'' }; this.newFlightRouteRef=''; this.newFlightAirplaneRef=''; this.createFlightError=''; this.showAddFlight=false; }
  addFlight(){
    this.createFlightError = '';
    const payload: any = {
      code: this.newFlight.code,
      departure: this.newFlight.departure,
      arrival: this.newFlight.arrival,
      duration: Number(this.newFlight.duration),
      route: this.newFlightRouteRef || this.newFlight.route,
      airline: this.newFlight.airline,
      airplane: this.newFlightAirplaneRef || this.newFlight.airplane
    };
    if (!payload.code || !payload.route || !payload.airline || !payload.airplane){
      this.createFlightError = 'Compila code, route, airline, airplane.';
      return;
    }
    this.creatingFlight = true;
    this.http.post(this.FLIGHTS_ENDPOINT, payload, { headers: this.headers() }).subscribe({
      next: () => { this.resetFlight(); this.loadFlights(); },
      error: err => this.createFlightError = err?.error?.msg || 'Errore creazione volo',
      complete: () => this.creatingFlight = false
    });
  }
}
