#!/usr/bin/env bash
set -euo pipefail

# 0) assicurati dipendenza
npm i zone.js

# 1) main.ts — importa zone.js PRIMA di tutto e bootstrap semplice
cat > src/main.ts <<'TS'
import 'zone.js'; // deve essere la prima import

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
TS

# 2) main.server.ts — prepend "zone.js/node" se non c'è già
if [ -f src/main.server.ts ]; then
  if ! grep -q "zone.js/node" src/main.server.ts; then
    # macOS vs linux sed
    if sed --version >/dev/null 2>&1; then
      sed -i '1s;^;import '"'"'zone.js/node'"'"';\n;' src/main.server.ts
    else
      sed -i '' '1s;^;import '"'"'zone.js/node'"'"';\n;' src/main.server.ts
    fi
  fi
else
cat > src/main.server.ts <<'TS'
import 'zone.js/node';
import { renderApplication } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export default function render() {
  return renderApplication(AppComponent, {
    appId: 'server-app',
    ...appConfig
  });
}
TS
fi

# 3) server.ts — prepend "zone.js/node" senza toccare il resto
if [ -f src/server.ts ]; then
  if ! grep -q "zone.js/node" src/server.ts; then
    if sed --version >/dev/null 2>&1; then
      sed -i '1s;^;import '"'"'zone.js/node'"'"';\n;' src/server.ts
    else
      sed -i '' '1s;^;import '"'"'zone.js/node'"'"';\n;' src/server.ts
    fi
  fi
fi

echo "✅ Zone.js inserito in client + SSR (main.ts, main.server.ts, server.ts)."
