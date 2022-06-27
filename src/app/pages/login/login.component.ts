import { Component, OnInit } from '@angular/core';
import { UserLogin } from '../../models/UserLogin';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { MatRadioChange } from '@angular/material/radio';
import { ERROR_SERVER, MAXINTENT } from 'src/app/shared/constantes';
import {
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module,
  ReCaptchaV3Service,
} from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { VERSION_SISEN } from '../../shared/constantes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  version: string = VERSION_SISEN;
  sitekey = '';
  intent: number = 0;
  RequerdCaptcha: boolean = true;
  captchaView: boolean;
  mensaje: string = '';
  doctype = 'dni';
  getMaxLengthNumeroDocumento: number = 8;
  getMin: number = 8;
  placeHolder: string = 'Número de DNI';
  cont: boolean = true;
  TOkenCaptcha: string = '';
  Formulario: FormGroup;
  RequestUser: UserLogin = new UserLogin();
  load: boolean = false;
  public formModel: any = {};
  hide: boolean = true;

  constructor(
    private fb: FormBuilder,
    private securityService: SeguridadService,
    private router: Router,
    private route: ActivatedRoute,
    private reCaptchaV3Service: ReCaptchaV3Service
  ) {
    this.sitekey =  environment.KeycodeCaptcha;
  }

  ngOnInit(): void {
    this.Formulario = this.fb.group({
      fm_option: this.fb.control('1'),
      fm_usuario: this.fb.control('', [Validators.pattern('^[0-9]+$')]),
      fm_pass: this.fb.control('', [Validators.required]),
      recaptchaReactive: this.fb.control(''),
    });
    if (this.securityService.isAuthenticatedTemp()) {
      sessionStorage.removeItem('accessTemp');
    }
    if (this.securityService.isAuthenticated) {
      this.setMenuOption();
    }
  }

  radioChange($event: MatRadioChange) {
    this.Formulario.get('fm_usuario').setValue('');
    this.Formulario.get('fm_pass').setValue('');
    const tipodoc = $event.value;

    if (tipodoc === '1') {
      this.doctype = 'dni';
      this.placeHolder = 'Número de DNI';
      this.getMaxLengthNumeroDocumento = 8;
      this.getMin = 8;
    } else if (tipodoc === '2') {
      this.doctype = 'ce';
      this.placeHolder = 'Número de CE';
      this.getMaxLengthNumeroDocumento = 12;
      this.getMin = 8;
    }
  }

  formInvalid(control: string) {
    return (
      this.Formulario.get(control).invalid &&
      (this.Formulario.get(control).dirty ||
        this.Formulario.get(control).touched)
    );
  }

  loginInit = async () => {
    this.load = true;
    var validate = await this.executeAction('homeLogin');
    if (validate) {
      this.mensaje = '';
      this.RequestUser.docType = CryptoJS.AES.encrypt(this.doctype, environment.SECRET_KEY).toString();
      this.RequestUser.doc = CryptoJS.AES.encrypt(this.Formulario.controls['fm_usuario'].value, environment.SECRET_KEY).toString();
      this.RequestUser.password = CryptoJS.AES.encrypt(this.Formulario.controls['fm_pass'].value, environment.SECRET_KEY).toString();
      this.RequestUser.recaptcha = this.TOkenCaptcha;

      this.securityService.GetLogin<any>(this.RequestUser).subscribe(
        (data) => {
          this.load = false;
          if (data.success) {
            if (data.updated_password) {
              sessionStorage.setItem('accessToken', data.token);
              //this.router.navigate(['/main']);
              this.setMenuOption();
            } else {
              sessionStorage.setItem('accessTemp', data.token);
              this.router.navigate(['/nueva-contrasena']);
            }
          } else {
            this.formModel.captcha = '';
            this.intent++;
            if (this.intent >= MAXINTENT) {
              this.RequerdCaptcha = true;
            }
            this.mensaje = data.error.message;
          }
        },
        (error) => {
          this.load = false;
          this.mensaje = ERROR_SERVER;
        }
      );
    }
  };

  setMenuOption() {
    this.router.navigate(['/main']);
  }

  forgetpass() {
    this.router.navigate(['/recuperar-contrasena']);
  }

  validar_campo(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  resolved(captchaResponse: string) {
    this.TOkenCaptcha = captchaResponse;
  }
  onloadGuia = async () => {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/documentos/Procedimiento.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  public recentToken = '';
  public recentError?: { error: any };
  private singleExecutionSubscription: Subscription;
  private executeAction = async (action: string) => {
    return new Promise((resolve) => {
      if (this.singleExecutionSubscription) {
        this.singleExecutionSubscription.unsubscribe();
      }
      this.singleExecutionSubscription = this.reCaptchaV3Service
        .execute(action)
        .subscribe(
          (token) => {
            this.recentToken = token;
            this.recentError = undefined;
            this.TOkenCaptcha = token;
            resolve(true);
          },
          (error) => {
            this.recentToken = '';
            this.TOkenCaptcha = '';
            this.recentError = { error };
            resolve(false);
          }
        );
    });
  };

  eShowError = (input, error = null) => {
    if (error.required != undefined) {
      return 'Ingrese su documento de identidad';
    } else if (error.pattern != undefined) {
      return 'Formato no válido';
    } else if (error.minlength != undefined) {
      return 'Se requiere '+error.minlength.requiredLength+ ' caracteres como mínimo' ;
    } else {
      return 'Campo inválido';
    }
  };
}
