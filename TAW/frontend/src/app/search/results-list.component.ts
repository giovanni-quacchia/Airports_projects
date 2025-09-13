import { Component, Input } from '@angular/core';
import type { FlightSearchParams } from './searchbar.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'taw-results-list',
  standalone: true,
  imports: [CommonModule,MatIconModule, DecimalPipe],
  template: `
  <div class="filters" *ngIf="query">
    <span class="badge" *ngIf="query.returnDate">Andata e ritorno · {{query.departDate}} → {{query.returnDate}}</span>
    <span class="badge">Passeggeri: {{query.pax}}</span>
    <span class="badge">Classe: {{query.cabin}}</span>
  </div>

  <article class="card" *ngFor="let r of results">
    <header class="head">
      <div class="carrier">{{r.carrier}}<small>{{query?.cabin}}</small></div>
      <div class="price">€ {{r.price}} <small>a persona</small></div>
    </header>

    <div class="timeline">
      <div class="time">{{r.departTime}}</div>
      <div class="line"><mat-icon>flight_takeoff</mat-icon></div>
      <div class="time">{{r.arriveTime}}</div>
    </div>

    <div class="route">
      <div>{{r.origin.city}} ({{r.origin.code}}) → {{r.destination.city}} ({{r.destination.code}})</div>
      <div class="meta">
        {{(r.durationMin/60)|number:'1.0-0'}}h {{r.durationMin%60}}m · {{ r.direct ? 'Diretto' : 'Con scali' }}
      </div>
    </div>

    <footer class="actions">
      <button mat-stroked-button>Salva</button>
      <button mat-flat-button color="primary">Seleziona</button>
    </footer>
  </article>
  `,
  styles:[`
    .filters{ display:flex; gap:8px; margin:8px 0 16px }
    .badge{ padding:6px 10px; border-radius:999px; background:#eef6ff; font-size:.85rem }
    .card{ background:white; border-radius:16px; box-shadow:0 4px 18px rgba(0,0,0,.06); padding:14px; margin-bottom:12px }
    .head{ display:flex; align-items:center; justify-content:space-between }
    .carrier small{ margin-left:6px; opacity:.7 }
    .timeline{ display:grid; grid-template-columns: 60px 1fr 60px; align-items:center; gap:8px; margin:6px 0 }
    .timeline .line{ height:4px; background:#22b8cf22; border-radius:999px; display:flex; align-items:center; justify-content:center }
    .route .meta{ color:#6b7280; font-size:.9rem; margin-top:2px }
    .actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px }
  `]
})
export class ResultsListComponent {
  @Input() results: any[] = [];
  @Input() query: FlightSearchParams | null = null;
}
