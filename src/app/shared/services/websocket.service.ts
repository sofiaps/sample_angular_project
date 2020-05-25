import { Injectable, ChangeDetectionStrategy } from '@angular/core';
import { CurrentUserService } from './currentUser.service';
import { AuthService } from '../auth/auth.service';
import * as Rx from "rxjs/Rx";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

    private subject: Rx.Subject<MessageEvent>;
    private currentUser:any;

  constructor(
   private user: CurrentUserService,
    private auth: AuthService
  ) {
    this.currentUser = user.getUser();
  }


  public connect(url: string, data: string): Rx.Subject<MessageEvent> {
    this.subject = this.create(url, data);
    return this.subject;
  }

  private create(url: string, data: string): Rx.Subject<MessageEvent> {
    let t=this;
    let ws:any;
    let observable = Rx.Observable.create(function observe(obs: Rx.Observer<MessageEvent>){
      ws = new WebSocket(url);
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = function(e){
        console.log(e);
        obs.error.bind(obs);
      };

      ws.onclose = function(e) {
          if(e.code!==1000){
            if(e.code===1001 || e.code==1005){
              if(t.auth.getToken()!=='DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8'){
                setTimeout(function() {
                    observe(obs);
                }, 1000);
              }
            }else{
              if(t.auth.getToken()!=='DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8'){
                setTimeout(function() {
                    observe(obs);
                }, 1000);
              }
            }
        }

      };
      ws.onopen = function() {
        var entryData = {
          type: 'init',
          message: 'setUUID',
          body: {
            UUID: t.currentUser['id']
          }
        }
        ws.send(JSON.stringify(entryData));
      }
      return ws.close.bind(ws);

    });

    let observer = {
      next: (data: Object) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  public getSubject(): Rx.Subject<MessageEvent> {
    return this.subject;
  }
}
