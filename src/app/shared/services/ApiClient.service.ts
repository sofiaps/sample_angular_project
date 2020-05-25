import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_CLIENT } from './api-data';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class ApiClientService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
  }

  public authenticateUser(url: string, body) {
    var headers = new HttpHeaders()
            .set("Content-Type", "application/json")
            .set("x-api-key", this.authService.getToken());

      url = API_CLIENT[0];
      return this.http.post(url, body, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

  }

  public  getAPIObject(serviceDec: string, param: any) {
    var headers = new HttpHeaders()
            .set("Content-Type", "application/json")
            .set("x-api-key", this.authService.getToken());


    var urlTemp = "";
    switch (serviceDec) {

      case 'user-list':
        urlTemp = API_CLIENT[1] + '?id=' + param['id'];
        return this.http.get(urlTemp, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'chat-messages':
        urlTemp = API_CLIENT[7] + '?roomId=' + param['roomId'];
        return this.http.get(urlTemp, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'documents':
        urlTemp = API_CLIENT[9] + '?userId=' + param['userId'];
        return this.http.get(urlTemp, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

          default:
              console.error('An error occurred. Wrong service declaration.');

      }
  }

  postAPIObject(serviceDec: string, payload: any) {
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json")
            .set("x-api-key", this.authService.getToken());

    switch (serviceDec) {

      case 'user':
        return this.http.post(API_CLIENT[2], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'recoverEmail':
        return this.http.post(API_CLIENT[3], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'trello-lambda':
        return this.http.post(API_CLIENT[4], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'task-attachment':
        return this.http.post(API_CLIENT[5], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'chat-room':
        return this.http.post(API_CLIENT[6], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'chat-messages':
        return this.http.post(API_CLIENT[7], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'create-token':
        return this.http.post(API_CLIENT[8], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'documents':
        return this.http.post(API_CLIENT[9], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      default:
        console.error('An error occurred. Wrong service declaration.');

    }

  }

  putAPIObject(serviceDec: string, payload: any) {
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json")
            .set("x-api-key", this.authService.getToken());

    switch (serviceDec) {

      case 'user':
        return this.http.put(API_CLIENT[2], payload, {headers})
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

        case 'documents':
          return this.http.put(API_CLIENT[9], payload, {headers})
            .toPromise()
            .then((response: Response) => response)
            .catch(this.handleError);

      default:
        console.error('An error occurred. Wrong service declaration.');

    }

  }

  deleteAPIObject(serviceDec: string, payload: any) {
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json")
            .set("x-api-key", this.authService.getToken());

    switch (serviceDec) {

      case 'user':
        return this.http.request('delete', API_CLIENT[2], { headers: headers, body: payload } )
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);

      case 'documents':
        return this.http.request('delete', API_CLIENT[9], { headers: headers, body: payload } )
          .toPromise()
          .then((response: Response) => response)
          .catch(this.handleError);


      default:
        console.error('An error occurred. Wrong service declaration.');

    }

  }

  getFile(params: any, url: string){
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json");

    url = url.concat("?token=" + params['token']);
    if(params['file_name'] != undefined){
      url = url.concat("&type="+params['type']+"&file_name=" + params['file_name']);
    }

    return this.http.get(url, {headers})
      .toPromise()
      .then((response: Response) => response)
      .catch(this.handleError);
  }


  getPresigned(params: any, url: string){
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json");

    url = url.concat("?uuid=" + params['uuid']+"&name=" + params['name']);

    return this.http.get(url, {headers})
      .toPromise()
      .then((response: Response) => response)
      .catch(this.handleError);
  }



  updateToken(params: any, url: string){
    const headers = new HttpHeaders()
            .set("Content-Type", "application/json");

    url = url.concat("?token=" + params['token']);
    return this.http.get(url, {headers})
      .toPromise()
      .then((response: Response) => response)
      .catch(this.handleError);
  }

  private handleError = (error: any):any => {
      console.error('TEST', error); // nur für tests
      return error;
  }

}
