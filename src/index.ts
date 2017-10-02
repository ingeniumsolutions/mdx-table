import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Md2DataTableModule } from 'md2';
import {
  MdPaginatorModule, MdCardModule, MdInputModule,
  MdIconModule, MdCheckboxModule, MdProgressBarModule,
  MdTooltipModule, MdMenuModule, MdButtonModule
} from '@angular/material';
import { MdxTableComponent } from './mdx-table/mdx-table.component';
import { MdxNoDataComponent } from './mdx-nodata/mdx-nodata.component'

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule, ReactiveFormsModule,
    Md2DataTableModule,
    MdPaginatorModule, MdCardModule,
    MdInputModule, MdIconModule,
    MdCheckboxModule, MdProgressBarModule,
    MdTooltipModule, MdMenuModule,
    MdButtonModule
  ],
  declarations: [
    MdxTableComponent,
    MdxNoDataComponent
  ],
  exports: [MdxTableComponent]
})
export class MdxTableModule { }
