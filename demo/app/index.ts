import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MdxTableModule } from '../../dist';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MdxTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
