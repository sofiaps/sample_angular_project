import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FilesRoutingModule } from "./files-routing.module";
import { FilesComponent } from "./files.component";
import { TranslateModule } from "@ngx-translate/core";
import { NgxFileDropModule } from 'ngx-file-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from "../../shared/shared.module";
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
        ModalModule.forRoot(),
        CommonModule,
        TranslateModule,
        FilesRoutingModule,
        PerfectScrollbarModule,
        NgxFileDropModule,
        FormsModule,
        ReactiveFormsModule,
        DataTableModule,
        AutosizeModule,
        SharedModule,
        NgxExtendedPdfViewerModule
    ],
    declarations: [
        FilesComponent
    ],
    providers: [
      DatePipe
    ]
})
export class FilesModule { }
