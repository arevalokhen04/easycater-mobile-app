import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import './app/core/icons';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
