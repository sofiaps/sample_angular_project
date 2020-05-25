import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LangChangeService {

  public languageChange: Subject<string> = new Subject<string>();
  languageSubscription: Subscription;

    constructor() {
      this.languageSubscription = this.languageChange.subscribe((value) => {
        console.log(value)
      });
    }

    changeLanguage(language){
      this.languageChange.next(language);
    }

    ngOnDestroy(){
      if (this.languageSubscription) {
        this.languageSubscription.unsubscribe();
      }
    }

}
