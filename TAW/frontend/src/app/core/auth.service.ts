import { Injectable, signal, effect } from '@angular/core';
import { User, Credentials, RegisterDto } from './models';

const LS_USERS = 'taw_users';
const LS_SESSION = 'taw_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser;
  isLoggedIn = () => !!this._currentUser();
  role = () => this._currentUser()?.role;

  bootstrap() {
    const users = this.loadUsers();
    const uid = localStorage.getItem(LS_SESSION);
    const me = users.find(u => u.id === uid) ?? null;
    this._currentUser.set(me);
  }

  async register(dto: RegisterDto): Promise<User> {
    const users = this.loadUsers();
    if (users.some(u => u.email.toLowerCase() === dto.email.toLowerCase())) {
      throw new Error('Email già registrata');
    }
    const u: User = {
      id: crypto.randomUUID(),
      email: dto.email,
      name: dto.name,
      role: dto.role ?? 'passenger',
      passwordHash: await hash(dto.password),
    };
    users.push(u);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_SESSION, u.id);
    this._currentUser.set(u);
    return u;
  }

  async login({ email, password }: Credentials): Promise<User> {
    const users = this.loadUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error('Credenziali non valide');
    const ok = u.passwordHash === await hash(password);
    if (!ok) throw new Error('Credenziali non valide');
    localStorage.setItem(LS_SESSION, u.id);
    this._currentUser.set(u);
    return u;
  }

  logout() {
    localStorage.removeItem(LS_SESSION);
    this._currentUser.set(null);
  }

  private loadUsers(): User[] {
    try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); }
    catch { return []; }
  }
}

async function hash(txt: string): Promise<string> {
  const enc = new TextEncoder().encode(txt);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
