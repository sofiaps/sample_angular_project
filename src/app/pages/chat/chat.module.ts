import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ChatRoutingModule } from "./chat-routing.module";
import { ChatComponent } from "./chat.component";
import { TranslateModule } from "@ngx-translate/core";
import { NgxFileDropModule } from 'ngx-file-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from "../../shared/shared.module";

@NgModule({
    imports: [
        ModalModule.forRoot(),
        CommonModule,
        TranslateModule,
        ChatRoutingModule,
        PerfectScrollbarModule,
        NgxFileDropModule,
        FormsModule,
        ReactiveFormsModule,
        DataTableModule,
        AutosizeModule,
        SharedModule
    ],
    declarations: [
        ChatComponent
    ]
})
export class ChatModule { }
