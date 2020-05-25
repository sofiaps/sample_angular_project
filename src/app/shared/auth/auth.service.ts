import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  token: string = localStorage.getItem("sampleAppKey") || "DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8";

  constructor(private router: Router) {}

  signupUser(email: string, password: string) {
    //your code for signing up the new user
  }

  signinUser(email: string, password: string) {
    //your code for checking credentials and getting tokens for for signing in user
    this.token = "81WALyMMPx3h0NzM9pEDnregwDGkb6j6xvzKd1wh";
  }

  logout() {
    this.token = "DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8";
  }

  userLoggedIn() {
    this.token = "81WALyMMPx3h0NzM9pEDnregwDGkb6j6xvzKd1wh";
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    if(this.token=="81WALyMMPx3h0NzM9pEDnregwDGkb6j6xvzKd1wh"){
      return true;
    }
    return false;
  }
}
