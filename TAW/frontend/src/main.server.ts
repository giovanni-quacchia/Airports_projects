import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';

import { AppComponent } from './app/app';
import { appConfig as baseConfig } from './app/app.config';

export default function bootstrap() {
  const appConfig = {
    ...baseConfig,
    providers: [...(baseConfig.providers ?? []), provideServerRendering()],
  };
  return bootstrapApplication(AppComponent, appConfig);
}
