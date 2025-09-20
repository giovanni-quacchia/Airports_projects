// core/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs/operators';


export interface LoginResponse { token: string; user: any; }
export interface RegisterResponse { id: string; user?: any; token?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiBase}/users`;
  private readonly TOKEN_KEY = 'taw_token';
  private readonly USER_KEY = 'taw_user';

  // SSR-safe flag
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  // ---------- API ----------
  login(email: string, password: string) {
    const params = new HttpParams()
      .set('mail', email ?? '')
      .set('password', password ?? '');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');
    const role  = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    return this.http.post<LoginResponse>(`${this.base}/sessions`, params.toString(), { headers })
      .pipe(
        tap(res => {
          // Qui aggiungo la mail che conosco (perché l’ho usata nel login)
          this.setSession(res.token, { email, role });
        })
      );
  }


  register(email: string, password: string, name?: string) {
    const body = new HttpParams()
      .set('mail', email ?? '')
      .set('password', password ?? '');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');
    const role  = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    return this.http.post<LoginResponse>(`${this.base}`, body.toString(), { headers })
      .pipe(
        tap(res => {
          // salvo email e magari anche il nome
          this.setSession(res.token, { email, role });
        })
      );
  }

  // ---------- Storage (safe in SSR) ----------
  setSession(token: string, user: any) {
    if (!this.isBrowser) return; // in SSR non fare nulla
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch {}
  }

  get token(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): any | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  get isAdmin(): boolean {
    const u = this.currentUser;
    return !!u && (u.role === 'admin' || (u.email || '').toLowerCase() === 'admin@gmail.com');
  }
}
