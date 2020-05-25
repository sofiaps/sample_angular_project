import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TasksRoutingModule } from "./tasks-routing.module";
import { NgbModule, NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TasksComponent } from "./tasks.component";

import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from "@ngx-translate/core";

import { DragulaModule } from 'ng2-dragula';
import { SharedModule } from "../../shared/shared.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TasksRoutingModule,
        DataTableModule,
        TranslateModule,
        NgbModule.forRoot(),
        ModalModule.forRoot(),
        SharedModule,
        DragulaModule
    ],
    declarations: [
        TasksComponent
    ]
})
export class TasksModule { }
