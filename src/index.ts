import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Md2DataTableModule } from "md2";
import { MdxTableComponent } from "./mdx-table/mdx-table.component";
import { MdxNoDataComponent } from "./mdx-nodata/mdx-nodata.component";

import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import {
    MatNativeDateModule, MatLineModule, MatOptionModule,
    MatPseudoCheckboxModule, MatRippleModule,
} from "@angular/material/core";

export const MaterialModules = [
    MatInputModule, MatPaginatorModule, MatTooltipModule,
    MatMenuModule, MatIconModule,
    MatButtonModule, MatCardModule, MatCheckboxModule,
    MatNativeDateModule, MatLineModule, MatOptionModule, MatPseudoCheckboxModule, MatRippleModule,
    MatFormFieldModule, MatProgressBarModule,
];

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule, ReactiveFormsModule,
    Md2DataTableModule,
    ...MaterialModules,
  ],
  declarations: [
    MdxTableComponent,
    MdxNoDataComponent
  ],
  exports: [MdxTableComponent]
})
export class MdxTableModule { }
