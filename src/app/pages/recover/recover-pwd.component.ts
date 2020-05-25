import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ValidateNotEmpty } from '../../shared/validators/empty.validator';
import { ValidateWhiteSpace } from '../../shared/validators/white-space.validator';
import { ApiClientService } from '../../shared/services/ApiClient.service';
import { CurrentUserService } from '../../shared/services/currentUser.service';
import { AuthService } from '../../shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

const bcrypt = require('bcryptjs');

@Component({
    selector: 'app-recover-pwd',
    templateUrl: './recover-pwd.component.html',
    styleUrls: ['./recover-pwd.component.scss']
})

export class RecoverPwdComponent implements OnInit{


    public formRecover: FormGroup;
    public queryDict:any;
    public newPassword:any = false;
    public selectedLang:any;
    public showPwd = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public formBuilder: FormBuilder,
        private toastr: ToastrService,
        private ApiClientService: ApiClientService,
        private AuthService: AuthService,
        public translate: TranslateService,
        private CurrentUserService: CurrentUserService
      ) {

        if(this.AuthService.getToken()!=="DZk60uDwgY5lFdWjLjElT3ci0vTkWiNnMu51Iqf8"){
          this.router.navigate(['']);
        }

      let password = new FormControl('', [Validators.required, ValidateWhiteSpace]);
      let certainPassword = new FormControl('', CustomValidators.equalTo(password));
        // let password = new FormControl('', [Validators.required]);
        // let certainPassword = new FormControl('', CustomValidators.equalTo(password));

        this.formRecover = this.formBuilder.group({
                username: [null, [CustomValidators.email]],
                code: [null, [Validators.required, ValidateNotEmpty]],
                password:password,
                repeatPwd:certainPassword
              });

        this.queryDict = {}
        window.location.search.substr(1).split("&").forEach((item)=>{this.queryDict[item.split("=")[0]] = item.split("=")[1]})

        if(this.queryDict['email'] && this.queryDict['email']!==undefined){
          this.formRecover.get('username').setValue(decodeURIComponent(this.queryDict['email']));
        }

        if(this.queryDict['code'] && this.queryDict['code']!==undefined){
          this.newPassword = true;
          this.formRecover.get('code').setValue(decodeURIComponent(this.queryDict['code']));
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

      ngOnInit(){
      }

    // On submit button click
    async onSubmit(value) {
      let body:any = {};
      body['username'] = this.formRecover.get('username').value;
      body['token'] = this.formRecover.get('code').value;
      await this.AuthService.logout();

      await new Promise(async function(resolve, reject) {
            await bcrypt.hash(value['password'], 10, (err, hash) => {
              body['password'] =  hash;
              resolve();
            });
        });
        this.ApiClientService.putAPIObject('user', body).then((response) =>{
          if(!response.errorMessage && response.state=='OK'){
            this.toastr.success(this.translate.instant("recover.tstrSuccessMsg"), this.translate.instant("general.success"));
            this.router.navigate(['/login'], { queryParams: { email: this.formRecover.get('username').value} });
          }else{
            this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
          }
        });
    }
    // On Forgot password link click
    toLogin() {
      this.router.navigate(['/login'], { queryParams: { email: this.formRecover.get('username').value} });
    }

    useLanguage(lang){
      this.selectedLang = lang;
      this.translate.use(lang);
      localStorage.setItem('sampleAppLang',lang);
    }


    changePwdType(){
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
    }

}
