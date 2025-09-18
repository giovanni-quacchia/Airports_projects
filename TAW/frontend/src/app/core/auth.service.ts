// core/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

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
  login(mail: string, password: string) {
    const params = new HttpParams().set('mail', mail ?? '').set('password', password ?? '');
     const headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post<LoginResponse>(`${this.base}/sessions`, params.toString(), {headers});
  }

  register(email: string, password: string, name?: string) {
    const body = new HttpParams().set('mail', email ?? '').set('password', password ?? '');
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post<LoginResponse>(`${this.base}`, body.toString(), {headers});
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
}
