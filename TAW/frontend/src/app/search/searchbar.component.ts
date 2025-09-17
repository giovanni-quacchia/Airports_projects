// IMPORTS
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';

import { FlightSearchService } from './flight-search.service';
import { AirportDTO } from '../core/flight.models';

export const IT_DDMMYYYY: MatDateFormats = {
  parse:   { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export type Cabin = 'economy' | 'premium' | 'business' | 'first';
export interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;   // richiesto
  pax: number;
  cabin: Cabin;
}

@Component({
  selector: 'taw-searchbar',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatSelectModule,
    MatAutocompleteModule, MatOptionModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DDMMYYYY },
  ],
  template: `
<div class="search-wrapper">
  <form class="search-card" #f="ngForm" (ngSubmit)="emitSearch()">

    <!-- ROW 1: From | swap | To -->
    <div class="row">
      <mat-form-field appearance="outline" class="field">
        <mat-label>From</mat-label>
        <input
          matInput
          [(ngModel)]="model.from"
          name="from"
          required
          [matAutocomplete]="fromAuto"
          (ngModelChange)="filterFrom($event)"
          placeholder="Es. Venice Marco Polo Airport (VCE)">
        <div class="hint" *ngIf="fromHint">{{ fromHint }}</div>
      </mat-form-field>

      <div class="swap-col">
        <button mat-mini-fab type="button" aria-label="Inverti" (click)="swap()">
          <mat-icon>swap_horiz</mat-icon>
        </button>
      </div>

      <mat-form-field appearance="outline" class="field">
        <mat-label>To</mat-label>
        <input
          matInput
          [(ngModel)]="model.to"
          name="to"
          required
          [matAutocomplete]="toAuto"
          (ngModelChange)="filterTo($event)"
          placeholder="Es. DXB">
        <div class="hint" *ngIf="toHint">{{ toHint }}</div>
      </mat-form-field>
    </div>

    <!-- Autocomplete panels -->
    <mat-autocomplete #fromAuto="matAutocomplete" (optionSelected)="selectFrom($event.option.value)">
      <mat-option *ngFor="let a of fromFiltered" [value]="formatAirport(a)">
        {{ a.name || a.city }} ({{ a.code }})
      </mat-option>
    </mat-autocomplete>

    <mat-autocomplete #toAuto="matAutocomplete" (optionSelected)="selectTo($event.option.value)">
      <mat-option *ngFor="let a of toFiltered" [value]="formatAirport(a)">
        {{ a.name || a.city }} ({{ a.code }})
      </mat-option>
    </mat-autocomplete>

    <!-- ROW 2: date -->
    <div class="row">
      <mat-form-field appearance="outline" class="field">
        <mat-label>Partenza</mat-label>
        <input matInput
               [matDatepicker]="dpFrom"
               [ngModel]="departDateObj"
               (ngModelChange)="onDateChange('depart', $event)"
               name="departDate"
               placeholder="gg/mm/aaaa"
               required>
        <mat-datepicker-toggle matSuffix [for]="dpFrom"></mat-datepicker-toggle>
        <mat-datepicker #dpFrom></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="field">
        <mat-label>Arrivo</mat-label>
        <input matInput
               [matDatepicker]="dpTo"
               [ngModel]="returnDateObj"
               (ngModelChange)="onDateChange('return', $event)"
               name="returnDate"
               placeholder="gg/mm/aaaa"
               required>
        <mat-datepicker-toggle matSuffix [for]="dpTo"></mat-datepicker-toggle>
        <mat-datepicker #dpTo></mat-datepicker>
      </mat-form-field>
    </div>

    <!-- ROW 3: Passeggeri + Classe -->
    <div class="row">
      <mat-form-field appearance="outline" class="field small">
        <mat-label>Passeggeri</mat-label>
        <input matInput type="number" min="1" required [(ngModel)]="model.pax" name="pax">
      </mat-form-field>

      <mat-form-field appearance="outline" class="field">
        <mat-label>Classe</mat-label>
        <mat-select [(ngModel)]="model.cabin" name="cabin" required>
          <mat-option value="economy">Economy</mat-option>
          <mat-option value="premium">Premium Economy</mat-option>
          <mat-option value="business">Business</mat-option>
          <mat-option value="first">First</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <!-- ROW 4: CTA -->
    <div class="row cta-row">
      <button class="cta primary" mat-flat-button color="primary" type="submit" [disabled]="!formComplete(f)">
        Cerca voli
      </button>
    </div>

  </form>
</div>
  `,
  styles: [`
.search-wrapper{ display:flex; justify-content:center; padding:40px 20px; }
.search-card{
  background:#fff; border-radius:20px;
  box-shadow:0 8px 24px rgba(0,0,0,.08);
  padding:24px; max-width:900px; width:100%;
  display:flex; flex-direction:column; gap:20px;
}
.row{ display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
.field{ flex:1; min-width:220px; }
.field.small{ max-width:170px; }
.swap-col{ display:flex; align-items:center; justify-content:center; }
.swap-col button{ box-shadow:0 6px 14px rgba(0,0,0,.12); }

/* Hints con nome completo + codice */
.hint{ margin-top:6px; font-size:.85rem; color:#6b7280; }

/* CTA come pill blu */
.cta-row{ justify-content:center; }
.cta.primary{ border-radius:999px; font-size:1.05rem; padding:14px 40px; }

/* rifiniture Material */
:host ::ng-deep .mat-mdc-form-field-infix{ padding:14px 16px !important; }
:host ::ng-deep .mat-mdc-text-field-wrapper{ border-radius:14px !important; }
:host ::ng-deep .mat-mdc-select-trigger{ display:flex; align-items:center; min-height:24px; }

/* overlay sopra a tutto */
:host ::ng-deep .cdk-overlay-container, :host ::ng-deep .cdk-overlay-pane{ z-index:10000 !important; }

/* pannelli chiari e leggibili */
:host ::ng-deep .mat-mdc-autocomplete-panel,
:host ::ng-deep .mat-mdc-select-panel {
  background:#fff !important; color:#0f172a !important;
  box-shadow:0 10px 30px rgba(0,0,0,.12) !important; border-radius:12px !important;
}
:host ::ng-deep .mat-datepicker-content {
  background:#fff !important; color:#0f172a !important;
  border-radius:12px !important; box-shadow:0 10px 30px rgba(0,0,0,.12) !important;
}
:host ::ng-deep .mat-calendar-body-today .mat-calendar-body-cell-content {
  border:2px solid #0b7285 !important; border-radius:50%;
}
:host ::ng-deep .mat-calendar-body-selected {
  background:#0b7285 !important; color:#fff !important; border-radius:50% !important;
}
  `]
})
export class SearchbarComponent {
  @Input() initial?: Partial<FlightSearchParams>;
  @Output() search = new EventEmitter<FlightSearchParams>();

  constructor(private api: FlightSearchService) {}

  model: FlightSearchParams = {
    from: this.initial?.from ?? '',
    to: this.initial?.to ?? '',
    departDate: this.initial?.departDate ?? '',
    returnDate: this.initial?.returnDate ?? '',
    pax: this.initial?.pax ?? 1,
    cabin: (this.initial?.cabin ?? 'economy') as any
  };

  departDateObj: Date | null = null;
  returnDateObj: Date | null = null;

  fromFiltered: AirportDTO[] = [];
  toFiltered: AirportDTO[] = [];

  fromHint = '';
  toHint = '';

  ngOnInit() {
    if (this.model.departDate) this.departDateObj = new Date(this.model.departDate);
    if (this.model.returnDate) this.returnDateObj = new Date(this.model.returnDate);
    // inizializza hint se i campi partono con codice
    if (this.model.from) this.filterFrom(this.model.from);
    if (this.model.to) this.filterTo(this.model.to);
  }

  /* --- Autocomplete + Hint (solo visivo) --- */
  filterFrom(term: string) {
    const q = (term || '').trim();
    this.api.airports(q).subscribe(list => {
      this.fromFiltered = list;
      this.fromHint = this.bestLabel(q, list);
    });
  }
  filterTo(term: string) {
    const q = (term || '').trim();
    this.api.airports(q).subscribe(list => {
      this.toFiltered = list;
      this.toHint = this.bestLabel(q, list);
    });
  }

  formatAirport(a: AirportDTO) { return `${a.code}`; } // input mostra solo il codice
  selectFrom(val: string) { this.model.from = val; this.filterFrom(val); }
  selectTo(val: string)   { this.model.to   = val; this.filterTo(val); }

  private bestLabel(input: string, list: AirportDTO[]): string {
    if (!list?.length) return '';
    const code = (input || '').toUpperCase();
    const exact = list.find(a => a.code?.toUpperCase() === code);
    const pick = exact || list[0];
    const name = pick.name || pick.city || '';
    const citta = pick.city || '';
    return name ? `${citta} - ${name} (${pick.code})` : (pick.code || '');
  }

  /* --- Date --- */
  onDateChange(which: 'depart' | 'return', value: Date | null){
    if (which === 'depart') {
      this.departDateObj = value;
      this.model.departDate = value ? toISODate(value) : '';
    } else {
      this.returnDateObj = value;
      this.model.returnDate = value ? toISODate(value) : '';
    }
  }

  swap(){
    const f = this.model.from; this.model.from = this.model.to; this.model.to = f;
    this.filterFrom(this.model.from); this.filterTo(this.model.to);
  }

  formComplete(f: any){ return f?.valid && !!this.model.returnDate && Number(this.model.pax) >= 1; }

  emitSearch(){ this.search.emit({ ...this.model }); }
}

/* util */
function toISODate(d: Date){
  const pad = (n: number) => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
