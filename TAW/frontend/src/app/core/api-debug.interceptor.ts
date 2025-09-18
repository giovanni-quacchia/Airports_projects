import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';

function collectParams(req: any) {
  try {
    const keys = req.params?.keys?.() ?? [];
    const obj: Record<string, string> = {};
    for (const k of keys) obj[k] = req.params.get(k);
    return obj;
  } catch { return {}; }
}

export const apiDebugInterceptor: HttpInterceptorFn = (req, next) => {
  const watched = /\/(tickets|itineraries)\b/i.test(req.url);
  const t0 = performance.now();

  if (watched) {
    // salva anche in window per il pannello
    (window as any).__HTTP_LOGS__ = (window as any).__HTTP_LOGS__ ?? [];
    (window as any).__HTTP_LOGS__.push({
      dir: 'REQ',
      time: new Date().toISOString(),
      method: req.method,
      url: req.urlWithParams || req.url,
      params: collectParams(req),
      body: req.body ?? null,
    });

    // console collapsible
    // eslint-disable-next-line no-console
    console.groupCollapsed(`[HTTP] → ${req.method} ${req.url}`);
    // eslint-disable-next-line no-console
    console.log('params:', collectParams(req));
    // eslint-disable-next-line no-console
    if (req.body) console.log('body:', req.body);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (watched && event instanceof HttpResponse) {
          (window as any).__HTTP_LOGS__.push({
            dir: 'RES',
            time: new Date().toISOString(),
            method: req.method,
            url: req.urlWithParams || req.url,
            status: event.status,
            durationMs: Math.round(performance.now() - t0),
            bodySample: (() => {
              try {
                const b = event.body;
                if (Array.isArray(b)) return { type: 'array', length: b.length, sample: b.slice(0, 2) };
                if (b && typeof b === 'object') return { type: 'object', keys: Object.keys(b).slice(0, 10) };
                return typeof b;
              } catch { return 'n/a'; }
            })(),
          });
          // eslint-disable-next-line no-console
          console.log('status:', event.status, 'in', Math.round(performance.now() - t0), 'ms');
        }
      },
      error: (err) => {
        if (watched) {
          (window as any).__HTTP_LOGS__.push({
            dir: 'ERR',
            time: new Date().toISOString(),
            method: req.method,
            url: req.urlWithParams || req.url,
            durationMs: Math.round(performance.now() - t0),
            error: err?.message || err?.status || 'error',
          });
          // eslint-disable-next-line no-console
          console.error(`[HTTP] ✖ ${req.method} ${req.url}`, err);
        }
      }
    }),
    finalize(() => {
      if (watched) {
        // eslint-disable-next-line no-console
        console.groupEnd?.();
      }
    })
  );
};
