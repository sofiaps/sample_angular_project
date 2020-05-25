import { Component, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { AuthService } from '../auth/auth.service';
import { ApiClientService } from '../services/ApiClient.service';
import { Router, ActivatedRoute } from "@angular/router";
import { CurrentUserService } from '../services/currentUser.service';
import { PortalSettingsService } from '../services/portal-settings.service';
import { WebsocketHandlerService } from '../services/websocket-handler.service';
import { ContactsService } from '../services/contacts.service';


@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentLang = "en";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  public isCollapsed = true;
  layoutSub: Subscription;
  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  public config: any = {};
  public currentUser:any = {};
  public msgSubscription:any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private layoutService: LayoutService,
    private ApiClientService: ApiClientService,
    private configService:ConfigService,
    private CurrentUserService:CurrentUserService,
    private AuthService: AuthService,
    private websocketHandlerService: WebsocketHandlerService,
    private portalSettings: PortalSettingsService,
    private contactsService: ContactsService) {


    const browserLang: string = translate.getBrowserLang();

    this.ApiClientService.getAPIObject('user-list', { id : this.CurrentUserService.currentUser['id']}).then(async (response) =>{
      if(!response.errorMessage && response.state=='OK'){
        this.contactsService.contacts = response.body;
        this.contactsService.sum['unread'] = 0;
        this.contactsService.sum['unread_counter'] = 0;
        for(let entry of response.body){
          if(entry['unread_counter']>0){
            this.contactsService.sum['unread'] = 1;
            this.contactsService.sum['unread_counter'] += entry['unread_counter'];
          }
        }
      }else{
        this.contactsService.contacts = [];
      }
    });

    this.msgSubscription = this.websocketHandlerService.messages.subscribe(async message => {
      if(message && message.message && message.type=="User" && message.message=="User Registered"){
        this.contactsService.contacts.push(message.body.newUser);
      }
      if(message && message.message && message.type=="Chat" && message.message=="New chat message" && this.router.url != '/chat'){
        let x = this.contactsService.contacts.findIndex(e=>e['id']==message.body.newMessage.user_id);
        console.log(this.contactsService.contacts)
        if(x>-1){
          this.contactsService.contacts[x]['unread'] = 1;
          this.contactsService.contacts[x]['unread_counter']++;
          this.contactsService.sum['unread'] = 1;
          this.contactsService.sum['unread_counter']++;
        }
      }
    });

    if(localStorage.getItem("sampleAppLang")!==undefined && localStorage.getItem("sampleAppLang")!=="" && localStorage.getItem("sampleAppLang")!==null && localStorage.getItem("sampleAppLang")!=="undefined" && localStorage.getItem("sampleAppLang")!=="null"){
      translate.use(localStorage.getItem("sampleAppLang"))
    }else{
      translate.use("en");
      localStorage.setItem("sampleAppLang", "en");
    }

    this.layoutSub = layoutService.changeEmitted$.subscribe(
      direction => {
        const dir = direction.direction;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
      });
  }

  async ngOnInit() {
    this.config = this.configService.templateConf;
    this.currentUser = this.CurrentUserService.getUser();
  }

  ngAfterViewInit() {
    if(this.config.layout.dir) {
      setTimeout(() => {
        const dir = this.config.layout.dir;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
      }, 0);

    }
  }

  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
    if(this.msgSubscription){
      this.msgSubscription.unsubscribe();
    }
  }

  ChangeLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem("sampleAppLang",language);
  }

  ToggleClass() {
    if (this.toggleClass === "ft-maximize") {
      this.toggleClass = "ft-minimize";
    } else {
      this.toggleClass = "ft-maximize";
    }
  }

  logout(){
    this.AuthService.logout();
    localStorage.removeItem("sampleAppKey");
    localStorage.removeItem("currentUser");
    this.router.navigate(["login"]);
  }

  toggleNotificationSidebar() {
    this.layoutService.emitNotiSidebarChange(true);
  }

  toggleSidebar() {
    const appSidebar = document.getElementsByClassName("app-sidebar")[0];
    if (appSidebar.classList.contains("hide-sidebar")) {
      this.toggleHideSidebar.emit(false);
    } else {
      this.toggleHideSidebar.emit(true);
    }
  }
}
