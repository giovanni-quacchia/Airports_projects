import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
  <div class="page">
    <div class="card">
      <div class="auth-head">
        <a class="back" routerLink="/search" aria-label="Torna alla Home">&lt;</a>
        <h2 class="title">Accedi</h2>
      </div>

      <form (ngSubmit)="onSubmit()" #f="ngForm" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="form.mail" name="mail" type="email" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="form.password" name="password" [type]="hide ? 'password':'text'" required>
          <button mat-icon-button matSuffix type="button" (click)="hide = !hide" aria-label="Mostra/Nascondi password">
            <mat-icon>{{ hide ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
        </mat-form-field>

        <!-- iOS-like switch -->
        <label class="ios-switch" role="switch" [attr.aria-checked]="asAirline">
          <input
            type="checkbox"
            [(ngModel)]="asAirline"
            name="asAirline"
            (keydown.space)="$event.preventDefault()"
            aria-label="Accedi come compagnia aerea" />
          <span class="track">
            <span class="thumb"></span>
          </span>
          <span class="switch-label">Accedi come compagnia aerea</span>
        </label>

        <button mat-flat-button color="primary" class="cta" type="submit" [disabled]="f.invalid || loading">
          {{ loading ? 'Accesso…' : (asAirline ? 'Entra (Compagnia)' : 'Entra') }}
        </button>

        <p *ngIf="errorMsg" class="error">{{ errorMsg }}</p>

        <p class="muted">Nuovo utente? <a routerLink="/register">Crea un account</a></p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .page{ display:flex; justify-content:center; padding:40px 16px; }
    .card{ width:100%; max-width:520px; background:#fff; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,.08); padding:24px; }
    .auth-head{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .back{ display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:#e6f4f8; color:#0b7285; font-weight:700; text-decoration:none; }
    .title{ margin:0; color:#0b7285; font-size:1.75rem; }
    .form{ display:flex; flex-direction:column; gap:14px; margin-top:8px; }
    .cta{ border-radius:999px; padding:12px 24px; }
    .muted{ color:#64748b; margin:10px 0 0; }
    .error{ color:#b42318; margin:6px 0 0; }
    :host ::ng-deep .mat-mdc-form-field-infix{ padding:14px 16px !important; }
    :host ::ng-deep .mat-mdc-text-field-wrapper{ border-radius:12px !important; }

    /* --- iOS style switch --- */
    .ios-switch{
      display:flex; align-items:center; gap:10px; user-select:none; cursor:pointer;
    }
    .ios-switch input{
      position:absolute; opacity:0; width:0; height:0;
    }
    .ios-switch .track{
      position:relative; width:51px; height:31px; border-radius:999px;
      background:#d1d5db; transition:background .2s ease;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.06);
      display:inline-block;
    }
    .ios-switch .thumb{
      position:absolute; top:3px; left:3px; width:25px; height:25px; border-radius:50%;
      background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.2);
      transition:transform .2s ease;
    }
    .ios-switch input:checked + .track{
      background:#34c759; /* iOS green */
    }
    .ios-switch input:checked + .track .thumb{
      transform: translateX(20px);
    }
    
    .switch-label{ color:#334155; font-size:.95rem; }
  `]
})
export class LoginComponent {
  form = { mail: '', password: '' };
  hide = true;
  loading = false;
  errorMsg = '';
  asAirline = false;

  constructor(private auth: AuthService, private http: HttpClient, private router: Router ) {}
  base = environment.apiBase;

  onSubmit(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    const auth$: Observable<any> = this.asAirline
      ? this.auth.loginCompagnia(this.form.mail, this.form.password)
      : this.auth.login(this.form.mail, this.form.password);

    auth$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => this.router.navigate(['/search']),
        error: (err) => this.errorMsg = err?.error?.msg || 'Accesso non riuscito'
      });
  }
}
