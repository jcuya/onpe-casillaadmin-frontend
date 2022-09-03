import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material/material.module';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { RandompagesComponent } from './pages/randompages/randompages.component';
import { NotificationsComponent } from './pages/main/notifications/notifications.component';
import { NewNotificationComponent } from './pages/main/new-notification/new-notification.component';
import { JwtInterceptor } from './utils/jwt-interceptor';
import { ErrorInterceptor } from './utils/error-interceptor';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { OperadorComponent } from './pages/main/operador/operador.component';
import { UsersComponent } from './pages/main/operador/users/users.component';
import { NewBoxComponent } from './pages/main/operador/new-box/new-box.component';
import { RecoveryPasswordComponent } from './pages/recovery-password/recovery-password.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NotificationDetalleComponent } from './pages/main/notification-detalle/notification-detalle.component';

import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { TrimDirective } from './directives/trim.directive';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ListBoxesComponent } from './pages/main/box/list-boxes/list-boxes.component';
import { env } from 'process';
import { environment } from 'src/environments/environment';
import { NgxTrimModule } from 'ngx-trim';
import { NewUserComponent } from './pages/main/user/new-user/new-user.component';
import { ViewBoxComponent } from './pages/main/operador/view-box/view-box.component';
import { AdminComponent } from './pages/main/admin/admin.component';
import { ColeccionesComponent } from './pages/main/admin/colecciones/colecciones.component';
import { PopFiltroComponent } from './pages/main/admin/colecciones/pop-filtro/pop-filtro.component';
import { CatalogComponent } from './pages/main/admin/catalog/catalog/catalog.component';
import { NewCatalogComponent } from './pages/main/admin/catalog/new-catalog/new-catalog.component';
import { SolicitudDetailComponent } from './pages/main/operador/solicitud-detail/solicitud-detail.component';
import { DatePipe } from '@angular/common';
import { SolicitudDetailValidComponent } from './pages/main/operador/solicitud-detail-valid/solicitud-detail-valid.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HeaderComponent,
    FooterComponent,
    RandompagesComponent,
    NotificationsComponent,
    NewNotificationComponent,
    NewPasswordComponent,
    OperadorComponent,
    UsersComponent,
    NewBoxComponent,
    RecoveryPasswordComponent,
    NotificationDetalleComponent,
    //TrimDirective,
    ListBoxesComponent,
    NewUserComponent,
    ViewBoxComponent,
    AdminComponent,
    ColeccionesComponent,
    PopFiltroComponent,
    CatalogComponent,
    NewCatalogComponent,
    SolicitudDetailComponent,
    SolicitudDetailValidComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    FileUploadModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatExpansionModule,
    RecaptchaModule, //this is the recaptcha main module
    RecaptchaFormsModule, //this is the module for form incase form validation
    RecaptchaV3Module,
    NgxTrimModule,
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.KeycodeCaptcha,
    },
  ],
  bootstrap: [AppComponent],

  entryComponents: [
    NewUserComponent,
    PopFiltroComponent,
    NewCatalogComponent,
    SolicitudDetailComponent
  ]
})
export class AppModule { }
