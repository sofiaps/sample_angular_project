import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CurrentUserService {
  public currentUser: any;

  constructor() {
    if(this.currentUser==undefined){
      this.currentUser = localStorage.getItem("currentUser")!== undefined ? JSON.parse(localStorage.getItem("currentUser")) : {};
    }
  }

  setUser(user) {
    this.currentUser = user;
    if(user['attr']!==undefined && user['attr']!==null && user['attr']!=="" && (typeof user['attr'] == 'string')){
      this.currentUser['attr'] = JSON.parse(user['attr']);
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  getUser(){
    if(this.currentUser!==undefined){
      return this.currentUser;
    }else{
      this.currentUser = localStorage.getItem("currentUser")!== undefined ? JSON.parse(localStorage.getItem("currentUser")) : {};
    }
  }
}
