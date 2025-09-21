// src/app/compagnia/compagnia.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { finalize } from 'rxjs/operators';

/* ---- Tipi ---- */
type Airport = { _id?: string, name?: string; city?: string; code?: string; country?: string };
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
  numPassengers?: number;
  totRevenue?: number;
};
type AirportDTO = {
  _id: string;
  code: string;     // codice aeroporto, es. "FCO"
  name?: string;    // nome aeroporto, es. "Leonardo da Vinci"
  city?: string;    // città, es. "Roma"
  country?: string; // paese, es. "Italia"
}


@Component({
  standalone: true,
  selector: 'taw-compagnia-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <h1>Area Compagnia</h1>

      <div class="grid">

        <!-- ROTTE -->
        <div class="card stretch">
          <div class="card-head">
            <h3>Rotte</h3>
            <div class="actions">
              <input class="input" placeholder="Filtra…" [(ngModel)]="routeQuery">
              <button class="btn btn--sm" (click)="toggleMyRoutes()"
                      [class.btn--active]="showOnlyMyRoutes" title="show only my routes">
                {{ showOnlyMyRoutes ? 'Utilizzate' : 'Tutte' }}
              </button>
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
                  <select class="input" [(ngModel)]="newRoute.from" name="from" required>
                    <option *ngFor="let a of airports" [value]="a._id">
                      {{ a.city }} ({{ a.code }}) - {{ a.name }}
                    </option>
                  </select>
              </fieldset>

              <fieldset class="subcard">
                <legend>To</legend>
                  <select class="input" [(ngModel)]="newRoute.to" name="to" required>
                    <option *ngFor="let a of airports" [value]="a._id">
                      {{ a.city }} ({{ a.code }}) - {{ a.name }}
                    </option>
                  </select>
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
                <div>Code</div><div>Model</div><div>Route</div><div>Periodo</div>
              </div>
              <div class="row row-airplanes" *ngFor="let a of airplanesFiltered">
                <div>{{ a.code }}</div>
                <div>{{ a.model }}</div>
                <div>{{ fmtRoute(a.route, true) }}</div>
                <div>{{  formatDatetime(a.startDate) || '—' }} → {{ formatDatetime(a.endDate) || '—' }}</div>
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
                <select class="input" [(ngModel)]="newAirplaneRouteRef" name="aproute" required>
                  <option value="">Seleziona una rotta</option>
                  <option *ngFor="let route of routes" [value]="route._id">
                    {{ fmtRoute(route, true) }}
                  </option>
                </select>                
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
                <div>Code</div><div>Route</div><div>Airplane</div><div>Partenza</div><div>Arrivo</div><div>Durata</div><div>Numero passeggeri</div><div>Incasso</div>
              </div>
              <div class="row row-flights" *ngFor="let f of flightsFiltered">
                <div>{{ f.code }}</div>
                <div>{{ fmtRoute(f.route, true) }}</div>
                <div>{{ fmtAirplane(f.airplane) }}</div>
                <div>{{ formatDatetime(f.departure) }}</div>
                <div>{{ formatDatetime(f.arrival) }}</div>
                <div>{{ f.duration }} min</div>
                <div>{{ f.numPassengers }}</div>
                <div>{{ f.totRevenue }}</div>
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
                
                <select class="input" [(ngModel)]="newFlightRouteRef" name="flroute" required>
                  <option value="">Seleziona una rotta</option>
                  <option *ngFor="let route of routes" [value]="route._id">
                    {{ fmtRoute(route, true) }}
                  </option>
                </select>
                
                <select class="input" [(ngModel)]="newFlightAirplaneRef" name="flairplane" required>
                  <option value="">Seleziona un aeroplano</option>
                  <option *ngFor="let airplane of airplanes" [value]="airplane._id">
                    {{ airplane.code }} ({{ airplane.model }})
                  </option>
                </select>
                
                <input class="input" type="datetime-local" placeholder="Departure" [(ngModel)]="newFlight.departure" name="fldep" required>
                <input class="input" type="datetime-local" placeholder="Arrival" [(ngModel)]="newFlight.arrival" name="flarr" required>
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
    .thead-airplanes,.row-airplanes{grid-template-columns:120px 1fr 1fr 1fr}
    .thead-flights,.row-flights{grid-template-columns:120px 1fr 100px 1fr 1fr 100px 100px 100px}

    .form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}

    .btn--active {
      background: #0b7285 !important;
    }

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
  private auth = inject(AuthService);
  private ROUTES_ENDPOINT = `${this.base}/routes`;
  private AIRPLANES_ENDPOINT = `${this.base}/airlines/${this.auth.currentUser?.id}/airplanes`;
  private FLIGHTS_ENDPOINT = `${this.base}/airlines/${this.auth.currentUser?.id}/flights`;
  private AIRPORTS_ENDPOINT = `${this.base}/airports`;

  constructor(private http: HttpClient) {}

  /* ---- Stato liste/filtri ---- */
  routes: RouteDTO[] = [];
  airplanes: AirplaneDTO[] = [];
  flights: FlightDTO[] = [];
  airports: AirportDTO[] = [];

  showOnlyMyRoutes = false; 

  routeQuery = ''; airplaneQuery = ''; flightQuery = ''; airportQuery = '';

  loadingRoutes = false; loadingAirplanes = false; loadingFlights = false; loadingAiports = false;
  routesError = ''; airplanesError = ''; flightsError = ''; airportsError = '';

  /* ---- Stato creazione ---- */
  showAddRoute = false; creatingRoute = false; createRouteError = '';
  newRoute: { from: string; to: string } = { from: '', to: '' };

  showAddAirplane = false; creatingAirplane = false; createAirplaneError = '';
  newAirplane: AirplaneDTO = { code:'', model:'', airline:this.auth.currentUser?.id, rows:0, letters:'' };
  newAirplaneRouteRef = ''; // id rotta o lasciato vuoto

  showAddFlight = false; creatingFlight = false; createFlightError = '';
  newFlight: FlightDTO = { code:'', departure:'', arrival:'', duration:0, route:'', airline:this.auth.currentUser?.id, airplane:'' };
  newFlightRouteRef = ''; newFlightAirplaneRef = '';

  ngOnInit(): void {
    this.loadRoutes();
    this.loadAirplanes();
    this.loadFlights();
    this.loadAirports();
  }

  /* ---- Helpers ---- */
  private headers(): HttpHeaders {
    const t = this.auth.token;
    let h = new HttpHeaders();
    if (t) h = h.set('authorization', t);
    return h;
  }
  fmtAirport(a?: Airport | string, short = false): string {
    if (!a) return '—';
    if (typeof a === 'string') {
      // trova l'aeroporto in this.airports
      const ap = this.airports.find(x => x._id === a);
      if (!ap) return a; // se non trovato, mostra l'id
      a = ap;
    }
    const parts = [a.city, a.name, a.code, a.country].filter(Boolean);
    if(short) return a.code || '—';
    return parts.join(' · ');
  }

fmtRoute(r: any, short = false): string {
  if (!r) return '—';
  if (typeof r === 'string') {
    const route = this.routes.find(x => x._id === r);
    return route ? `${this.fmtAirport(route.from)} → ${this.fmtAirport(route.to)}` : r;
  }
  return `${this.fmtAirport(r.from, short)} → ${this.fmtAirport(r.to, short)}`;
}

  fmtAirplane(a: any): string {
    if (!a) return '—';
    if (typeof a === 'string') return a;
    return `${a.code} (${a.model})`;
  }

  formatDatetime(ts: string | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
    this.http.get<RouteDTO[]>(`${this.base}` + `${this.showOnlyMyRoutes ? `/airlines/${this.auth.currentUser?.id}/` : ""}` + "/routes", { headers: this.headers() }).subscribe({
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
    this.http.get<FlightDTO[]>(this.FLIGHTS_ENDPOINT + "?statistics=true", { headers: this.headers() }).subscribe({
      next: res => this.flights = Array.isArray(res) ? res : [],
      error: err => this.flightsError = err?.error?.msg || 'Errore caricamento voli',
      complete: () => this.loadingFlights = false
    });
  }
  loadAirports() {
    this.loadingAiports = true; this.airportsError = '';
    this.http.get<AirportDTO[]>(this.AIRPORTS_ENDPOINT, { headers: this.headers() }).subscribe({
      next: res => this.airports = Array.isArray(res) ? res : [],
      error: err => this.airportsError = err?.error?.msg || 'Errore caricamento aeroporti',
    });
  }

  /* ---- Create: Rotte ---- */
resetRoute() {
  this.newRoute = { from: '', to: '' };
  this.createRouteError = '';
  this.showAddRoute = false;
}

addRoute() {
  this.createRouteError = '';

  const payload = { from: this.newRoute.from, to: this.newRoute.to };

  if (!payload.from || !payload.to) {
    this.createRouteError = 'Seleziona From e To.';
    return;
  }

  this.creatingRoute = true;
  this.http.post<RouteDTO>(this.ROUTES_ENDPOINT, payload, { headers: this.headers() })
    .pipe(finalize(() => this.creatingRoute = false))
    .subscribe({
      next: () => { 
        this.resetRoute(); 
        this.loadRoutes(); 
      },
      error: err => this.createRouteError = err?.error?.msg || 'Errore creazione rotta'
    });
}

toggleMyRoutes() {
  console.log("ciao")
  this.showOnlyMyRoutes = !this.showOnlyMyRoutes;
  this.loadRoutes();
}

  /* ---- Create: Aeroplani ---- */
  resetAirplane(){ this.newAirplane = { code:'', model:'', airline:this.auth.currentUser?.id, rows:0, letters:'' }; this.newAirplaneRouteRef=''; this.createAirplaneError=''; this.showAddAirplane=false; }
  addAirplane(){
    this.createAirplaneError = '';
    const payload: any = { ...this.newAirplane };
    console.log(payload)
    if (this.newAirplaneRouteRef) payload.route = this.newAirplaneRouteRef;
    if (!payload.code || !payload.model || !payload.rows || !payload.letters){
      this.createAirplaneError = 'Compila code, model, rows, letters';
      return;
    }
    this.creatingAirplane = true;
    this.http.post(`${this.base}/airplanes`, payload, { headers: this.headers() })
    .pipe(finalize(() => this.creatingAirplane = false))
    .subscribe({
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
      departure: new Date(this.newFlight.departure).toISOString(),
      arrival: new Date(this.newFlight.arrival).toISOString(),
      duration: this.newFlight.arrival && this.newFlight.departure ? ( (new Date(this.newFlight.arrival).getTime() - new Date(this.newFlight.departure).getTime()) / 60000 ) : 0,
      route: this.newFlightRouteRef || this.newFlight.route,
      airline: this.auth.currentUser?.id,
      airplane: this.newFlightAirplaneRef || this.newFlight.airplane
    };
    if (!payload.code || !payload.route || !payload.airplane || !payload.departure || !payload.arrival){
      this.createFlightError = 'Compila code, route, airplane, departure, arrival';
      return;
    }
    this.creatingFlight = true;
    this.http.post(`${this.base}/flights`, payload, { headers: this.headers() })
    .pipe(finalize(() => this.creatingFlight = false))
    .subscribe({
      next: () => { this.resetFlight(); this.loadFlights(); },
      error: err => this.createFlightError = err?.error?.msg || 'Errore creazione volo',
      complete: () => this.creatingFlight = false
    });
  }
}
