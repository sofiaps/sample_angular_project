import { Component, ViewChild, ElementRef, OnInit, Injectable } from '@angular/core';
import { ApiClientService } from '../../shared/services/ApiClient.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ValidateNotEmpty } from '../../shared/validators/empty.validator';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrentUserService } from '../../shared/services/currentUser.service';
import { ContactsService } from '../../shared/services/contacts.service';
const asyncLoop = require('node-async-loop');
const uuid = require('uuid');
import { WebsocketHandlerService } from '../../shared/services/websocket-handler.service';
import { NgbDate, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { TreeModel } from 'ng2-tree';
import { DatePipe } from '@angular/common';

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

var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "eu-central-1:0cb66024-2e03-41ae-8f3d-a7b9d11e3966",
});

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }]
})
export class FilesComponent implements OnInit {
    private s3Bucket = new AWS.S3({
      apiVersion: '2006-03-01',
      params: { Bucket: 'sample-app-files-bucket' }
    });

    @ViewChild('upload', { static: true }) public upload: NgbModalRef;
    @ViewChild('override', { static: true }) public override: NgbModalRef;
    @ViewChild('mobilePDFPreview', { static: true }) public mobilePDFPreview: NgbModalRef;
    @ViewChild('chooseContacts', { static: true }) public chooseContacts: NgbModalRef;
    @ViewChild('dropBoxAccountsModal', { static: true }) public dropBoxAccountsModal: NgbModalRef;
    @ViewChild('driveAccountsModal', { static: true }) public driveAccountsModal: NgbModalRef;
    @ViewChild('folderCentralDownload', { static: true }) public folderCentralDownload: NgbModalRef;
    @ViewChild('create', { static: true }) public createModal: NgbModalRef;
    @ViewChild('deleteCentralDownload', { static: true }) public removeCentralModal: NgbModalRef;
    nameCreatorAcoount: string;
    public modalReference: NgbModalRef;

    public selectedPDFFile: any;
    public selectedPDFFileContent: any;

    public selectedTeamId: any;

    public selectedTeamName: any;
    public webSocketURL: any;
    public s3Url: any;

    public filterQuery = "";
    public filterQuery2 = "";
    public filterQuery3 = "";

    public subscriptionTeam: any;
    public adminSubscription:any;
    public subscriptionDocumentUpload: any;
    public objectTokenUrl = "";
    public tokenDate = "";
    public userRole="";
    public zipLoaded = false;
    public queryDict={};
    public showSearch = false;
    public showSearchResult = false;

    public editGroupContactsArray = [];
    public searchField:any;
    public searchResult = [];
    public teamMembers = [];
    public filterDone = true;
    public showDocuWare = false;
    public loading = false;
    public unviewedDocsSubscription:any;
    public unviewedObject:any;

    public choosenFiles = [];

    //mobile
    public mobile = false;
    public actualFile:any = '';
    public show_account_details = false;
    public choosen_account;

    public showCentralSwitch:any = false;
    public centralSwitchValue:any = false;
    public centralDownloadFolder = [];
    public folder_add = "";
    public myUserId:any;
    public crm_role = "";


    private files = {};
    private files2 = {};
    private treefile = {};
    private bucketData=[];
    private contentData = [];

    public filesArray = [];
    public filesTableArray = [];
    public loaded = false;
    public folderStrings = [];
    public searchCodeBy: string = "name";
    public searchCodeSelected: string = "Name";
    public actualFolder = {id:null, name:"Home"};
    public movedFile:any;

    public fileToBeDeleted: any;

    public breadcrumb = [];
    public changeFile: any;

    public model1: any;
    public model2: any;

    public documentName: string = '';
    public documentToUpload: any;
    public documentToEdit: any;
    public documentToEditName: any;
    public documentToEditExtension: any;
    public folderToEdit: any;
    public folderToEditName: any;

    public searchResultThread = [];
    public showDropZone = false;
    public filesDrop: NgxFileDropEntry[] = [];

    public uploadFilesForm: FormGroup;
    public filesUploadArray: FormArray;
    public existingFilesForm: FormGroup;
    public existingFilesArray: FormArray;

    public documentsUpload = [];

    public logArray = [];
    public allFiles = [];


    documents = new Array();
    initDocuments = new Array();
    showPDFPreview = false;
    public folders = {
        root: {
          children: [
            {
              name: '',
              type: 'dir',
              children:[]
            }
          ]
        }
      };
    constructor(
      private elRef: ElementRef,
        private toastr: ToastrService,
        private modalService: NgbModal,
        private ApiClientService: ApiClientService,
        private formBuilder: FormBuilder,
        private CurrentUserService: CurrentUserService,
        public contactsService: ContactsService,
        private translate:TranslateService,
        private websocketHandlerService: WebsocketHandlerService,
        private datePipe: DatePipe
      ) {

      }

    ngOnInit() {

      this.breadcrumb = [];
      this.bucketData = [];
      this.contentData = [];
      this.actualFolder = {
        id:null,
        name:"Home"
      };
      this.files = {};
      this.files2 = {};
      this.filesArray = [];
      this.documents = [];
      this.loading = true;
      this.breadcrumb.push(this.actualFolder);
      this.getList();

      this.uploadFilesForm = this.formBuilder.group({
        files: this.formBuilder.array([])
      });

      this.filesUploadArray = this.uploadFilesForm.get('files') as FormArray;

      this.existingFilesForm = this.formBuilder.group({
        files: this.formBuilder.array([])
      });

      this.existingFilesArray = this.existingFilesForm.get('files') as FormArray;

    }


    private async getList() {
      let param = {
        userId : this.CurrentUserService.currentUser['id']
      }
      this.ApiClientService.getAPIObject('documents', param).then(async (response) => {
        if(!response.errorMessage && response.state=='OK'){
          this.initDocuments = response.body;
          let parent_folder = this.breadcrumb[this.breadcrumb.length-1]['id'];
          this.documents = this.initDocuments.filter(e=>e['parent_id']==parent_folder);
        }else{
          this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));

        }
      });
    }

    ngOnDestroy(){
    }


    async dropped(files: NgxFileDropEntry[]) {
      this.filesDrop = files;
      let openModal = true;
      await asyncLoop(files, async (droppedFile, next) => {
        if (droppedFile.fileEntry.isFile && droppedFile.relativePath.split("/").length == 1) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          await fileEntry.file((file: File) => {
            let blob = file.slice(0, file.size, file.type);
            let newFile = new File([blob], this.replaceUnicode(file.name), {type: file.type});

            this.documentName = '';

            this.documentName = newFile.name;
            this.documentToUpload = newFile;

            this.documentsUpload.push(newFile);
            this.createNewItem(newFile);
          });
          next();
        }
        else {
          openModal = false;
          next();
        }
      }, async (err)=>{
        if(err){
          console.log(err);
        }
        if (openModal) {
          if (this.toastr) {
            this.toastr.clear();
          }
          this.open(this.upload);
        } else {
          this.toastr.warning('Ordner können nicht hochgeladen werden', 'Warnung!', {
            timeOut: 5000,
            extendedTimeOut: 500
          });
        }
      });

    }


    private unicode = {
      "00c4": {"replace": "Ä", "letter": "A"},
      "00d6": {"replace": "Ö", "letter": "O"},
      "00dc": {"replace": "Ü", "letter": "U"},
      "00e4": {"replace": "ä", "letter": "a"},
      "00f6": {"replace": "ö", "letter": "o"},
      "0308": {"replace": "ü", "letter": "u"},
    }

    private replaceUnicode(name){
      for(let uni in this.unicode){
        let re = new RegExp(this.unicode[uni]['letter']+'\\u0308');
        name = name.replace(re, this.unicode[uni]['replace']);
      }
      return name;
    }


    createItem(file): FormGroup {
      let type, size, name;
      if (file.type !== "") {
        type = file.type;
      } else {
        type = file.name.substr(file.name.lastIndexOf('.') + 1);
      }

      size = file.size;
      name = file.name;

      let tmpFileName = file.name.split(".");
      let nameToEdit = '';
      let extension = '';

      for(let i=0; i<tmpFileName.length-1;i++){
        if(i>0){
          nameToEdit += ".";
        }
        nameToEdit += tmpFileName[i];
      }

      extension= "." + tmpFileName.pop();


      return this.formBuilder.group({
        file: [file],
        type: [type, Validators.required],
        size: [size, Validators.required],
        name: [name, Validators.required],
        nameToEdit: [nameToEdit, Validators.required],
        extension: [extension, Validators.required],
      });
    }

    get itemsFormGroup() {
      return this.uploadFilesForm.get('files') as FormArray;
    }

    getItemsFormGroup(index): FormGroup {
      const formGroup = this.filesUploadArray.controls[index] as FormGroup;
      return formGroup;
    }

    createNewItem(file) {
      this.filesUploadArray.push(this.createItem(file));
    }

    removeItem(index) {
      if (this.filesUploadArray.length > 1) {
        this.filesUploadArray.removeAt(index);
      }
    }

    createExistingFile(position, name, uuid): FormGroup {
      return this.formBuilder.group({
        position: [position],
        name: [name],
        confirm: [true, Validators.required],
        uuid: [uuid]
      });
    }

    confirmAll() {

      for (let entry in this.existingFilesForm.value.files) {
        const faControl = (<FormArray>this.existingFilesForm.controls['files']).at(Number(entry));
        faControl['controls'].confirm.setValue(true);

      }

    }


    get filesFormGroup() {
      return this.existingFilesForm.get('files') as FormArray;
    }

    getFilesFormGroup(index): FormGroup {
      const formGroup = this.existingFilesArray.controls[index] as FormGroup;
      return formGroup;
    }

    createNewExistingFile(position, name, uuid) {
      this.existingFilesArray.push(this.createExistingFile(position, name, uuid));
    }

    async checkExistingFiles(value) {
      for (let index = this.existingFilesArray.length - 1; index > -1; index--) {
        this.existingFilesArray.removeAt(index);
      }

      let parent_folder = this.breadcrumb[this.breadcrumb.length-1]['id'];

      let i=0;
      await asyncLoop(value, async (entry, next) => {
        let x = this.initDocuments.findIndex(e=>e['parent_id']==parent_folder && e['name']==entry['nameToEdit']+entry['extension'] && e['type']!=='dir')
        if(x>-1){
          this.createNewExistingFile(i, entry['nameToEdit']+entry['extension'], this.initDocuments[x]['content']);
        }
        i++;
        next();
      }, async (err)=>{
        if(err){
          console.log(err);
        }
        if (this.existingFilesArray.value.length > 0) {
          this.open(this.override);
        } else {
          this.postFiles(value);
        }
      });



    }

    resetFiles() {
      this.documentsUpload = [];
      for (let index = this.filesUploadArray.length - 1; index > -1; index--) {
        this.filesUploadArray.removeAt(index);
      }

      for (let index = this.existingFilesArray.length - 1; index > -1; index--) {
        this.existingFilesArray.removeAt(index);
      }
    }

    open(content, size:any = "lg") {
      if (this.modalReference !== undefined) {
        this.modalReference.close();
      }

      this.modalReference = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size, backdrop: 'static' });

      this.modalReference.result.then((result) => {
      }, (reason) => {
        if (reason == 0 && (content['_def']['references']['upload'] || content['_def']['references']['override'])) {
          this.resetFiles();
        }

      });
    }


    public changeTable(crumb, index) {


      if (index == 0) {
        this.actualFolder = {
          id:null,
          name:'Home'
        };

        this.breadcrumb = [];
        this.breadcrumb.push(this.actualFolder);
      } else {

          this.actualFolder = {
            id:crumb.id,
            name:crumb.name
          };

        let copyBreadcrumb = JSON.parse(JSON.stringify(this.breadcrumb));
        this.breadcrumb = [];
        for (let entry in copyBreadcrumb) {
          if(Number(entry) == 0){
            this.breadcrumb.push({
              id:null,
              name:'Home'
            });
          }
          if (Number(entry) > 0 && Number(entry) <= index) {
            this.breadcrumb.push(copyBreadcrumb[Number(entry)]);
          }
        }
      }
      let parent_folder = crumb.id;
      this.documents = this.initDocuments.filter(e=>e['parent_id']==parent_folder);

    }

    cancelAll() {
      let array = this.existingFilesArray.value.sort((a, b) => (a.position < b.position) ? 1 : -1);

      for (let entry of array) {
        this.filesUploadArray.removeAt(Number(entry.position));
      }


      if (this.filesUploadArray.value.length > 0) {
        this.postFiles(this.uploadFilesForm.value.files)
      } else {
        this.resetFiles();
      }
    }



      async postFiles(value) {
        let payload: any = {};
        let string: any;
        let response: any;
        let content_array = [];

        this.zipLoaded = true;
        let parent_folder = await this.breadcrumb[this.breadcrumb.length-1]['id'];

        await asyncLoop(value, async (entry, next) => {
          payload = {};
          payload['type'] = entry.type;
          payload['size'] = entry.size;
          payload['name'] = this.replaceUnicode(entry['nameToEdit']+entry['extension']);
          payload['user_id'] = this.CurrentUserService.currentUser['id'];
          let myId = uuid.v4();
          payload['content'] = myId;
          payload['timestamp'] = new Date().getTime();
          if(parent_folder){
            payload['parent_id'] = parent_folder;
          }

          if (entry['content'] && entry.content !== null && entry.content !== 'null') {
            payload['content'] = entry.content;
            myId = entry.content;
              if(entry.file.size > 100000000){
                this.toastr.warning('Die Datei darf nicht größer als 100MB sein!', 'Datei zu groß!', {
                  timeOut: 4000,
                  extendedTimeOut: 500
                });
                next();
              }else{
                this.s3Bucket.upload({
                  Key: payload['content'],
                  Body: entry.file,
                  ServerSideEncryption: 'AES256'
                }, async (err, data2) =>{
                  if (err) {
                    console.log(err);
                    next();
                  } else {
                     await this.ApiClientService.putAPIObject("documents", payload).then(async (data)=>{
                      next();
                    });
                  }
                });
              }
          }else{
              if(entry.file.size > 100000000){
                this.toastr.warning('Die Datei darf nicht größer als 100MB sein!', 'Datei zu groß!', {
                  timeOut: 4000,
                  extendedTimeOut: 500
                });
                next();
              }else{
                this.s3Bucket.upload({
                  Key: payload['content'],
                  Body: entry.file,
                  ServerSideEncryption: 'AES256'
                }, async (err, data2) =>{
                  if (err) {
                    next();
                  } else {
                    console.log(payload);
                    this.ApiClientService.postAPIObject("documents", payload).then(async (data)=>{
                      next();
                    });
                  }
                });
              }
          }
        }, async (err)=>{
          if(err){
            console.log(err);
          }
          this.zipLoaded = false;
          this.files = {};
          this.files2 = {};
          this.filesArray = [];
          this.filesTableArray = [];
          this.resetFiles();
          await this.getList();
        });


      }


      async submitOverride(value) {
        let array = value.sort((a, b) => (a.position < b.position) ? 1 : -1);
        for (let entry of array) {
          if (!entry.confirm) {
            this.filesUploadArray.removeAt(Number(entry.position));
          } else {
            let t = this;
            await this.s3Bucket.deleteObject({ Bucket: 'sample-app-files-bucket', Key: entry.uuid }, (err, data) =>{
              if (err) {
                console.log(err);
              }
            });

            const faControlContent = (<FormArray>this.uploadFilesForm.controls['files']).at(Number(entry.position));
            faControlContent['controls'].content.setValue(entry.uuid);
          }
        }

        if (this.filesUploadArray.value.length > 0) {
          this.postFiles(this.uploadFilesForm.value.files)
        }
      }




      public token:any;
      async getTokenCreateUrl(file, download = false) {
        this.zipLoaded = true;
        if(file.type != "dir"){
          let now = new Date()
          let nowH = now.getHours();
          let date = now.setHours(nowH+1);

          let payload = {
            uuid: file.content,
            name:file.name,
            type:'files',
            expiration: new Date(date).getTime()
          };

          let objectTokenUrl = "https://ec2-54-93-253-99.eu-central-1.compute.amazonaws.com/staging/token_handler";

          this.ApiClientService.postAPIObject("create-token", payload).then((response) => {

              if(!response.errorMessage && response.state=='OK'){
                let token = response.body;
                let params = {
                  token: token,
                  file_name: name,
                  type:'files'
                };
                this.ApiClientService.getFile(params, objectTokenUrl +"/token.php").then(async (result) => {
                  if(result != 'Forbidden'){
                    var link = document.createElement("a");
                    let url = "";
                    link.download = result;
                    link.href = result;
                    document.body.appendChild(link);
                    await link.click();
                    document.body.removeChild(link);
                    this.ApiClientService.updateToken(params, objectTokenUrl +"/update-token.php").then((update) => {
                      // console.log(update);
                      this.zipLoaded = false;

                    });
                  }else{
                    this.toastr.warning('Die Datei konnte nicht heruntergeladen werden!', 'Datei nicht heruntergeladen!', {
                      timeOut: 4000,
                      extendedTimeOut: 500
                    });
                    this.zipLoaded = false;

                  }
                });
              }else{
                this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));
                this.zipLoaded = false;
              }
            });

        }
      }


      setFile(file) {
        let params = {
          uuid: file.content,
          name: file.name
        };

        this.selectedPDFFileContent = file.content;
        let objectTokenUrl = "https://ec2-54-93-253-99.eu-central-1.compute.amazonaws.com/staging/token_handler";

        this.ApiClientService.getPresigned(params, objectTokenUrl +"/presigned_url.php").then((result) => {
          if(result != 'Forbidden'){
            this.selectedPDFFile = result;
            this.showPDFPreview = !this.showPDFPreview;
          }else{
            this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));
          }
        });
      }


      clickOnRow(file, i, e){
        e.preventDefault();
        if(!jQuery(e.target).hasClass("actionDropdown2") && file.type=="dir"){
          this.actualFolder = {
            id:file.id,
            name:file.name
          };

          this.breadcrumb.push(this.actualFolder);
          let parent_folder = file.id;
          this.documents = this.initDocuments.filter(e=>e['parent_id']==parent_folder);

        }

      }


      private deleteFromS3Bucket(file, relocate) {
        let t = this;
        let content = file.content;
        let type= file.type;
        console.log(content);
          let body = {};
          body['content'] = file.content;
        this.ApiClientService.deleteAPIObject("documents", body).then((data) => {
          if(!data.errorMessage && data.state=='OK'){

              let tableIndexInit = this.initDocuments.findIndex(e=>e['content'] == file.content);
              let tableIndex = this.documents.findIndex(e=>e['content'] == file.content);

              if(tableIndex!==-1){
                let newArray = (this.documents.slice(0,tableIndex)).concat(this.documents.slice(tableIndex+1));
                this.documents = newArray;
              }

              if(tableIndexInit!==-1){
                let newArrayInit = (this.initDocuments.slice(0,tableIndexInit)).concat(this.initDocuments.slice(tableIndexInit+1));
                this.initDocuments = newArrayInit;
              }
            if(file.type != 'dir'){
              this.s3Bucket.deleteObject({ Bucket: 'sample-app-files-bucket', Key: file.content }, async (err, data)=> {
                if (err) {
                  console.log(err);
                }
              });
            }
          }else{
            this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));
          }
        });
      }

        async createFolder() {
          let parent_folder = await this.breadcrumb[this.breadcrumb.length-1]['id'];
          let arrayObj = {};
          arrayObj['array'] = [];
          var traverse = (current, parent, arrayObj, first = false)=>{
              if(!first){
                current['id'] = uuid.v4();
                current['content'] = uuid.v4();
                current['parent_id'] = parent;
                current['size'] = 0;
                current['timestamp'] = new Date().getTime();
                current['user_id'] = this.CurrentUserService.currentUser['id'];
                arrayObj['array'].push(current);
              }else{
                current['id'] = parent;
              }

              if(current['children'].length>0){
                for (let child of current['children']) {
                    traverse(child, current['id'], arrayObj);
                }
              }
          }
          await traverse(this.folders.root, parent_folder,arrayObj, true);

          let payload = {};
          payload['folders'] = arrayObj['array'];

          this.ApiClientService.postAPIObject("documents", payload).then(async (data)=>{
            this.resetFiles();
            await this.getList();
          });
        }


        addChild(c){
         c['children'].push({
           name:'', type:'dir', children:[]
         });
       }

       remove(c, i, p){
         let pos = p.split('.');
         let pos2 = pos.slice(0,pos.length-1);
         let r = this.folders.root;
         for(let ind of pos2){
           r = r.children[ind];
         }
         r.children.splice(i, 1);
       }

       removeChildren(c){
         c.children=[];
       }



         putDocument(file, bool) {
          let payload = {};
          payload['type'] = file.type;
          payload['size'] = file.size;
          payload['content'] = file.content;
          if(bool){
            let docuFileName = this.documentToEditName+this.documentToEditExtension;
            payload['name'] = docuFileName;
          }else{
            payload['name'] = this.folderToEditName;
          }

           this.ApiClientService.putAPIObject("documents", payload).then(async (data)=>{
             this.getList();
           });
         }


         setEditDocu(file){
           this.documentToEdit = file;
           this.documentToEditName = "";
           this.documentToEditExtension = "";

           let tmpFileName = file.name.split(".");

           for(let i=0; i<tmpFileName.length-1;i++){
             if(i>0){
               this.documentToEditName += ".";
             }
             this.documentToEditName += tmpFileName[i];
           }

           this.documentToEditExtension = "." + tmpFileName.pop();
         }

         setEditFolder(file){
            this.folderToEdit = file;
            this.folderToEditName = file.name;
         }

        setInitFolders(){
          this.folders = {
              root: {
                children: [
                  {
                    name: '',
                    type: 'dir',
                    children:[]
                  }
                ]
              }
            }
        }


        public filters = [];
        filterTable(value, key){

          if(value!=="" && key!=="create_date"){
            if(!this.filters.some(e=>e['key']==key)){
              let fil = { "key":key , "val":value};
              this.filters.push(fil);
            }else{
              let index = this.filters.findIndex((el) => (el['key'] === key));
              this.filters[index]['val'] = value;
            }
          }else if(value!=="" && key=="create_date"){
            if(!this.filters.some(e=>e['key']==key)){
              let fil = { "key":key , "val":value};
              this.filters.push(fil);
            }else{
              let index = this.filters.findIndex((el) => (el['key'] === key));
              this.filters[index]['val'] = value;
            }
          }else{
            let index = this.filters.findIndex((el) => (el['key'] === key));
            if(index!==-1){
              this.filters.splice(index, 1);
            }
          }

          let arr:any;
          let parent_folder = String(this.breadcrumb[this.breadcrumb.length-1]['id']);

          arr = this.initDocuments.filter((el) => {
             return this.filters.filter((entry) =>{
               if(key!=='create_date'){
                 if(el[entry['key']]==undefined || !(String(el[entry['key']]).toLowerCase()).includes(String((entry['val']).toLowerCase())) || !(!el['parent_id'] && parent_folder == "null") || ((typeof el['parent_id'] == "string") && String(el['parent_id'])!==String(parent_folder))){
                   return false;
                 }else{
                   return true;
                 }
               }else{
                 if(el[entry['key']]==undefined || !(!el['parent_id'] && parent_folder == "null") || ((typeof el['parent_id'] == "string") && String(el['parent_id'])!==String(parent_folder))){
                   return false;
                 }else{

                   if(el[entry['key']]){
                     let create = this.datePipe.transform(new Date(el[entry['key']]),'dd.MM.yyyy');

                     if(create!==entry['val']){
                       return false
                     }
                   }
                   return true;
                 }
               }

             }).length === this.filters.length;
          });

          this.documents = arr;
        }

        resetEntryDate(){
          this.filterTable('', 'create_date');
        }

        onDateSelection1(e){
          console.log(e);
          let year = String(e['year']);
          let month = String(e['month']);
          let day = String(e['day']);

          let filter = this.datePipe.transform(new Date(year+'-'+month+'-'+day),'dd.MM.yyyy');
          this.filterTable(filter, 'create_date');
          // console.log(model1);
        }

  }
