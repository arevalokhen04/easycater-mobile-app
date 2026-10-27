import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';
import { provideIonicAngular } from '@ionic/angular/provide';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

// AdminShellPage is declared by its own lazily-loaded module
// (AdminShellPageModule), so it must not be declared here.
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule, AppRoutingModule],
  providers: [
    provideIonicAngular({ mode: 'md' }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useValue: tokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
