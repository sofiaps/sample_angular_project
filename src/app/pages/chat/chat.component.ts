import { Component, ViewChild, ElementRef, OnInit, Renderer2 } from '@angular/core';
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


var AWS = require('aws-sdk');
AWS.config.region = 'eu-central-1';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "eu-central-1:0cb66024-2e03-41ae-8f3d-a7b9d11e3966",
});
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
    s3Bucket = new AWS.S3({
      apiVersion: '2006-03-01',
      params: { Bucket: 'sample-app-files-bucket' }
    });

    activeChatUser: string;
    activeChatUserImg: string;
    @ViewChild('messageInput', {static: false}) messageInputRef: ElementRef;
    @ViewChild('chatSidebar', {static: false}) sidebar:ElementRef;
    @ViewChild('contentOverlay', { static: false }) overlay: ElementRef;


    messages = new Array();

    contacts = new Array();
    contactsRoomsObject = {};
    chatIndex: any;
    chatRoom:any;
    public filesUploadArray: FormArray;
    loading=false;
    currentUser:any;
    activeContact:any;
    loadingConversation = false;
    inputChatContent:'';
    socketSubscription:any;
    searchText='';

    constructor(
      private elRef: ElementRef,
        private toastr: ToastrService,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private apiClientService: ApiClientService,
        private fb: FormBuilder,
        private CurrentUserService: CurrentUserService,
        public contactsService: ContactsService,
        private translate:TranslateService,
        private websocketHandlerService: WebsocketHandlerService
      ) {

      this.filesUploadArray = this.fb.array([]);
      this.currentUser = this.CurrentUserService.currentUser;

      this.socketSubscription = this.websocketHandlerService.messages.subscribe(message => {
        if(message && message.message && message.type=="Chat" && message.message=="New chat message" && message.body.newMessage.room_id!==this.chatRoom){
          let x = this.contactsService.contacts.findIndex(e=>e['id']==message.body.newMessage.user_id);

          if(x>-1){
            this.contactsService.contacts[x]['unread'] = 1;
            this.contactsService.contacts[x]['unread_counter']++;
            this.contactsService.contacts[x]['room_id']=message.body.newMessage.room_id;
            this.contactsService.contacts[x]['last_msg']=unescape(message.body.newMessage.content);
            this.contactsService.contacts[x]['last_msg_time']=message.body.newMessage.timestamp;
            this.contactsService.contacts[x]['last_msg_type']=message.body.newMessage.type;
            this.contactsService.sum['unread'] = 1;
            this.contactsService.sum['unread_counter']++;
          }
        }else if(message && message.message && message.type=="Chat" && message.message=="New chat message" && message.body.newMessage.room_id==this.chatRoom){
          let  newMsg = {};
          newMsg['user_id'] = message.body.newMessage.user_id;
          newMsg['type'] =  message.body.newMessage.type;
          if(newMsg['type']=='text'){
            newMsg['content'] = unescape(message.body.newMessage.content);
          }else{
            newMsg['file_name'] = message.body.newMessage.file_name;
            newMsg['file_uuid'] = message.body.newMessage.file_uuid;
          }
          newMsg['timestamp'] =  message.body.newMessage.timestamp;
          this.messages.push(newMsg);
        }
      });
    }

    ngOnInit() {
    }

    ngOnDestroy(){
      if(this.socketSubscription){
        this.socketSubscription.unsubscribe();
      }
    }


    SetActive(event, chatRoom, chatId: string) {
      this.onContentOverlay();

      this.loadingConversation = true;
      this.chatIndex = chatId;
      this.activeContact = this.contactsService.contacts[chatId];


      var hElement: HTMLElement = this.elRef.nativeElement;
      var allAnchors = hElement.getElementsByClassName('list-group-item');
      [].forEach.call(allAnchors, function (item: HTMLElement) {
        item.setAttribute('class', 'list-group-item no-border');
      });
      event.currentTarget.setAttribute('class', 'list-group-item bg-blue-grey bg-lighten-5 border-right-primary border-right-2');

      this.messages = [];

      if(!chatRoom){
        let payload = {};
        payload['user_id_1'] = this.CurrentUserService.currentUser['id'];
        payload['user_id_2'] = this.contactsService.contacts[chatId]['id'];
        this.apiClientService.postAPIObject('chat-room', payload).then(async (response) => {
          if(!response.errorMessage && response.state=='OK'){
            this.chatRoom = await response['body'];
            this.contactsService.contacts[chatId]['room_id']= this.chatRoom;
            this.loadingConversation = false;
          }else{
            this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
            this.chatIndex = undefined;
            this.loadingConversation = false;
            jQuery(event.currentTarget).toggleClass('no-border bg-blue-grey bg-lighten-5 border-right-primary border-right-2');
          }
        });
      }else if(chatRoom && chatRoom!==this.chatRoom){

        this.chatRoom = chatRoom;
          let param = {};
          param['roomId'] = chatRoom;
        this.apiClientService.getAPIObject('chat-messages', param).then(async (response) => {
          if(!response.errorMessage && response.state=='OK'){
            this.messages = await response.body;
            this.loadingConversation = false;
            let x = this.contactsService.contacts.findIndex(e=>e['id']==this.activeContact['id']);

            //if there are unread messages, send WebSocket Message => update DB and unread messages in service
            if(x>-1 && !!this.contactsService.contacts[x]['unread']){
              let ws_msg:any = ({
                message: 'setRead',
                type: 'Chat',
                body: {
                  userId: this.CurrentUserService.currentUser['id'],
                  roomId: chatRoom
                }
              });

              this.websocketHandlerService.messages.next(ws_msg);
              this.contactsService.sum['unread_counter']-= this.contactsService.contacts[x]['unread_counter'];
              if(this.contactsService.sum['unread_counter'] == 0){
                this.contactsService.sum['unread'] = 0;
              }
              this.contactsService.contacts[x]['unread'] = 0;
              this.contactsService.contacts[x]['unread_counter']=0;
            }
          }else{
            this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
            this.chatIndex = undefined;
            this.loadingConversation = false;
            jQuery(event.currentTarget).toggleClass('no-border bg-blue-grey bg-lighten-5 border-right-primary border-right-2');
          }
        });
      }
    }


    setInput(e){
        if(e.keyCode == 13 && !e.shiftKey){
          e.preventDefault();
            this.onAddMessage();
        }
    }

     async dropped(files: NgxFileDropEntry[]) {
      let fileControl: any;
      await asyncLoop(files, async (droppedFile, next) => {
        if (droppedFile.fileEntry.isFile && droppedFile.relativePath.split("/").length == 1) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          await fileEntry.file((file: File) => {
            fileControl = {};
            fileControl['name'] = droppedFile.fileEntry.name;
            if (file.type !== "") {
              fileControl['type'] = file.type;
            } else {
              if (file.name.substr(file.name.lastIndexOf('.') + 1) == "jpg" ||
                file.name.substr(file.name.lastIndexOf('.') + 1) == "jpeg" ||
                file.name.substr(file.name.lastIndexOf('.') + 1) == "png")
                {
                fileControl['type'] = "image/" + file.name.substr(file.name.lastIndexOf('.') + 1);
              } else {
                fileControl['type'] = file.name.substr(file.name.lastIndexOf('.') + 1);
              }
            }
            fileControl['file'] = file;
            this.filesUploadArray.push(this.fb.control(fileControl));
          });
          next();
        }
      }, async (err)=>{
        if(err){
          console.log(err);
        }
        jQuery('#chatWindow').css('background-color', '');
      });
    }

    public fileOver(event) {
      jQuery('#chatWindow').css('background-color', 'lightgrey');
    }

    public fileLeave(event) {
      jQuery('#chatWindow').css('background-color', '');
    }

    removeItem(index) {
      this.filesUploadArray.removeAt(index);
    }


    async onAddMessage(){
      var newMessage: any;
      let message: any;
      let payload2: any;

    if(this.filesUploadArray.controls.length>0){
      this.loadingConversation=true;

      await asyncLoop(this.filesUploadArray.controls, async (file, next) => {
        let blob = file.value.file.slice(0, file.value.file.size, file.value.file.type);
        let newFile = new File([blob], this.replaceUnicode(file.value.file.name), {type: file.value.file.type});

        if(newFile.size > 100000000){
          this.toastr.warning('Die Datei darf nicht größer als 100MB sein!', 'Datei zu groß!', {
            timeOut: 4000,
            extendedTimeOut: 500
          });
        }else{
          let body = {};
          body['room_id'] = this.chatRoom;
          body['user_id'] = this.CurrentUserService.currentUser['id'];
          body['partner'] = this.activeContact['id'];
          body['type'] = 'file';
          body['file_name'] = file.value.file.name;
          body['timestamp'] = new Date().getTime();
          body['file_uuid'] = uuid.v4();
          this.s3Bucket.upload({
             Key: body['file_uuid'],
             Body: newFile,
             ServerSideEncryption: 'AES256'
           }, (err, data) => {
             if (err) {
               console.log(err);
              next();
             } else {
               this.apiClientService.postAPIObject("chat-messages", body).then(async (response)=> {
                 if(!response.errorMessage){
                    let message = body;
                    this.contactsService.contacts[this.chatIndex]['last_msg'] = file['name'];
                    this.contactsService.contacts[this.chatIndex]['last_msg_time'] = body['timestamp'];
                    this.messages.push(message);
                    this.inputChatContent="";
                    next();
                 }else{
                   next();
                 }
               });
             }
           });

        }

        }, async (err)=>{
          if(err){

            for (let index =this.filesUploadArray.length - 1; index > -1; index--) {
             this.filesUploadArray.removeAt(index);
            }
            this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));

          }else{

            for (let index =this.filesUploadArray.length - 1; index > -1; index--) {
             this.filesUploadArray.removeAt(index);
            }
           this.loadingConversation = false;
           setTimeout(function(){
             jQuery("#chatWindow").scrollTop(jQuery("#chatWindow")[0].scrollHeight);
           }, 5);
          }
        });

    }else{
      if(this.inputChatContent!==""){
        let body = {};
        body['room_id'] = this.chatRoom;
        body['user_id'] = this.CurrentUserService.currentUser['id'];
        body['type'] = 'text';
        body['content'] = escape(this.inputChatContent);
        body['timestamp'] = new Date().getTime();
        body['partner'] = this.activeContact['id'];

        this.apiClientService.postAPIObject("chat-messages", body).then(async (response)=> {
          if(!response.errorMessage){
            this.contactsService.contacts[this.chatIndex]['last_msg'] = this.inputChatContent;
            this.contactsService.contacts[this.chatIndex]['last_msg_time'] = body['timestamp'];
            let  message = {};
            message['user_id'] = this.CurrentUserService.currentUser['id'];
            message['type'] = 'text';
            message['content'] = this.inputChatContent;
            message['timestamp'] = body['timestamp'];
            this.messages.push(message);
            this.inputChatContent="";
            setTimeout(function(){
              jQuery("#chatWindow").scrollTop(jQuery("#chatWindow")[0].scrollHeight);
            }, 0);
          }else{
            this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));
          }
        });
      }
    }
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

    downloadFile(name, uuid) {
      let now = new Date()
      let nowH = now.getHours();
      let date = now.setHours(nowH+1);

      let payload = {
        uuid: uuid,
        name:name,
        type:'chat',
        expiration: new Date(date).getTime()
      };



      let objectTokenUrl = "https://ec2-54-93-253-99.eu-central-1.compute.amazonaws.com/staging/token_handler";
      //
      this.apiClientService.postAPIObject("create-token", payload).then((response) => {
          if(!response.errorMessage && response.state=='OK'){
            let token = response.body;
            let params = {
              token: token,
              file_name: name,
              type:'chat'
            };
            this.apiClientService.getFile(params, objectTokenUrl +"/token.php").then(async (result) => {
              // console.log(result);
              if(result != 'Forbidden'){
                var link = document.createElement("a");
                let url = "";
                link.download = result;
                link.href = result;
                document.body.appendChild(link);
                await link.click();
                document.body.removeChild(link);
                this.apiClientService.updateToken(params, objectTokenUrl +"/update-token.php").then((update) => {
                  // console.log(update);
                });
              }else{
                this.toastr.warning('Die Datei konnte nicht heruntergeladen werden!', 'Datei nicht heruntergeladen!', {
                  timeOut: 4000,
                  extendedTimeOut: 500
                });
              }
            });
          }else{
            this.toastr.error(this.translate.instant('general.tstrErrorMsg'), this.translate.instant('general.error'));

          }
        });
    }

    isToday(time){
      let date = new Date(time).setHours(0,0,0,0);
      let now = new Date().setHours(0,0,0,0);
      if(date<now){
        return false;
      }else{
        return true;
      }
    }


    onSidebarToggle() {
      this.renderer.removeClass(this.sidebar.nativeElement, 'd-none');
      this.renderer.removeClass(this.sidebar.nativeElement, 'd-sm-none');
      this.renderer.addClass(this.sidebar.nativeElement, 'd-block');
      this.renderer.addClass(this.sidebar.nativeElement, 'd-sm-block');
      this.renderer.addClass(this.overlay.nativeElement, 'show');
    }

    onContentOverlay() {
      this.renderer.removeClass(this.overlay.nativeElement, 'show');
      this.renderer.removeClass(this.sidebar.nativeElement, 'd-block');
      this.renderer.removeClass(this.sidebar.nativeElement, 'd-sm-block');
      this.renderer.addClass(this.sidebar.nativeElement, 'd-none');
      this.renderer.addClass(this.sidebar.nativeElement, 'd-sm-none');

    }

  }
