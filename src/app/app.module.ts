import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { OlComponent } from './ol/ol.component';
import { HowToComponent } from './how-to/how-to.component';

@NgModule({
  declarations: [
    AppComponent,
    OlComponent,
    HowToComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
