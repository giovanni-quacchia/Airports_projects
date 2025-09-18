import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SegmentKey = 'main'|'stop1'|'stop2';

@Component({
  standalone: true,
  selector: 'taw-debug-panel',
  imports: [CommonModule],
  styles: [`
    .dbg {
      position: fixed; bottom: 12px; right: 12px; width: min(560px, 95vw);
      background: #0b1020; color: #e2e8f0; border: 1px solid #334155;
      border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.4); z-index: 9999;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .dbg header { display:flex; align-items:center; justify-content:space-between;
      padding: 8px 10px; border-bottom: 1px solid #334155; background:#0f172a; }
    .dbg header strong { font-size: 12px; letter-spacing: .08em; }
    .dbg header .btns { display:flex; gap:6px; }
    .dbg header button { background:#1e293b; color:#e2e8f0; border:1px solid #475569; border-radius:6px; padding:4px 8px; cursor:pointer; }
    .dbg main { max-height: 55vh; overflow:auto; padding: 10px; display:grid; gap:10px; }
    .card { border:1px solid #334155; border-radius:8px; padding:8px; background:#111827; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
    pre { margin:0; white-space:pre-wrap; word-break:break-word; font-size:12px; }
    .warn { color:#f59e0b }
    .ok { color:#10b981 }
    .bad { color:#f87171 }
    .pill { display:inline-block; padding:1px 6px; border-radius:999px; background:#0ea5e9; color:#012; font-weight:700; font-size:11px; }
  `],
  template: `
    <div class="dbg" *ngIf="enabled">
      <header>
        <strong>TAW DEBUG</strong>
        <div class="btns">
          <button (click)="reload()">↻</button>
          <button (click)="toggle()">✕</button>
        </div>
      </header>
      <main>
        <div class="card">
          <div class="grid">
            <div><b>From</b>: {{ flight?.route?.from?.code || '—' }}</div>
            <div><b>To</b>: {{ flight?.route?.to?.code || '—' }}</div>
            <div><b>Dep</b>: {{ flight?.departure || first?.departure || '—' }}</div>
            <div><b>Arr</b>: {{ flight?.finalArrival || flight?.arrival || last?.arrival || '—' }}</div>
            <div><b>Duration</b>: {{ totalDuration }}</div>
            <div><b>Segments</b>: <span class="pill">{{ segs.length }}</span></div>
          </div>
          <div>
            <span>Tickets: </span>
            <span>main=<b>{{ count('main') }}</b></span>,
            <span>stop1=<b>{{ count('stop1') }}</b></span>,
            <span>stop2=<b>{{ count('stop2') }}</b></span>
          </div>
          <div class="warn" *ngIf="warnings().length">
            ⚠ {{ warnings().join(' · ') }}
          </div>
        </div>

        <div class="card">
          <b>Flight (normalized)</b>
          <pre>{{ flight | json }}</pre>
        </div>

        <div class="card">
          <b>Segments</b>
          <pre>{{ segs | json }}</pre>
        </div>

        <div class="card">
          <b>HTTP Logs (last 20)</b>
          <pre>{{ httpLogs | json }}</pre>
        </div>
      </main>
    </div>
  `
})
export class DebugPanelComponent {
  @Input() flight: any;

  get enabled(): boolean {
    // toggle: ?debug=1 oppure localStorage.taw_debug='1'
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('debug') === '1') return true;
    } catch {}
    try { return localStorage.getItem('taw_debug') === '1'; } catch {}
    return false;
  }

  get segs(): any[] {
    const f = this.flight || {};
    const a = [f].filter(Boolean);
    if (f?.stop1) a.push(f.stop1);
    if (f?.stop2) a.push(f.stop2);
    return a;
  }
  get first() { return this.segs[0]; }
  get last()  { return this.segs[this.segs.length - 1]; }

  count(k: SegmentKey): number {
    const src = this.flight?.matchedTicketsBySegment ?? this.flight?.ticketsBySegment ?? {};
    return Array.isArray(src?.[k]) ? src[k].length : 0;
  }

  get totalDuration(): number {
    const f = this.flight;
    if (typeof f?.totDuration === 'number') return f.totDuration;
    const sum = this.segs.reduce((acc, s) => acc + (typeof s?.duration === 'number' ? s.duration : 0), 0);
    if (sum > 0) return sum;
    const d = this.first?.departure ? +new Date(this.first.departure) : NaN;
    const a = (f?.finalArrival ?? f?.arrival ?? this.last?.arrival) ? +new Date(f?.finalArrival ?? f?.arrival ?? this.last?.arrival) : NaN;
    return (!isNaN(d) && !isNaN(a) && a > d) ? Math.round((a - d) / 60000) : 0;
  }

  get httpLogs() {
    const logs = (window as any).__HTTP_LOGS__ ?? [];
    return logs.slice(-20);
  }

  warnings(): string[] {
    const w: string[] = [];
    if (!this.flight?.route?.from?.code) w.push('missing route.from');
    if (!this.flight?.route?.to?.code) w.push('missing route.to');
    if (!this.first?.departure) w.push('missing departure (first seg)');
    if (!(this.flight?.finalArrival || this.flight?.arrival || this.last?.arrival)) w.push('missing arrival (last seg)');
    if (this.count('main') === 0) w.push('no tickets for main');
    if (this.flight?.stop1 && this.count('stop1') === 0) w.push('no tickets for stop1');
    if (this.flight?.stop2 && this.count('stop2') === 0) w.push('no tickets for stop2');
    // controllo param ID nei logs dei tickets
    const hasTicketWithoutId = ((window as any).__HTTP_LOGS__ ?? []).some((l: any) =>
      l.dir === 'REQ' && /\/tickets\b/i.test(l.url) &&
      !Object.keys(l.params || {}).some(k => ['flightId','_id','flight'].includes(k))
    );
    if (hasTicketWithoutId) w.push('tickets called without flightId/_id param');
    return w;
  }

  toggle() {
    try {
      const now = localStorage.getItem('taw_debug') === '1';
      localStorage.setItem('taw_debug', now ? '0' : '1');
      location.reload();
    } catch {}
  }
  reload() { location.reload(); }
}
