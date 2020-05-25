import { Injectable } from '@angular/core';
import { Router, CanActivate} from '@angular/router';
import { CurrentUserService } from '../services/currentUser.service';

@Injectable()
export class RoleGuard implements CanActivate {

    constructor(private router: Router, private CurrentUserService:CurrentUserService) {
    }

    async canActivate(){
      console.log("IN!")
        let userRole = await this.CurrentUserService.getUser();
        if(userRole['role'] == 'admin'){
          return true;
        }else{
          this.router.navigate(['/error']);
          return false;
        }
  }

}
