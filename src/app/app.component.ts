import { Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute  } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    subscription: Subscription;

    constructor(private router: Router,
      private activatedRoute: ActivatedRoute,
      public translate: TranslateService,
      private titleService: Title
    ) {
        if(localStorage.getItem("sampleAppKey")==undefined || localStorage.getItem("sampleAppKey") == ""){
          localStorage.setItem("sampleAppKey","DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8");
        }
        translate.setDefaultLang("en");
        if(localStorage.getItem("sampleAppLang")!==undefined && localStorage.getItem("sampleAppLang")!=="" && localStorage.getItem("sampleAppLang")!==null && localStorage.getItem("sampleAppLang")!=="undefined" && localStorage.getItem("sampleAppLang")!=="null"){
          translate.use(localStorage.getItem("sampleAppLang"))
        }else{
          translate.use("en");
          localStorage.setItem("sampleAppLang", "en");
        }
    }

    ngOnInit() {
        this.subscription = this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe((event) => {window.scrollTo(0, 0);
              if(event['url'] == '/user-settings'){
                this.titleService.setTitle(this.translate.instant('userSettings.title'));
              }
              else if(event['url'] == '/tasks'){
                this.titleService.setTitle(this.translate.instant('Tasks'));
              }
              else if(event['url'] == '/login'){
                this.titleService.setTitle(this.translate.instant('Login'));
              }else if(event['url'] == '/chat'){
                this.titleService.setTitle(this.translate.instant('Chat'));
              }else if(event['url'] == '/files'){
                this.titleService.setTitle(this.translate.instant('Files'));
              }else{
                this.titleService.setTitle("Sample Angular App");
              }
            });
    }


    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }



}
