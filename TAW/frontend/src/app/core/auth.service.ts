// src/app/core/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Credentials, RegisterDto, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBase;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  login(body: Credentials) {
    return this.http.post<{ token: string; user: User }>(`${this.base}/users/sessions`, body);
  }

  register(body: RegisterDto) {
    return this.http.post<{ token?: string; user?: User }>(`${this.base}/users`, body);
  }

  storeToken(t: string) { if (this.isBrowser) localStorage.setItem('taw_token', t); }
  storeUser(u: User)     { if (this.isBrowser) localStorage.setItem('taw_user', JSON.stringify(u)); }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem('taw_token');
    localStorage.removeItem('taw_user');
  }

  /** Usato nel template: ok anche in SSR (ritorna null lato server) */
  currentUser(): User | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem('taw_user');
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  }

  token(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('taw_token');
  }
}
