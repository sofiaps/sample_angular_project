import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ValidateNotEmpty } from '../../shared/validators/empty.validator';
import { ApiClientService } from '../../shared/services/ApiClient.service';
import { CurrentUserService } from '../../shared/services/currentUser.service';
import { AuthService } from '../../shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ValidateWhiteSpace } from '../../shared/validators/white-space.validator';
import { WebsocketHandlerService } from '../../shared/services/websocket-handler.service';

const bcrypt = require('bcryptjs');

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent implements OnInit{

    public formLogin: FormGroup;
    public formRecover: FormGroup;
    public formRegister: FormGroup;
    public queryDict:any;
    public passwordRecover = false;
    public showRegisterForm = false;
    public showPwd = false;
    public showPwdLogin = false;
    public selectedLang:any;
    public loading=false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public formBuilder: FormBuilder,
        private toastr: ToastrService,
        private ApiClientService: ApiClientService,
        private AuthService: AuthService,
        public translate: TranslateService,
        private CurrentUserService: CurrentUserService,
        private websocketHandlerService: WebsocketHandlerService,
      ) {

        if(this.AuthService.getToken()!=="DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8"){
          this.router.navigate(['']);
        }

        this.formLogin = this.formBuilder.group({
                username: [null, [CustomValidators.email]],
                password: [null, [Validators.required, ValidateNotEmpty]]
              });

      let password = new FormControl('', [ValidateWhiteSpace]);
      let certainPassword = new FormControl('', CustomValidators.equalTo(password));

      this.formRegister = this.formBuilder.group({
              username: [null, [CustomValidators.email]],
              password:password,
              repeatPwd:certainPassword,
              name: [null],
              agreedToTerms : [null]
            });

        this.checkIfAgreed();

        this.formRecover = this.formBuilder.group({
                username: [null, [CustomValidators.email]]
              });

        this.queryDict = {}
        window.location.search.substr(1).split("&").forEach((item)=>{this.queryDict[item.split("=")[0]] = item.split("=")[1]})

        if(this.queryDict['email'] && this.queryDict['email']!==undefined){
          this.formLogin.get('username').setValue(decodeURIComponent(this.queryDict['email']));
        }
          if(localStorage.getItem("sampleAppLang")!==undefined && localStorage.getItem("sampleAppLang")!=="" && localStorage.getItem("sampleAppLang")!==null && localStorage.getItem("sampleAppLang")!=="undefined" && localStorage.getItem("sampleAppLang")!=="null"){
            translate.use(localStorage.getItem("sampleAppLang"))
            this.selectedLang = localStorage.getItem("sampleAppLang");
          }else{
            translate.use("en");
            localStorage.setItem("sampleAppLang", "en");
            this.selectedLang = "en";
          }

      }

      checkIfAgreed(){
        let termsControl = this.formRegister.get('agreedToTerms');
        termsControl.valueChanges
          .subscribe(v => {
            if(v==true){
              termsControl.setErrors(null);
            }else{
              termsControl.setErrors({'invalid':true});
            }
          });
      }

      ngOnInit(){
      }

    // On submit button click
    async onSubmit(value) {
        this.ApiClientService.authenticateUser('', value).then(async (response) =>{
          console.log(response);
          if(!response.errorMessage && response.state=='OK'){
            this.CurrentUserService.currentUser = await response.body;
            // await this.CurrentUserService.setUser(response.body);
            localStorage.setItem("sampleAppKey", "81WALyMMPx3h0NzM9pEDnregwDGkb6j6xvzKd1wh");
            localStorage.setItem("currentUser", JSON.stringify(response.body));
            this.AuthService.userLoggedIn();
            this.router.navigate([""]);
          }else{
            this.toastr.error(this.translate.instant("login.error"),  this.translate.instant("general.error"));
          }
        });
    }

    // On submit register forms
    async onRegisterSubmit(value){
      await bcrypt.hash(value['password'], 10, (err, hash) => {
        if(err){
          this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
        }
        let payload = value;
        payload['password'] = hash;
        delete payload['repeatPwd'];
        delete payload['agreedToTerms'];
        console.log(JSON.stringify(payload));
        this.ApiClientService.postAPIObject('user', payload).then(async (response) =>{
          console.log(response);
          if(!response.errorMessage && response.state=='OK'){
            this.toastr.success(this.translate.instant("login.registerSuccess"),  this.translate.instant("general.success"));
            this.showRegisterForm = !this.showRegisterForm;
          }else{
            if(response.errorMessage == "Email exists"){
              this.toastr.error(this.translate.instant("user.usrTstrWrn"),  this.translate.instant("general.error"));
            }else{
              this.toastr.error(this.translate.instant("login.error"),  this.translate.instant("general.error"));
            }
          }
        });
      });

    }
    // On Forgot password link click
    onRecoverSubmit(value) {
      this.loading=true;
        this.ApiClientService.postAPIObject('recoverEmail', value).then((response) =>{
          if(response==null){
            this.toastr.success(this.translate.instant("user.loginMailSend"), this.translate.instant("general.success"));
            this.passwordRecover = !this.passwordRecover;
              this.loading=false;
          }else{
            if(!response.errorMessage){
              this.toastr.error(this.translate.instant("recover.invalidMsg"), this.translate.instant("general.error"));
            }else{
              this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
            }
              this.loading=false;
          }
        });
    }

    useLanguage(lang){
      this.selectedLang = lang;
      this.translate.use(lang);
      localStorage.setItem('sampleAppLang',lang);
    }

    changePwdType(e){
      if(e=="register"){
        this.showPwd = !this.showPwd;
        let type = jQuery("#registerPwd").prop('type');

        switch(type){
          case "password":
            jQuery("#registerPwd").prop('type', 'text');
            jQuery("#registerRepeatPwd").prop('type', 'text');
            return;
          default:
            jQuery("#registerPwd").prop('type', 'password');
            jQuery("#registerRepeatPwd").prop('type', 'password');
            return;
        }
      }else{
        this.showPwdLogin = !this.showPwdLogin;
        let type = jQuery("#loginPwd").prop('type');

        switch(type){
          case "password":
            jQuery("#loginPwd").prop('type', 'text');
            return;
          default:
            jQuery("#loginPwd").prop('type', 'password');
            return;
        }
      }

    }

}
