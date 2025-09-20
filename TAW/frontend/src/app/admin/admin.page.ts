import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'taw-admin-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wrap">
      <h1>Area Admin</h1>
      <p class="muted">Solo gli utenti con ruolo <strong>admin</strong> possono accedere.</p>

      <div class="grid">
        <a routerLink="/search" class="card">
          <h3>Ricerca voli</h3>
          <p>Vai alla ricerca per verifiche rapide.</p>
        </a>

        <div class="card">
          <h3>Impostazioni sito</h3>
          <p>Qui puoi gestire configurazioni (placeholder).</p>
          <button class="btn" type="button">Salva modifiche</button>
        </div>

        <div class="card">
          <h3>Gestione posti</h3>
          <p>Controlla lo stato dei posti e blocchi manuali (placeholder).</p>
          <button class="btn btn--outline" type="button">Apri modulo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrap{max-width:1000px;margin:24px auto;padding:0 16px}
    .muted{color:#475569}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:16px}
    .card{display:block;border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff;text-decoration:none;color:inherit}
    .card h3{margin:0 0 8px;font-size:18px}
    .btn{margin-top:12px;background:#0ea5e9;color:#fff;border:none;border-radius:999px;padding:8px 14px;cursor:pointer}
    .btn--outline{background:#fff;color:#0b7285;border:1px solid #0b7285}
    @media (max-width:900px){ .grid{grid-template-columns:1fr} }
  `]
})
export class AdminPage {}
