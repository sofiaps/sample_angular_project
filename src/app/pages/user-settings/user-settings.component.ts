import { Component, OnInit } from '@angular/core';
import { ApiClientService } from '../../shared/services/ApiClient.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ViewChild, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ValidateNotEmpty } from '../../shared/validators/empty.validator';
import { ValidateWhiteSpace } from '../../shared/validators/white-space.validator';
import { TranslateService } from '@ngx-translate/core';
const bcrypt = require('bcryptjs');
import { CurrentUserService } from '../../shared/services/currentUser.service';
import { Router, ActivatedRoute } from "@angular/router";


@Component({
  selector: 'app-users',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {

public newPassword: FormGroup;
public currentUser: any;
public currentUserString: any;
public showPwd = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ApiClientService: ApiClientService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    private CurrentUserService:CurrentUserService
  ) {

    this.currentUser = this.CurrentUserService.getUser();
    this.currentUserString = JSON.stringify(this.currentUser);

    let password = new FormControl('', [ValidateWhiteSpace]);
    let certainPassword = new FormControl('', CustomValidators.equalTo(password));
      this.newPassword = this.formBuilder.group({
        password:password,
        repeatPwd:certainPassword,
        username:[null,[Validators.required, CustomValidators.email]],
        name:[null, [Validators.required, ValidateNotEmpty]]
      });

      this.newPassword.controls['username'].setValue(this.currentUser['username']);
      this.newPassword.controls['name'].setValue(this.currentUser['name']);
  }


  ngOnInit(){
  }

  async submitPwd(value){
    let body:any = {};
    body['id'] = this.currentUser['id'];
    body['updateSelf']=true;
    body['data']={};
    let initUser = JSON.parse(this.currentUserString)
    if(initUser['username']!==value['username']){
      body['data']['username'] = value['username'];
    }
    if(initUser['name']!==value['name']){
      body['data']['name'] = value['name'];
    }

    if(value['password'] && value['password']!==""){
      await bcrypt.hash(value['password'], 10, (err, hash) => {
        body['data']['password'] = hash;

        this.ApiClientService.putAPIObject('user', body).then((response) =>{
          if(!response.errorMessage && response.state=='OK'){
            let keys = Object.keys(response.body);
            for(let key of keys){
              this.currentUser[key] = response.body[key];
            }
            this.CurrentUserService.setUser(this.currentUser);
            this.toastr.success(this.translate.instant("general.editSuccess"), this.translate.instant("general.success"));
            this.router.navigate(['']);
          }else{
            if(!response.errorMessage && response.state=='User already exists'){
              this.toastr.warning(this.translate.instant("user.usrTstrWrn"), this.translate.instant("general.warning"));
            }else{
              this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
            }
          }
        });
     });
   }else{
     if(initUser['name']==value['name'] && initUser['username']==value['username']){
       this.toastr.warning(this.translate.instant("general.noChanges"), this.translate.instant("general.warning"));
     }else{
       this.ApiClientService.putAPIObject('user', body).then((response) =>{
         if(!response.errorMessage && response.state=='OK'){
           let keys = Object.keys(response.body);
           for(let key of keys){
             this.currentUser[key] = response.body[key];
           }
           this.CurrentUserService.setUser(this.currentUser);
           this.toastr.success(this.translate.instant("general.editSuccess"), this.translate.instant("general.success"));
           this.router.navigate(['']);
         }else{
           if(!response.errorMessage && response.state=='User already exists'){
             this.toastr.warning(this.translate.instant("user.usrTstrWrn"), this.translate.instant("general.warning"));
           }else{
             this.toastr.error(this.translate.instant("general.tstrErrorMsg"), this.translate.instant("general.error"));
           }
         }
       });
     }
   }
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
