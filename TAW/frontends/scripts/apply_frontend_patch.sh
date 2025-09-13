#!/usr/bin/env bash
set -euo pipefail

# --- Paths ---
APP=src/app
ENV_DIR=src/environments

mkdir -p "$APP/auth" "$APP/core" "$APP/search" "$APP/booking" "$APP/admin" "$APP/airline" "$ENV_DIR" "scripts"

# --- environment.ts ---
cat > "$ENV_DIR/environment.ts" <<'TS'
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws'
};
TS

# --- app.routes.ts (exports `routes`) ---
cat > "$APP/app.routes.ts" <<'TS'
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./search/search.page').then(c => c.SearchPageComponent) },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register.component').then(c => c.RegisterComponent) },

  // Booking demo: seat map
  { path: 'booking/review', loadComponent: () => import('./booking/seat-map.component').then(c => c.SeatMapComponent) },

  // Stubs per evitare errori di lazy-load mancanti
  { path: 'airline', loadComponent: () => import('./airline/airline-shell.component').then(c => c.AirlineShellComponent) },
  { path: 'admin',  loadComponent: () => import('./admin/admin-shell.component').then(c => c.AdminShellComponent) },

  { path: '**', redirectTo: '' }
];
TS

# --- app.component.ts (standalone + Material toolbar) ---
cat > "$APP/app.component.ts" <<'TS'
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="brand" routerLink="/">TAW Airlines</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/login">Login</a>
      <a mat-button routerLink="/register">Register</a>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`.toolbar{position:sticky;top:0;z-index:10}.brand{font-weight:700;cursor:pointer}.spacer{flex:1}`]
})
export class AppComponent {}
TS

# --- core: token storage, auth service, guards, interceptors, models ---
cat > "$APP/core/models.ts" <<'TS'
export type CabinClass = 'ECONOMY'|'BUSINESS'|'FIRST';
export interface Flight {
  id:string; routeId:string; aircraftId:string;
  departure:string; arrival:string;
  prices:Record<CabinClass,number>;
  availability:Record<CabinClass,number>;
}
export interface TripAlternative {
  segments: Array<{ flight: Flight; cabin: CabinClass }>;
  totalPrice:number;
  totalDurationMin:number;
  stops:0|1;
}
export interface Extra { code: 'EXTRA_BAG'|'EXTRA_LEGROOM'; price:number; }
export interface SeatStatus { seatId:string; status:'FREE'|'LOCKED'|'TAKEN'; }
TS

cat > "$APP/core/token-storage.service.ts" <<'TS'
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private key = 'taw.jwt';
  get(): string | null { return localStorage.getItem(this.key); }
  set(token: string) { localStorage.setItem(this.key, token); }
  clear() { localStorage.removeItem(this.key); }
}
TS

cat > "$APP/core/auth.service.ts" <<'TS'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User { id:string; email:string; role:'passenger'|'airline'|'admin'; }
export interface LoginReq { email:string; password:string; }
export interface LoginRes { token:string; user:User; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private me$ = new BehaviorSubject<User | null>(null);
  constructor(private http: HttpClient) {}
  login(req: LoginReq){
    return this.http.post<LoginRes>(`${environment.apiBaseUrl}/auth/login`, req)
      .pipe(tap(res => { localStorage.setItem('taw.jwt', res.token); this.me$.next(res.user); }));
  }
  registerPassenger(payload: {email:string; password:string}){
    return this.http.post(`${environment.apiBaseUrl}/auth/register`, payload);
  }
  me(){ return this.me$.asObservable(); }
  current(){ return this.me$.value; }
  logout(){ localStorage.removeItem('taw.jwt'); this.me$.next(null); }
}
TS

cat > "$APP/core/auth.interceptor.ts" <<'TS'
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const jwt = localStorage.getItem('taw.jwt');
    return next.handle(jwt ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } }) : req);
  }
}
TS

cat > "$APP/core/error.interceptor.ts" <<'TS'
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError((err: HttpErrorResponse) => {
      console.error('HTTP error', err.status, err.message);
      return throwError(() => err);
    }));
  }
}
TS

cat > "$APP/core/auth.guard.ts" <<'TS'
import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const has = !!localStorage.getItem('taw.jwt');
  if (!has) {
    const router = (inject(Router));
    router.navigateByUrl('/login');
  }
  return has;
};
import { inject } from '@angular/core';
TS

cat > "$APP/core/role.guard.ts" <<'TS'
import { CanActivateFn, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const roles = route.data['roles'] as string[] || [];
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.current();
  if (!u || !roles.includes(u.role)) { router.navigateByUrl('/'); return false; }
  return true;
};
TS

# --- auth components (standalone; niente </mat-input>) ---
cat > "$APP/auth/login.component.ts" <<'TS'
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
    <h2>Login</h2>
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" type="email">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput formControlName="password" type="password">
    </mat-form-field>
    <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Entra</button>
  </form>
  `,
  styles:[`.auth-form{max-width:360px;margin:40px auto;display:flex;flex-direction:column;gap:12px}`]
})
export class LoginComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  submit(){ if(this.form.invalid) return; this.auth.login(this.form.value as any).subscribe({ next: () => this.router.navigateByUrl('/'), error: () => alert('Login fallito')}); }
}
TS

cat > "$APP/auth/register.component.ts" <<'TS'
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
    <h2>Registrati (Passenger)</h2>
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" type="email">
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Password</mat-label>
      <input matInput formControlName="password" type="password">
    </mat-form-field>
    <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Crea account</button>
  </form>
  `,
  styles:[`.auth-form{max-width:420px;margin:40px auto;display:flex;flex-direction:column;gap:12px}`]
})
export class RegisterComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  submit(){ if(this.form.invalid) return; this.auth.registerPassenger(this.form.value as any).subscribe({ next: () => this.router.navigateByUrl('/login'), error: () => alert('Registrazione fallita')}); }
}
TS

# --- search (standalone) ---
cat > "$APP/search/flight-search.service.ts" <<'TS'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TripAlternative } from '../core/models';

export interface SearchParams { from:string; to:string; date:string; pax:number; cabin:'ECONOMY'|'BUSINESS'|'FIRST'; }

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  constructor(private http: HttpClient) {}
  searchTrips(params: SearchParams): Observable<TripAlternative[]> {
    const httpParams = new HttpParams({ fromObject: { ...params as any } });
    return this.http.get<TripAlternative[]>(`${environment.apiBaseUrl}/search`, { params: httpParams });
  }
}
TS

cat > "$APP/search/searchbar.component.ts" <<'TS'
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatButtonModule],
  template: `
<form [formGroup]="form" (ngSubmit)="submit()" class="search">
  <mat-form-field appearance="outline"><mat-label>From</mat-label><input matInput formControlName="from"></mat-form-field>
  <mat-form-field appearance="outline"><mat-label>To</mat-label><input matInput formControlName="to"></mat-form-field>
  <mat-form-field appearance="outline"><mat-label>Date</mat-label><input matInput [matDatepicker]="dp" formControlName="date"><mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle><mat-datepicker #dp></mat-datepicker></mat-form-field>
  <mat-form-field appearance="outline"><mat-label>Pax</mat-label><input type="number" matInput formControlName="pax" min="1"></mat-form-field>
  <mat-form-field appearance="outline"><mat-label>Cabin</mat-label>
    <mat-select formControlName="cabin">
      <mat-option value="ECONOMY">Economy</mat-option>
      <mat-option value="BUSINESS">Business</mat-option>
      <mat-option value="FIRST">First</mat-option>
    </mat-select>
  </mat-form-field>
  <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Search</button>
</form>
`, styles:[`.search{display:grid;grid-template-columns:repeat(5, minmax(160px,1fr));gap:12px;padding:16px}`]
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<any>();
  form = this.fb.group({
    from:['', Validators.required],
    to:['', Validators.required],
    date:[new Date(), Validators.required],
    pax:[1,[Validators.required, Validators.min(1)]],
    cabin:['ECONOMY', Validators.required]
  });
  constructor(private fb: FormBuilder){}
  submit(){ if(this.form.invalid) return; const v=this.form.value as any; this.search.emit({ ...v, date: (v.date as Date).toISOString().slice(0,10) }); }
}
TS

cat > "$APP/search/results-list.component.ts" <<'TS'
import { Component, Input } from '@angular/core';
import { TripAlternative } from '../core/models';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [MatCardModule, RouterModule, MatButtonModule],
  template: `
  <ng-container *ngIf="results?.length; else empty">
    <mat-card *ngFor="let alt of results; let i = index" class="card">
      <div class="row">
        <div>
          <div>{{alt.stops === 0 ? 'Diretto' : '1 scalo'}}</div>
          <div>Durata: {{alt.totalDurationMin}} min</div>
        </div>
        <div class="price">€ {{alt.totalPrice | number:'1.0-2'}}</div>
      </div>
      <button mat-stroked-button color="primary" [routerLink]="['/booking','review']" [queryParams]="{ altId: i }">Scegli</button>
    </mat-card>
  </ng-container>
  <ng-template #empty><p style="padding:16px">Nessun risultato.</p></ng-template>
  `,
  styles:[`.card{margin:8px 16px}.row{display:flex;justify-content:space-between;align-items:center}.price{font-size:20px;font-weight:700}`]
})
export class ResultsListComponent { @Input() results: TripAlternative[] = []; }
TS

cat > "$APP/search/search.page.ts" <<'TS'
import { Component } from '@angular/core';
import { FlightSearchService, SearchParams } from './flight-search.service';
import { ResultsListComponent } from './results-list.component';
import { SearchBarComponent } from './searchbar.component';
import { TripAlternative } from '../core/models';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchBarComponent, ResultsListComponent],
  template: `
    <app-search-bar (search)="doSearch($event)"></app-search-bar>
    <app-results-list [results]="results"></app-results-list>
  `
})
export class SearchPageComponent {
  results: TripAlternative[] = [];
  constructor(private fs: FlightSearchService) {}
  doSearch(params: SearchParams){ this.fs.searchTrips(params).subscribe(r => this.results = r); }
}
TS

# --- booking (standalone seat map + ws service) ---
cat > "$APP/booking/seat-availability.service.ts" <<'TS'
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SeatStatus } from '../core/models';

@Injectable({ providedIn: 'root' })
export class SeatAvailabilityService {
  constructor(private zone: NgZone) {}
  connect(flightId: string): Observable<SeatStatus[]> {
    return new Observable(sub => {
      const ws = new WebSocket(`${environment.wsUrl}/seats?flightId=${flightId}`);
      ws.onmessage = (ev) => this.zone.run(() => sub.next(JSON.parse(ev.data)));
      ws.onerror = (e) => this.zone.run(() => sub.error(e));
      ws.onclose = () => this.zone.run(() => sub.complete());
      return () => ws.close();
    });
  }
}
TS

cat > "$APP/booking/seat-map.component.ts" <<'TS'
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeatAvailabilityService } from './seat-availability.service';
import { SeatStatus } from '../core/models';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [NgFor, MatButtonModule],
  template: `
  <div class="legend">
    <span class="free"></span> Libero
    <span class="locked"></span> Bloccato
    <span class="taken"></span> Occupato
  </div>
  <div class="grid">
    <button *ngFor="let s of seatList" class="seat"
            [class.locked]="s.status==='LOCKED'"
            [class.taken]="s.status==='TAKEN'"
            (click)="toggle(s)" [disabled]="s.status!=='FREE'">
      {{s.seatId}}
    </button>
  </div>
  <div class="actions"><button mat-flat-button color="primary" (click)="checkout()">Procedi</button></div>
  `,
  styles:[`
  .grid{display:grid;grid-template-columns:repeat(6, 48px);gap:8px;padding:16px}
  .seat{height:48px}
  .seat.locked{background:#ffca28}
  .seat.taken{background:#e57373;color:#fff}
  .legend{display:flex;gap:12px;align-items:center;padding:8px}
  .legend span{display:inline-block;width:16px;height:16px;border:1px solid #999}
  .legend .free{background:#e0f7fa}
  .legend .locked{background:#ffecb3}
  .legend .taken{background:#ffcdd2}
  .actions{padding:16px}
`]
})
export class SeatMapComponent implements OnInit, OnDestroy {
  seatList: SeatStatus[] = Array.from({length: 30}, (_,i)=>({ seatId: `A${i+1}`, status: 'FREE' as const }));
  sub?: any;
  constructor(private seatSvc: SeatAvailabilityService) {}
  ngOnInit(){
    this.sub = this.seatSvc.connect('demo-flight-1').subscribe(update => {
      const map = new Map(this.seatList.map(s => [s.seatId, s]));
      for (const u of update) { const s = map.get(u.seatId); if (s) s.status = u.status; }
      this.seatList = Array.from(map.values());
    });
  }
  ngOnDestroy(){ this.sub?.unsubscribe?.(); }
  toggle(s: SeatStatus){ s.status = s.status === 'FREE' ? 'LOCKED' : 'FREE'; }
  checkout(){ alert('Proceed to checkout (stub)'); }
}
TS

# --- stubs per admin/airline ---
cat > "$APP/admin/admin-shell.component.ts" <<'TS'
import { Component } from '@angular/core';
@Component({ selector: 'app-admin-shell', standalone: true, template: `<div style="padding:16px">Admin area (stub)</div>` })
export class AdminShellComponent {}
TS

cat > "$APP/airline/airline-shell.component.ts" <<'TS'
import { Component } from '@angular/core';
@Component({ selector: 'app-airline-shell', standalone: true, template: `<div style="padding:16px">Airline area (stub)</div>` })
export class AirlineShellComponent {}
TS

# --- rimuovi file che causano conflitti (NgModule/vecchi moduli) ---
rm -f "$APP/app.module.ts" 2>/dev/null || true
rm -f "$APP/search/search.module.ts" 2>/dev/null || true
rm -f "$APP/booking/booking.module.ts" 2>/dev/null || true

echo "✅ Patch applicata. Ora: npm i @angular/material @angular/cdk && ng serve -o"
