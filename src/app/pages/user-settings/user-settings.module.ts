import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserSettingsRoutingModule } from "./user-settings-routing.module";
import { NgbModule, NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UserSettingsComponent } from "./user-settings.component";

import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UserSettingsRoutingModule,
        DataTableModule,
        TranslateModule,
        NgbModule.forRoot(),
        ModalModule.forRoot()
    ],
    declarations: [
        UserSettingsComponent
    ]
})
export class UserSettingsModule { }
