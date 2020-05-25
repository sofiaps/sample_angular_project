import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  // {
  //   path: 'error',component: ErrorPageComponent,
  //   data: {
  //     title: 'Error Page'
  //   }
  // },
  // {
  //   path: 'login',component: LoginPageComponent,
  //   data: {
  //     title: 'Login Page'
  //   }
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
