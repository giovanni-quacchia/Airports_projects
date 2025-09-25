// core/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


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
    const body = { mail: email, password };
    return this.http.post<LoginResponse>(`${this.base}/sessions`, body)
      .pipe(
        tap(res => {
          this.setSession(
            res.token,
            this.decodeToken(res.token) || { email, isAdmin: email === 'admin@gmail.com' }
          );
        })
      );
  }

  loginCompagnia(email: string, password: string, newPassword = '') {
    const body = { mail: email, password, newPassword };
    return this.http.post<LoginResponse>(`${environment.apiBase}/airlines/sessions`, body)
      .pipe(
        tap(res => {
          this.setSession(
            res.token,
            this.decodeToken(res.token) || { email, isAdmin: email === 'admin@gmail.com' }
          );
        })
      );
  }

  register(email: string, password: string, name?: string) {
    const body = { mail: email, password, name };
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    return this.http.post<LoginResponse>(`${this.base}`, body)
      .pipe(
        tap(res => {
          this.setSession(res.token, { email, role });
        })
      );
  }


  decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Invalid JWT', e);
      return null;
    }
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
      window.location.href = '/';
    } catch {}
  }

  get token(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): any | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem(this.USER_KEY);
    if (!token) return null;
    return JSON.parse(token);
  }

  // Get current balance
  putCurrentBalance() {
    this.http.get<LoginResponse>(`${this.base}/${this.currentUser?.id}`, { headers: this.buildHeaders() })
      .subscribe(res => {
        const user: any = res;
        localStorage.setItem(this.USER_KEY, JSON.stringify({...user, id: user._id}));
      });
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('authorization', this.token);
    }
    return headers;
  } 

  get isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }
  isAirline(): boolean {
    return this.currentUser?.isAirline || false;
  }
}
