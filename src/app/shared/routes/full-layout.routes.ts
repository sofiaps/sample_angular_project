import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from './role.guard';

//Route for content layout with sidebar, navbar and footer.

export const Full_ROUTES: Routes = [
  {
    path: 'user-settings', data: ['User Settings'],
    loadChildren: () => import('../../pages/user-settings/user-settings.module').then(m => m.UserSettingsModule)
  },
  {
    path: 'tasks', data: ['Tasks'],
    loadChildren: () => import('../../pages/tasks/tasks.module').then(m => m.TasksModule)
    // canActivate: [RoleGuard]
  },
  {
    path: 'chat', data: ['Chat'],
    loadChildren: () => import('../../pages/chat/chat.module').then(m => m.ChatModule)
    // canActivate: [RoleGuard]
  },
  {
    path: 'files', data: ['Files'],
    loadChildren: () => import('../../pages/files/files.module').then(m => m.FilesModule)
  }
];
