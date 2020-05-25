import { RouteInfo } from './sidebar.metadata';

//Sidebar menu Routes and data
export const ROUTES: RouteInfo[] = [
  { path: '/user-settings', title: 'Profile', icon: 'ft-users', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
  { path: '/tasks', title: 'Tasks', icon: 'icon-pin', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
  { path: '/chat', title: 'Chat', icon: 'ft-message-circle', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
  { path: '/files', title: 'Files', icon: 'ft-file-text', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
];
