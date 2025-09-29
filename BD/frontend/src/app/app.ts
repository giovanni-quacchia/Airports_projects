import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
    <header class="navbar">
      <a routerLink="/search" class="brand">BD Airlines</a>
      <span class="grow"></span>

      <ng-container *ngIf="!auth.currentUser">
        <a routerLink="/login" class="btn">Accedi</a>
        <a routerLink="/register" class="btn btn--outline">Registrati</a>
      </ng-container>

      <ng-container *ngIf="auth.currentUser as u">
        <span class="hello">Benvenuto, {{u.email || u.mail}}</span>
        <span *ngIf="auth.isUserNotAdmin()" class="hello">Saldo: {{u.balance || 0}} €</span>
        <a *ngIf="auth.isAdmin" routerLink="/admin" class="btn btn--outline">Admin</a>
        <a *ngIf="auth.isAirline()" routerLink="/compagnia" class="btn btn--outline">Compagnia Aerea</a>
        <button class="btn btn--danger" (click)="auth.logout()">Logout</button>
      </ng-container>
    </header>

    <router-outlet />
  `,
  styles: [`
    .navbar{display:flex;align-items:center;padding:10px 16px;background:#fff;
            box-shadow:0 2px 4px rgba(0,0,0,.05);}
    .brand{font-weight:600;text-decoration:none;color:#0b7285;}
    .grow{flex:1}
    .hello{margin-right:12px;color:#0f172a}
    .btn{display:inline-flex;align-items:center;justify-content:center;
         padding:8px 14px;border-radius:999px;border:1px solid transparent;
         background:#1992b5;color:#fff;text-decoration:none;font-weight:600;
         transition:transform .05s ease, box-shadow .2s ease;margin-left:12px}
    .btn:hover{box-shadow:0 4px 16px rgba(0,0,0,.12)}
    .btn:active{transform:translateY(1px)}
    .btn--outline{background:#fff;color:#0b7285;border-color:#0b7285}
    .btn--danger{background:#b42318;color:#fff;border-color:#b42318}
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
