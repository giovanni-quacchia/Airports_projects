import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'taw-purchase-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <a routerLink="/search" class="back">← Torna ai risultati</a>

      <h1>Riepilogo acquisto</h1>

      <ng-container *ngIf="flight; else missing">
        <section class="card">
          <h2>{{ airlineName }} — {{ flightCode }}</h2>

          <p>
            {{ originCode }} → {{ destinationCode }}<br>
            Partenza: {{ departTime | date:'short' }}<br>
            Arrivo:   {{ arriveTime | date:'short' }}<br>
            Durata:   {{ totalDuration }} min
          </p>

          <p class="price">
            Prezzo: {{ priceDisplay }}
          </p>
        </section>

        <form [formGroup]="form" (ngSubmit)="onPay()">
          <h3>Dati passeggero</h3>
          <div class="grid">
            <label>Nome <input formControlName="firstName" required /></label>
            <label>Cognome <input formControlName="lastName" required /></label>
            <label>Email <input formControlName="email" type="email" required /></label>
          </div>

          <h3>Pagamento</h3>
          <div class="grid">
            <label>Numero carta
              <input formControlName="cardNumber" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" required />
            </label>
            <label>Scadenza (MM/YY)
              <input formControlName="exp" placeholder="12/30" required />
            </label>
            <label>CVC
              <input formControlName="cvc" inputmode="numeric" maxlength="4" required />
            </label>
          </div>

          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Elaborazione…' : 'Paga e conferma' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">Acquisto completato! Controlla la tua email per la conferma.</p>
        </form>
      </ng-container>

      <ng-template #missing>
        <p>Nessun volo selezionato. Torna alla <a routerLink="/search">ricerca</a>.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .container{max-width:960px;margin:24px auto;padding:0 16px}
    .card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-bottom:16px;background:#fff}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    label{display:flex;flex-direction:column;font-weight:600}
    input{border:1px solid #cbd5e1;border-radius:10px;padding:10px;margin-top:6px}
    .price{font-size:18px;font-weight:700}
    .btn{margin-top:16px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:10px 16px;cursor:pointer}
    .error{color:#b42318;margin-top:12px}
    .success{color:#027a48;margin-top:12px}
    .back{display:inline-block;margin-bottom:16px;text-decoration:none}
    @media (max-width: 800px){ .grid{grid-template-columns:1fr} }
  `]
})
export class PurchasePage implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  isBrowser = isPlatformBrowser(this.platformId);

  flight: any = null;

  // UI
  loading = false;
  error = '';
  success = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    cardNumber:['', [Validators.required, Validators.minLength(12)]],
    exp:       ['', Validators.required],
    cvc:       ['', [Validators.required, Validators.minLength(3)]],
  });

  // ---- LIFECYCLE ----
  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.flight = (nav?.extras?.state as any)?.flight ?? null;
    if (!this.flight && this.isBrowser) {
      this.flight = (window as any).history?.state?.flight ?? null;
    }
  }

  // ---- MAPPERS ESATTI PER LA SHAPE DEL TUO LOG ----
  get airlineName(): string {
    return this.flight?.airline?.name || this.flight?.airline?.code || 'Compagnia';
  }
  get flightCode(): string {
    return this.flight?.code || '';
  }
  get originCode(): string {
    return this.flight?.route?.from?.code || '';
  }
  get destinationCode(): string {
    return this.flight?.route?.to?.code || '';
  }
  get departTime(): string | Date | null {
    return this.flight?.departure ?? null;
  }
  get arriveTime(): string | Date | null {
    return this.flight?.arrival ?? null;
  }
  get totalDuration(): number {
    return typeof this.flight?.totDuration === 'number'
      ? this.flight.totDuration
      : (typeof this.flight?.duration === 'number' ? this.flight.duration : 0);
  }
  get computedPrice(): number | null {
    // se non hai price a root, prova a sommare eventuali prezzi sui segmenti
    const s1 = this.flight?.stop1?.price ?? 0;
    const s2 = this.flight?.stop2?.price ?? 0;
    const s3 = this.flight?.stop3?.price ?? 0;
    const root = this.flight?.price;
    if (typeof root === 'number') return root;
    const sum = [s1, s2, s3].reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    return sum > 0 ? sum : null;
  }
  get priceDisplay(): string {
    return this.computedPrice != null
      ? (new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(this.computedPrice))
      : '—';
  }

  // ---- ACTION ----
  onPay() {
    if (this.form.invalid || !this.flight) return;
    this.loading = true;
    this.error = '';
    this.success = false;

    const payload = {
      flightId: this.flight._id ?? this.flight.id ?? null,
      flight: this.flight,
      price: this.computedPrice,
      passenger: this.form.value,
    };

    this.http.post(`${environment.apiBase}/bookings`, payload).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (e) => {
        this.error = (e as any)?.error?.message || 'Pagamento non riuscito';
        this.loading = false;
      }
    });
  }
}
