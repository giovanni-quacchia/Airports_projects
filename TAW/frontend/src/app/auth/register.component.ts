import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize, switchMap } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  template: `
  <div class="page">
    <div class="card">
      <div class="auth-head">
        <a class="back" routerLink="/search" aria-label="Torna alla Home">&lt;</a>
        <h2 class="title">Crea account</h2>
      </div>

      <form (ngSubmit)="onSubmit()" #f="ngForm" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="form.email" name="email" type="email" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="form.password" name="password" [type]="hide ? 'password':'text'" required minlength="6">
          <button mat-icon-button matSuffix type="button" (click)="hide = !hide" aria-label="Mostra/Nascondi password">
            <mat-icon>{{ hide ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
        </mat-form-field>

        <button mat-flat-button color="primary" class="cta" type="submit" [disabled]="f.invalid || loading">
          {{ loading ? 'Creazione…' : 'Crea account' }}
        </button>

        <p *ngIf="errorMsg" class="error">{{ errorMsg }}</p>
        <p class="muted">Hai già un account? <a routerLink="/login">Accedi</a></p>
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
  `]
})
export class RegisterComponent {
  form = { email: '', password: '' };
  hide = true;
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    this.auth.register(this.form.email, this.form.password)
      // auto-login subito dopo la registrazione
      .pipe(
        switchMap(() => this.auth.login(this.form.email, this.form.password)),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/search']);
        },
        error: (err) => {
          this.errorMsg = err?.error?.msg;
        }
      });
    }
}