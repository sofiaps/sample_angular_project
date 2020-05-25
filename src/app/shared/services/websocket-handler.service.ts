import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Subject, Observable, BehaviorSubject } from 'rxjs/Rx';

export interface Message {
  message: string;
  type: string;
  body: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketHandlerService {

  public messages: Subject<Message>;
  public chatMessage: BehaviorSubject<string>; /*= new BehaviorSubject<string>('');*/

  private webSocketURL: any;

  constructor(
    private websocketService: WebsocketService,
  ) {


    this.webSocketURL = "wss://mnh3bg1wsf.execute-api.eu-central-1.amazonaws.com/staging";


    this.messages = <Subject<Message>>this.websocketService.connect(this.webSocketURL, JSON.stringify({})).map(
      (response: MessageEvent): Message => {
        let data = JSON.parse(response.data);

        return {
          message: data.info,
          type: data.type,
          body: data.body
        };
      }
    ).share();
  }
}
