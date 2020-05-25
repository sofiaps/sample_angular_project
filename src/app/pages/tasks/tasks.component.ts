import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDate, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'ng2-validation';
import { ApiClientService } from '../../shared/services/ApiClient.service';
import { ValidateNotEmpty } from '../../shared/validators/empty.validator';
import { CurrentUserService } from '../../shared/services/currentUser.service';
import { DragulaService } from 'ng2-dragula';

const asyncLoop = require('node-async-loop');

function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return "";
  }
}

function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {

  parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split('-');
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { day: toInteger(dateParts[0]), month: null, year: null };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return { day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: null };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return { day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: toInteger(dateParts[2]) };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date ?
      `${isNumber(date.day) ? padNumber(date.day) : ''}.${isNumber(date.month) ? padNumber(date.month) : ''}.${date.year}` :
      '';
  }
}



@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  @ViewChild('editTask', { static: true }) public editTask: NgbModalRef;
  public tasksArray = [];
  public modalReference: NgbModalRef
  public tasksLoaded = false;
  public tasksForm: FormGroup;
  public taskEditForm: FormGroup;
  public statusSelected = false;
  public selectedStatus:any;
  public editDate : NgbDateStruct;
  public taskToDelete:any;
  public deleteIndex:any;
  public editIndex:any;
  public filterQuery:any = "";
  public filterLabels:any = [];
  public showSearch = false;
  public showDatePicker = false;
  public searchCodeBy: string = "name";
  public searchCodeSelected: string = "name";
  private allTasks = [];
  public filterDone = true;
  public tags = [];
  public searched_tags = [];
  public showSearchResults = false;
  BAG = "task-group";
  public dropSubscription:any;
  public toDos:any = [];
  public inProgress:any=[];
  public completes:any=[];
  public listIds:any = {};
  public filesCreateArray: FormArray;
  public labelsCreateArray: FormArray;
  public filesEditArray: FormArray;
  public labelsEditArray: FormArray;
  public filesEditDelete: FormArray;
  public totalLabels:any=[];
  public searchText:any = "";
  public showLabels=false;
  public showLabelsEdit=false;


public loading = false;
public users:any = [];
public newUser: FormGroup;
public editUser: FormGroup;
public roleSelected = false;
public selectedRole = "";
public roleSelectedEdit = false;
public selectedRoleEdit = "";
public currentUser = {};
public showRadios = false;
public showRadiosEdit = false;
public userInit:any;
public editUserIndex:any;
public deleteUserIndex:any;
public socketSubscription:any;
public showManagerPIDEdit = false;
public showManagerPID = false;
public statusFilter=true;
public activeFilter=false;
public inactiveFilter=false;

  constructor(
    private dragulaService: DragulaService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    private CurrentUserService: CurrentUserService,
    private apiClientService: ApiClientService,
    public translate: TranslateService
  ) {

    this.currentUser = this.CurrentUserService.getUser();

    this.tasksForm = this.formBuilder.group({
      name: ['', [Validators.required, ValidateNotEmpty]],
      description: [''],
      due: [null],
      list: [null, Validators.required],
      boardList:[null],
      selectedItems: [null],
      tag: [''],
      attachments:this.formBuilder.array([]),
      labels:this.formBuilder.array([]),
      showCreate : [null],
      showDue : [null]
    });

    this.filesCreateArray = this.tasksForm.get('attachments') as FormArray;
    this.labelsCreateArray = this.tasksForm.get('labels') as FormArray;

    this.taskEditForm = this.formBuilder.group({
      id : [null],
      name: ['', [Validators.required, ValidateNotEmpty]],
      description: [''],
      due: [null],
      list: [null, Validators.required],
      boardList:[null],
      selectedItems: [null],
      tag: [''],
      attachments:this.formBuilder.array([]),
      deleteFiles:this.formBuilder.array([]),
      labels:this.formBuilder.array([]),
      showCreate : [null],
      showDue : [null]
    });

    this.filesEditArray = this.taskEditForm.get('attachments') as FormArray;
    this.filesEditDelete = this.taskEditForm.get('deleteFiles') as FormArray;
    this.labelsEditArray = this.taskEditForm.get('labels') as FormArray;


    this.dropSubscription = dragulaService.dropModel(this.BAG)
      .subscribe(async ({ el, source, target, sourceIndex, targetIndex, sibling }) => {
        let cardId = el.getAttribute('task-id');
        let arrayTarget:any = [];
        let payload:any = {};
        let x:any;
        let info:any;
        let arraySource:any = [];


        payload['user_id'] = this.currentUser['id'];
        payload['type'] = "putTask";
        payload['body'] = {};
        payload['body']['cardId'] = cardId;
        payload['body']['listId'] = this.listIds[target.id];

        if(target.id == "toDo"){
          arrayTarget = this.toDos;
        }

        if(target.id == "progress"){
          arrayTarget = this.inProgress;
        }

        if(target.id == "done"){
          arrayTarget = this.completes;
        }


        if(source.id == "toDo"){
          arraySource = this.toDos;
        }

        if(source.id == "progress"){
          arraySource = this.inProgress;
        }

        if(source.id == "done"){
          arraySource = this.completes;
        }

        if(targetIndex==0){
          payload['body']['pos'] = "top";
        }else{
          if(!sibling){
            payload['body']['pos'] = "bottom";
          }else{
            let siblingId = sibling.getAttribute('task-id');

            let siblIndex = await arrayTarget.findIndex(e=>e['id'] == siblingId);

            if(siblIndex==0){
              payload['body']['pos'] = "top";
            }else if(siblIndex!==-1){
              let prevPos = arrayTarget[siblIndex-1]['pos'];
              let nextPos = arrayTarget[siblIndex]['pos'];
              payload['body']['pos'] = (prevPos + nextPos)/2;
            }else{
              payload['body']['pos'] = "bottom";
            }
          }
        }

        x = await arraySource.findIndex(e=>e['id'] == cardId);
        let attachments:any;
        let labels:any;

        if(x!==-1){
          info = await JSON.parse(arraySource[x]['info']);
          info['boardList'] = target.id;
          payload['body']['info'] = await JSON.stringify(info);
          attachments = arraySource[x]['attachments'];
          labels = arraySource[x]['labels'];
        }

        await this.apiClientService.postAPIObject('trello-lambda', payload).then(async (response) => {
            if(response && response.statusCode && response.statusCode==200 && response.body && response.body.pos){
                x = await this.allTasks.findIndex(e=>e['id'] == cardId);
                this.allTasks[x]['pos'] = payload.body.pos;
                if(target.id!==source.id){
                  let old_status = this.allTasks[x]['list'];
                  this.allTasks[x]['listId'] = payload['body']['listId'];
                  this.allTasks[x]['boardList'] = target.id;

                  this.allTasks[x]['info']=payload['body']['info'];
                  if(target.id=="done"){
                    this.allTasks[x]['list'] = 'Abgeschlossen';
                  }
                  if(target.id=="progress"){
                    this.allTasks[x]['list'] = 'In Bearbeitung';
                  }
                  if(target.id=="toDo"){
                    this.allTasks[x]['list'] = 'Offen';
                  }
                }

              await this.filterBoard(this.allTasks);
            }
         });
      });
  }

  async filterBoard(array){
    this.toDos = await (array.filter(e=>e['boardList'] == 'toDo')).sort((a,b) =>
    (a.pos > b.pos || a.pos=="bottom" || b.pos=="top") ? 1 : ((b.pos > a.pos || b.pos=="bottom" || a.pos=="top") ? -1 : 0));
    this.inProgress = await (array.filter(e=>e['boardList'] == 'progress')).sort((a,b) =>
    (a.pos > b.pos || a.pos=="bottom" || b.pos=="top") ? 1 : ((b.pos > a.pos || b.pos=="bottom" || a.pos=="top") ? -1 : 0));
    this.completes = await (array.filter(e=>e['boardList'] == 'done')).sort((a,b) =>
    (a.pos > b.pos || a.pos=="bottom" || b.pos=="top") ? 1 : ((b.pos > a.pos || b.pos=="bottom" || a.pos=="top") ? -1 : 0));
  }


  ngOnInit(){
    let payload = {};
    payload['user_id'] = this.currentUser['id'];
    payload['type'] = "getTaskList";
    this.apiClientService.postAPIObject('trello-lambda', payload).then(async (response) => {
        if(response && response.statusCode && response.statusCode==200){
          if(response.body && response.body.labels){
            this.totalLabels = response.body.labels.filter(e=>e['name']!=="" && e['name']!==undefined && e['name']!==null);
          }
          if(response.body && response.body.lists && response.body.lists.length>0){
            for(let entry of response.body.lists){
              if(entry['name'] == "To Do" && !this.listIds['toDo']){
                this.listIds['toDo'] = entry['id'];
              }
              if(entry['name'] == "Doing" && !this.listIds['progress']){
                this.listIds['progress'] = entry['id'];
              }
              if(entry['name'] == "Done" && !this.listIds['done']){
                this.listIds['done'] = entry['id'];
              }
            }
          }

          if(response.body && response.body.cards && response.body.cards.length>0){
            let tmpObj = {};
            let info = {};

            for(let card of response.body.cards){
              tmpObj = {};
              info={};
              tmpObj['attachments'] = card.attachments;
              tmpObj['labels'] = card.labels;
              tmpObj['id'] = card.id;
              tmpObj['name'] = card.name;
              tmpObj['overdue'] = false;
              if(card.due){
                tmpObj['due'] = card.due;
                let date = new Date(tmpObj['due']);
                let now = new Date();
                if(now>date){
                  tmpObj['overdue'] = true;
                }
              }
              if(card.desc != ''){
                info = JSON.parse(card.desc);
              }

              if(info['showCreate']!==undefined){
                if(info['showCreate']!==null){
                  tmpObj['showCreate'] = info['showCreate'];
                }else{
                  tmpObj['showCreate'] = true
                }
              }else{
                tmpObj['showCreate'] = true
              }

              if(info['showDue']!==undefined){
                if(info['showDue']!==null){
                  tmpObj['showDue'] = info['showDue'];
                }else{
                  tmpObj['showDue'] = true
                }
              }else{
                tmpObj['showDue'] = true
              }

              if(info['description']){
                tmpObj['description'] = info['description'];
              }else{
                tmpObj['description'] = '';
              }

              let list = await response.body.lists.find(x=>x['id'] == card.idList);
              if(list['name'] == "To Do" && (!info['boardList'] || info['boardList']=="toDo")){
                tmpObj['list'] = 'Offen';
                tmpObj['boardList'] = 'toDo';
              }
              if(list['name'] == "Doing" && (!info['boardList'] || info['boardList']=="progress")){
                tmpObj['list'] = 'In Bearbeitung';
                tmpObj['boardList'] = 'progress';
              }
              if(list['name'] == "Done" && (!info['boardList'] || info['boardList']=="done")){
                tmpObj['list'] = 'Abgeschlossen';
                tmpObj['boardList'] = 'done';
              }

              tmpObj['pos'] = card.pos;

              if(card.actions){
                let i_created = await card.actions.findIndex(e=>e.type=="createCard");
                if(i_created!==-1){
                  tmpObj['created_at'] = card.actions[i_created]['date'];
                }else{
                  tmpObj['created_at'] = '';
                }

              }else{
                tmpObj['created_at'] = '';
              }
              tmpObj['listId'] = this.listIds[tmpObj['boardList']];
              tmpObj['info'] = card.desc;
              this.tasksArray.push(tmpObj);
            }
            this.allTasks = this.tasksArray.slice(0);
            await this.filterBoard(this.allTasks);
          }else{
            this.tasksArray = [];
          }
        }
        this.tasksLoaded = true;
     });
  }


  get createAttachmentGroup() {
    return this.tasksForm.get('attachments') as FormArray;
  }

  getCreateAttachmentControl(index): FormControl {
    const formControl = this.filesCreateArray[index] as FormControl;
    return formControl;
  }

  createAttachment(entry): FormControl {
    return this.formBuilder.control(entry);
  }

  removeAttachment(index){
    this.filesCreateArray.removeAt(index);
  }


  get createLabelGroup() {
    return this.tasksForm.get('labels') as FormArray;
  }

  getCreateLabelGroup(index): FormGroup {
    const formControl = this.labelsCreateArray.controls[index] as FormGroup;
    return formControl;
  }

  createLabel(entry) {
    this.searchText = "";
    let tmp=entry;
    tmp['name'] = (entry['name'].replace(/\s\s+/g, ' ')).trim();
    this.labelsCreateArray.push(this.formBuilder.group(tmp));
  }

  removeLabel(index){
    this.labelsCreateArray.removeAt(index);
  }

  get editLabelGroup() {
    return this.taskEditForm.get('labels') as FormArray;
  }

  getEditLabelGroup(index): FormGroup {
    const formControl = this.labelsEditArray.controls[index] as FormGroup;
    return formControl;
  }

  createEditLabel(entry) {
    this.searchText = "";
    let tmp=entry;
    tmp['name'] = (entry['name'].replace(/\s\s+/g, ' ')).trim();
    this.labelsEditArray.push(this.formBuilder.group(entry));
  }

  removeLabelEdit(index){
    this.labelsEditArray.removeAt(index);
  }

  get editAttachmentGroup() {
    return this.taskEditForm.get('attachments') as FormArray;
  }

  getEditAttachmentControl(index): FormControl {
    const formGroup = this.filesEditArray[index] as FormControl;
    return formGroup;
  }

  createAttachmentEdit(entry): FormControl {
    return this.formBuilder.control(entry);
  }

  deleteAttachmentEdit(id): FormControl {
    return this.formBuilder.control(id);
  }

  removeAttachmentEdit(index, item){
    if(!item['id']){
      this.filesEditArray.removeAt(index);
    }else{
      this.filesEditDelete.push(this.deleteAttachmentEdit(item['id']));
      this.filesEditArray.removeAt(index);
    }
  }

  resetForms(){
    this.searchText = "";
    this.showLabels = false;
    this.showLabelsEdit = false;
    const control = <FormArray>this.tasksForm.controls['attachments'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
    const control2 = <FormArray>this.taskEditForm.controls['attachments'];
    for(let i = control2.length-1; i >= 0; i--) {
      control2.removeAt(i);
    }
    const control3 = <FormArray>this.taskEditForm.controls['deleteFiles'];
    for(let i = control3.length-1; i >= 0; i--) {
      control3.removeAt(i);
    }
    const control4 = <FormArray>this.tasksForm.controls['labels'];
    for(let i = control4.length-1; i >= 0; i--) {
      control4.removeAt(i)
    }
    const control5 = <FormArray>this.taskEditForm.controls['labels'];
    for(let i = control5.length-1; i >= 0; i--) {
      control5.removeAt(i)
    }

    this.tasksForm.reset();
    this.taskEditForm.reset();

    this.tasksForm.controls['showCreate'].setValue(1);
    this.tasksForm.controls['showDue'].setValue(1);
    this.statusSelected = false;
    this.editDate = undefined;
  }

  async setDeleteIndex(task){
    this.deleteIndex = await this.tasksArray.findIndex(e=>e['id'] == task.id);
  }

  async setEditForm(task){
    let att=0;
    if(task['attachments'].length>0){
      await asyncLoop(task['attachments'], async (entry, next) => {
        this.filesEditArray.push(this.createAttachmentEdit(entry));
        if(att!==task['attachments'].length-1){
          att++;
        }
        next();
      });
    }

    let lab=0;
    if(task['labels'].length>0){
      await asyncLoop(task['labels'], async (entry, next) => {
        this.createEditLabel(entry);
        if(lab!==task['labels'].length-1){
          lab++;
        }
        next();
      });
    }

    this.editIndex = await this.tasksArray.findIndex(e=>e['id'] == task.id);
    this.taskEditForm.controls['id'].setValue(task.id);
    this.taskEditForm.controls['name'].setValue(task.name);
    this.taskEditForm.controls['description'].setValue(task.description);
    this.taskEditForm.controls['showCreate'].setValue(task.showCreate!==null ? task.showCreate : true);
    this.taskEditForm.controls['showDue'].setValue(task.showDue!==null ? task.showDue : true);

    if(task.due){
      this.editDate = {"year": undefined , "month": undefined, "day":undefined};
      let year = Number(task.due.split("T")[0].split("-")[0]);
      let month = Number(task.due.split("T")[0].split("-")[1]);
      let day = Number(task.due.split("T")[0].split("-")[2]);
      this.editDate.year = year;
      this.editDate.month = month;
      this.editDate.day = day;
      this.taskEditForm.controls['due'].setValue(this.editDate);
    }

    if(task['list'] == "Offen"){
      this.taskEditForm.controls['list'].setValue('To Do');
    }
    if(task['list'] == "In Bearbeitung"){
      this.taskEditForm.controls['list'].setValue('Doing');
    }
    if(task['list'] == "Abgeschlossen"){
      this.taskEditForm.controls['list'].setValue('Done');
    }
    this.taskEditForm.controls['boardList'].setValue(task['boardList']);

    this.statusSelected = true;
    this.selectedStatus = task['list'];

  }


  async putAufgabe(value){
    if(jQuery("#headersKanban")[0]){
      jQuery("#headersKanban").hide();
    }
    this.tasksLoaded = false;
    let payload = {};
    payload['user_id'] = this.currentUser['id'];
    payload['type'] = "putTask";
    payload['body'] = {};
    payload['body']['info'] = {};
    payload['body']['info']['description'] = value.description;
    payload['body']['info']['boardList'] = value.boardList;
    payload['body']['info']['showCreate'] = value.showCreate!==null ? value.showCreate : true;
    payload['body']['info']['showDue'] = value.showDue!==null ? value.showDue : true;
    payload['body']['list'] = value.list;
    payload['body']['name'] = value.name;
    payload['body']['cardId'] = value.id;
    payload['body']['listId'] = this.listIds[value.boardList];

    if(value.due){
      let year = String(value.due.year);
      let month = (value.due.month<10) ? '0' + String(value.due.month) : String(value.due.month);
      let day = (value.due.day<10) ? '0' + String(value.due.day) : String(value.due.day);
      payload['body']['due'] = year+"-"+month+"-"+day;
    }

    let status_changed = false;
    if(value.boardList!==this.tasksArray[this.editIndex]['boardList']){
      status_changed = true;
    }

    let attArray = await value['attachments'].filter(e=>!e['id']);
    value['attachments'] = attArray;

    if(value['attachments'].length>0){
      payload['body']['files'] = value['attachments'];
    }

    if(value['deleteFiles'].length>0){
      payload['body']['deleteFiles'] = value['deleteFiles'];
    }
    if(value.labels.length>0){
      payload['body']['labels'] = value.labels;
    }

    let oldLabels = value.labels.filter(e=>e['id']!==undefined);

    this.apiClientService.postAPIObject('trello-lambda', payload).then(async (response) => {
        if(response && response.statusCode && response.statusCode==200){
          this.tasksArray[this.editIndex]['name'] = value.name;

          let newAttachments = await this.tasksArray[this.editIndex]['attachments'].filter(e=> e['id'] && !value['deleteFiles'].includes(e['id']));

          if(response.body.attachments){
            this.tasksArray[this.editIndex]['attachments'] = await newAttachments.concat(response.body.attachments);
          }else{
            this.tasksArray[this.editIndex]['attachments'] = newAttachments;
          }

          this.tasksArray[this.editIndex]['showCreate'] = value.showCreate!==null ? value.showCreate : true;
          this.tasksArray[this.editIndex]['showDue'] = value.showDue!==null ? value.showDue : true;

          this.tasksArray[this.editIndex]['labels'] = response.body.labels || [];
          let arrLabels = await this.tasksArray[this.editIndex]['labels'].filter(e=>!oldLabels.some(e2=>e2['id']==e['id']));
          this.totalLabels = this.totalLabels.concat(arrLabels);

          this.tasksArray[this.editIndex]['due'] = payload['body']['due'];

          this.tasksArray[this.editIndex]['overdue'] = false;
          if(this.tasksArray[this.editIndex]['due'] && this.tasksArray[this.editIndex]['due']!==""){
            let date = new Date(this.tasksArray[this.editIndex]['due']);
            let now = new Date();
            if(now>date){
              this.tasksArray[this.editIndex]['overdue'] = true;
            }
          }
          this.tasksArray[this.editIndex]['description'] = value.description;
          let old_status = this.tasksArray[this.editIndex].list;
          if(value['list'] == "To Do"){
            this.tasksArray[this.editIndex]['list'] = 'Offen';
          }

          if(value['list'] == "Doing"){
            this.tasksArray[this.editIndex]['list'] = 'In Bearbeitung';
          }

          if(value['list'] == "Done"){
            this.tasksArray[this.editIndex]['list'] = 'Abgeschlossen';
          }

          this.tasksArray[this.editIndex]['boardList'] = value.boardList;
          this.tasksArray[this.editIndex]['listId'] = this.listIds[value.boardList];
          this.tasksArray[this.editIndex]['info'] = JSON.stringify(payload['body']['info']);


          for(let task of this.allTasks){
            if(this.tasksArray[this.editIndex].id == task.id){
              task = this.tasksArray[this.editIndex];
            }
          }
          await this.filterBoard(this.allTasks);
        }
        this.tasksLoaded = true;
     });
  }

  deleteTask(task){
    if(jQuery("#headersKanban")[0]){
      jQuery("#headersKanban").hide();
    }
    this.tasksLoaded = false;
    let payload = {};
    payload['user_id'] = this.currentUser['id'];
    payload['type'] = "deleteTask";
    payload['body'] = {};
    payload['body']['cardId'] = task.id;
    this.apiClientService.postAPIObject('trello-lambda', payload).then((response) => {
      if(response && response.statusCode && response.statusCode==200){
        this.tasksArray.splice(this.deleteIndex, 1);
        let allIndex = 0;
        let array = this.allTasks.slice(0);
        for(let task2 of this.allTasks){
          if(task.id == task2.id){
            array.splice(allIndex, 1);
          }
          allIndex++;
        }
        this.allTasks = array;
        this.filterBoard(this.allTasks);
      }
      this.tasksLoaded = true;
    });
  }


  newAufgabe(value){
    if(jQuery("#headersKanban")[0]){
      jQuery("#headersKanban").hide();
    }
    this.tasksLoaded = false;
    let payload = {};
    payload['user_id'] = this.currentUser['id'];
    payload['type'] = "postTask";
    payload['body'] = {};
    payload['body']['info'] = {};
    payload['body']['info']['description'] = value.description || '';
    payload['body']['info']['boardList'] = value.boardList;
    payload['body']['info']['showCreate'] = value.showCreate!==null ? value.showCreate : true;
    payload['body']['info']['showDue'] = value.showDue!==null ? value.showDue : true;
    payload['body']['list'] = value.list;
    payload['body']['name'] = value.name;
    payload['body']['listId'] = this.listIds[value.boardList];

    if(value.due!=undefined){
      let year = String(value.due.year);
      let month = (value.due.month<10) ? '0' + String(value.due.month) : String(value.due.month);
      let day = (value.due.day<10) ? '0' + String(value.due.day) : String(value.due.day);
      payload['body']['due'] = year+"-"+month+"-"+day;
    }

    if(value.attachments && value.attachments.length>0){
      payload['body']['files'] = value.attachments;
    }

    if(value.labels && value.labels.length>0){
      payload['body']['labels'] = value.labels;
    }
    let oldLabels = value.labels.filter(e=>e['id']!==undefined);

    this.apiClientService.postAPIObject('trello-lambda', payload).then(async (response) => {
         if(response && response.statusCode && response.statusCode==200){
           let tmpObj = {};
           tmpObj['id'] = response.body.id;
           tmpObj['name'] = value.name;
           tmpObj['pos'] = response.body.pos;
           tmpObj['attachments'] = response.body.attachments;
           tmpObj['labels'] = response.body.labels || [];
           tmpObj['showCreate'] = value['showCreate']!==null ? value.showCreate : true;
           tmpObj['showDue'] = value['showDue']!==null ? value.showDue : true;
           tmpObj['overdue'] = false;

           let arrLabels = await tmpObj['labels'].filter(e=>!oldLabels.some(e2=>e2['id']==e['id']));
           this.totalLabels = this.totalLabels.concat(arrLabels);

           if(value.due){
             tmpObj['due'] = payload['body']['due'];
             let date = new Date(tmpObj['due']);
             let now = new Date();
             if(now>date){
               tmpObj['overdue'] = true;
             }
           }
           tmpObj['description'] = value.description;
           if(value['list'] == "To Do"){
             tmpObj['list'] = 'Offen';
           }

           if(value['list'] == "Doing"){
             tmpObj['list'] = 'In Bearbeitung';
           }

           if(value['list'] == "Done"){
             tmpObj['list'] = 'Abgeschlossen';
           }


           tmpObj['boardList'] = value['boardList'];
           tmpObj['listId'] = this.listIds[tmpObj['boardList']];
           tmpObj['created_at'] = new Date();
           tmpObj['info'] = JSON.stringify(payload['body']['info']);

           this.tasksArray.push(tmpObj);
           this.allTasks.push(tmpObj);
         }
        await this.filterBoard(this.allTasks);
        this.tasksLoaded = true;
     });
  }

  setStatus(e, form=null){
    this.statusSelected = true;
    switch(e.dataset.value){
      case 'To Do':
        this.selectedStatus = 'toDo';
        break;
      case 'Doing':
        this.selectedStatus = "inProgress";
        break;
      case 'Done':
        this.selectedStatus = "done";
        break;
      default:
        break;
    }

    if(form=="edit"){
      this.taskEditForm.controls['list'].setValue(e.dataset.value);
      this.taskEditForm.controls['boardList'].setValue(e.dataset.board);
    }else{
      this.tasksForm.controls['list'].setValue(e.dataset.value);
      this.tasksForm.controls['boardList'].setValue(e.dataset.board);
    }
  }

  open(content, size:any = "lg") {
    if (this.modalReference !== undefined) {
      this.modalReference.close();
    }

    this.modalReference = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size, backdrop: 'static' });

    this.modalReference.result.then((result) => {
    }, (reason) => {
    });
  }

  ngOnDestroy(){
    if(this.dropSubscription){
      this.dropSubscription.unsubscribe();
    }
    if(jQuery("#headersKanban")[0]){
      jQuery("#headersKanban").hide();
    }
  }


  public showStatus = false;
  public showBereichDropdown = false;
  public searchStatusSelected = "select";
  public searchBereichSelected = "select";

  showDocumentSearch() {

    this.showSearch = !this.showSearch;
    jQuery("#searchDocument").toggleClass('clicked');
    jQuery("#selectDocuArrow").toggleClass('manageText');
    jQuery("#selectDocuBySearch").toggleClass('manageText');
    if(this.showSearch){
      this.filterQuery = "";
      this.filterLabels = [];
      this.searchCodeBy = 'name';
      this.searchCodeSelected = "name";
      jQuery("#docuSearchInput").focus();
    }else{
      this.filterQuery = "";
      this.filterLabels = [];
      this.filterBoard(this.allTasks);
      jQuery("#docuSearchInput").blur();
      this.showDatePicker = false;
      this.showStatus = false;
      this.showBereichDropdown=false;
      this.searchStatusSelected = "select";
      this.searchBereichSelected = "select";

    }
  }

  checkSearchCheckedCode(e) {
    this.searchCodeBy = e.dataset.value;
    switch (this.searchCodeBy) {
      case ('name'):
        this.showDatePicker = false;
        this.showStatus = false;
        this.showBereichDropdown=false;
        this.searchCodeSelected = "name";
        this.filterQuery  ="";
        this.filterLabels = [];
        jQuery("#docuSearchInput").focus();
        break;
      case ('due'):
        this.showDatePicker = true;
        this.showStatus = false;
        this.showBereichDropdown=false;
        this.searchCodeSelected = "Fällig am";
        this.filterQuery  ="";
        this.filterLabels = [];
        jQuery("#docuSearchInput").focus();
        break;
      case ('created_at'):
        this.showDatePicker = true;
        this.showStatus = false;
        this.showBereichDropdown=false;
        this.searchCodeSelected = "Erstellt am";
        this.filterQuery  ="";
        this.filterLabels = [];
        jQuery("#docuSearchInput").focus();
        break;
      case ('list'):
        this.showDatePicker = false;
        this.showStatus = true;
        this.showBereichDropdown=false;
        this.searchCodeSelected = "status";
        this.searchStatusSelected = "select";
        this.filterQuery  ="";
        this.filterLabels = [];
        jQuery("#docuSearchInput").focus();
        break;
      case ('labels'):
        this.showDatePicker = false;
        this.showStatus = false;
        this.showBereichDropdown=true;
        this.searchCodeSelected = "Bereich";
        this.searchBereichSelected = "select";
        this.filterQuery ="";
        this.filterLabels = [];
        jQuery("#docuSearchInput").focus();
        break;
      default:
      break;
    }
  }

  checkStatusSearch(e) {
    switch (e.dataset.value) {
      case ('open'):
        this.searchStatusSelected = "toDo";
        this.filterQuery  ="Offen";
        this.filterDone = true;
        break;
      case ('editing'):
        this.searchStatusSelected = "inProgress";
        this.filterQuery  ="In Bearbeitung";
        this.filterDone = true;
        break;
      case ('closed'):
        this.searchStatusSelected = "done";
        this.filterQuery  ="Abgeschlossen";
        this.filterDone = false;
        break;
        default:
        break;
    }
  }

  async checkBereichSearch(e, name) {
    if(e && !this.filterLabels.includes(name)){
      await this.filterLabels.push(name);
    }else if(!e && this.filterLabels.includes(name)){
      let x = await this.filterLabels.findIndex(e=>e==name);
      if(x!==-1){
        let arr = await (this.filterLabels.slice(0,x)).concat(this.filterLabels.slice(x+1));
        this.filterLabels = await arr;
      }
    }

    if(this.filterLabels.length==0){
      this.filterQuery = "";
    }else{
      this.filterQuery = "";

      setTimeout(async () =>{
        this.filterQuery = await this.filterLabels;
      }, 1);
    }
  }

  async uploadTaskCreate(files: FileList){
    if(!files || files.length==0 ) {
      return;
    }

    await new Promise(async (resolve, reject) =>{
      await asyncLoop(files, async (entry, next) => {
        let file : File = await entry.value;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = ()=>{
            var base64data = reader.result;
            let form = {};
            form['type'] = file.type;
            form['name'] = file.name;
            form['file'] = base64data;
            this.filesCreateArray.push(this.createAttachment(form));
            next();
        }

      }, (error)=>{
        if(error){
          console.log(error);
        }
        resolve();
      });
    }).then(() => {
      return;
    });

    jQuery("#createAttachments").prop("value", "");
  }

  async uploadTaskEdit(files: FileList){
    if(!files || files.length==0 ) {
      return;
    }

    await new Promise(async (resolve, reject) =>{
      await asyncLoop(files, async (entry, next) => {
        let file : File = await entry.value;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = ()=>{
            var base64data = reader.result;
            let form = {};
            form['type'] = file.type;
            form['name'] = file.name;
            form['file'] = base64data;
            this.filesEditArray.push(this.createAttachmentEdit(form));
            next();
        }

      }, (error)=>{
        if(error){
          console.log(error);
        }
        resolve();
      });
    }).then(() => {
      return;
    });

    jQuery("#editAttachments").prop("value", "");
  }

  downloadAttachment(fileUrl, name){

    let payload:any = {};
    payload['link'] = fileUrl;

    this.apiClientService.postAPIObject('task-attachment',payload).then(async (response) => {
      if(response && response.statusCode && response.statusCode==200 && response.body){
        let linkSource = await response.body;
        let downloadLink = await document.createElement('a');
        downloadLink.href = await linkSource;
        downloadLink.target = await '_self';
        downloadLink.download = await name;
        await downloadLink.setAttribute("id", "MyLink");
        await document.body.appendChild(downloadLink);
        await jQuery('#MyLink').css('cursor', 'pointer');
        setTimeout(function() {
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }, 5);
      }else{
        this.toastr.error(this.translate.instant("tasks.downloadError"),  this.translate.instant("general.error"), {
          timeOut: 4000,
          extendedTimeOut: 500
        });
      }
    });
  }

  // Close Dropdown on click out of menu

    outOfLabels(e){
      if (document.getElementById('labelsGroup').contains(e.target)){
        this.showLabels = true;
      } else{
      	this.showLabels = false;
      }
    }

    outOfLabelsEdit(e){
      if (document.getElementById('labelsGroup2').contains(e.target)){
        this.showLabelsEdit = true;
      } else{
      	this.showLabelsEdit = false;
      }
    }

    // Fix Kanban Headers
    @HostListener('window:scroll')
    scrollDown() {
      if(jQuery("#taskboard")[0]){
        let headerTop = jQuery("#offenLabel").offset().top;
        if((jQuery(window).scrollTop() - headerTop + jQuery("#navbarTop").outerHeight())>=0){
            jQuery("#headersKanban").css({'top': String(jQuery("#navbarTop").outerHeight())+'px'});
            jQuery("#headersKanban").show();
        }else{
          if(jQuery("#headersKanban")[0]){
            jQuery("#headersKanban").hide();
          }
        }
      }
    }

    @HostListener('window:resize')
    resizeWin() {
      if(jQuery("#headersKanban")[0]){
        jQuery("#headersKanban").css({'top': String(jQuery("#navbarTop").outerHeight())+'px'});
      }
    }
}
