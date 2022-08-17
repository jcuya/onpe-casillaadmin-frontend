import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { mainModule } from 'process';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './utils/auth-guard';
import { AuthGuardTemp } from './utils/auth-temp';
import { NewNotificationComponent } from './pages/main/new-notification/new-notification.component';

import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { MainComponent } from './pages/main/main.component';
import { RandompagesComponent } from './pages/randompages/randompages.component';
import { NotificationsComponent } from './pages/main/notifications/notifications.component';
import { OperadorComponent } from './pages/main/operador/operador.component';
import { UsersComponent } from './pages/main/operador/users/users.component';
import { NewBoxComponent } from './pages/main/operador/new-box/new-box.component';
import { RecoveryPasswordComponent } from './pages/recovery-password/recovery-password.component';
import { NotificationDetalleComponent } from './pages/main/notification-detalle/notification-detalle.component';
import { ViewBoxComponent } from './pages/main/operador/view-box/view-box.component';
import { AdminComponent } from './pages/main/admin/admin.component';
import { ColeccionesComponent } from './pages/main/admin/colecciones/colecciones.component';
import { CatalogComponent } from './pages/main/admin/catalog/catalog/catalog.component';
import { SolicitudDetailComponent } from './pages/main/operador/solicitud-detail/solicitud-detail.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'nueva-contrasena',
    canActivate: [AuthGuardTemp],
    component: NewPasswordComponent,
  },
  { path: 'recuperar-contrasena', component: RecoveryPasswordComponent },
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'main/admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
      },
      {
        path: 'main/admin',
        component: AdminComponent,
        children: [
          {
            path: 'colecciones',
            component: ColeccionesComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: '',
        component: RandompagesComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
      },
      {
        path: 'main/randompages',
        component: RandompagesComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
      },
      {
        path: 'main/notificaciones',
        component: NotificationsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'main/nueva-notificacion',
        component: NewNotificationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'main/notificaciones-detalle/:id',
        component: NotificationDetalleComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'main/list-boxes',
        component: UsersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'main/view-box/:id',
        component: ViewBoxComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'main/admin',
        component: OperadorComponent,
        children: [
          {
            path: 'usuarios',
            component: UsersComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'main/admin',
        component: OperadorComponent,
        children: [
          {
            path: 'catalog',
            component: CatalogComponent,
            canActivate: [AuthGuard],
          },
        ],
      },

      {
        path: 'main/operador',
        component: OperadorComponent,
        children: [
          {
            path: 'usuarios',
            component: UsersComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'nueva-casilla',
            component: NewBoxComponent,
            canActivate: [AuthGuard],
          }, 
          {
            path: 'solicitud-detalle/:id',
            component: SolicitudDetailComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true ,onSameUrlNavigation : 'reload'})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
