import { FuncionesService } from '../../../utils/funciones.service';
import {
  Component,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {
  Procedure,
  TypeDocument,
  ModeloResponse,
} from '../../../models/notifications/notification';
import { SendNotification } from 'src/app/models/notifications/notification';
import { SendNotificationRequest } from 'src/app/models/notifications/notification-request';
import { NotificationService } from 'src/app/services/notification.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FileUploadValidators,
} from '@iplab/ngx-file-upload';
import {  } from 'src/app/shared/constantes';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MAX_TAM_FILES_10, LBL_ADD_FILES, LBL_ERROR_ONLY_FILE, LBL_ERROR_MAX_LENGTH_NAME, LBL_ERROR_MAX_SIZE_FILE, 
  MAXFILES, MAX_LENGTH_NAME_FILES, MIN_TAM_FILES, ResultSignature, LBL_FEATURES_FILE, LBL_ERROR_MAX_FILES } from '../../../shared/constantes';

declare var initInvoker: any;
declare var dispatchEventClient: any;
@Component({
  selector: 'app-nueva-notificacion',
  templateUrl: './new-notification.component.html',
  styleUrls: ['./new-notification.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewNotificationComponent implements OnInit {
  sendNotification: SendNotificationRequest = new SendNotificationRequest();
  notification: SendNotification = new SendNotification();
  Formulario: FormGroup;
  addressee: string = '';
  documentTypeSelected: string = '';
  maxlengthNumDoc: number;
  getMin: number;
  sectionOne: boolean = true;
  sectionTree: boolean = false;
  buttonNext: boolean = true;
  buttonSend: boolean = false;
  listProcedure: Procedure[];
  procedureSelected: string = '';
  procedureSelectedValue: string;
  inputDisabled: boolean = true;
  loading: boolean = false;
  disabledVal: boolean =  false;

  patt = new RegExp(/^([a-zA-Z0-9-_°. \/]+\s?)*$/);
  fm_expediente: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.patt),
    Validators.maxLength(100)
  ]);

  fm_message: FormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(1000)
  ]);

  fm_numerodoc: FormControl = new FormControl('', [
      Validators.required,
      this.validRep,
  ]);

  placeHolder = 'Ingrese número de documento';

  parametro: string;

  multiple: boolean = false;
  animation: boolean = true;

  uploadedFiles: Array<File> = [];
  errmaxLengthName: boolean = false;
  errmaxSizeFile: boolean = false;
  errminSizeFile: boolean = false;
  errorOnlyFile: boolean = false;
  errmaxFiles: boolean = false;
  errduplicate: boolean = false;
  maxFiles: number = MAXFILES;
  maxSizeFile: number = MAX_TAM_FILES_10;
  minSizeFile: number = MIN_TAM_FILES;
  maxLengthName: number = MAX_LENGTH_NAME_FILES;
  lblAddFiles: string = LBL_ADD_FILES;
  lblFeaturesFile: string = LBL_FEATURES_FILE;
  lblErrorOnlyFile: string = LBL_ERROR_ONLY_FILE;
  lblErrorMaxLengthName : string = LBL_ERROR_MAX_LENGTH_NAME;
  lblErrorMaxSizeFile: string = LBL_ERROR_MAX_SIZE_FILE;
  lblErrorMaxFiles: string = LBL_ERROR_MAX_FILES;

  modeloResponse: ModeloResponse;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private notificationService: NotificationService,
    private router: Router,
    private funcionesService: FuncionesService
  ) {}

  filesControl = new FormControl(null, [
    Validators.required,
    FileUploadValidators.accept(['.pdf', '.jpg', '.jpeg', '.png', '.bmp']),
    FileUploadValidators.filesLimit(this.maxFiles),
    FileUploadValidators.sizeRange({minSize: this.minSizeFile, maxSize: this.maxSizeFile}),
    this.noWhitespaceValidator,
  ]);

  private noWhitespaceValidator(control: FormControl) {
    if (control.value == null) return null;
    if (control.value.length == 0) return null;
    var str = control.value[0].name;
    var frags = str.split('.');
    var name = frags.splice(0, frags.length - 1).join('.');
    if (name.length > 100) {
      return { whitespace: true };
    }
    return null;
  }
  
  ngOnInit(): void {
    this.getProcedure();
    if(this.notificationService.openWindow.isStopped) this.notificationService.openWindow = new Subject<boolean>();
    if(this.notificationService.saveNotification.isStopped) this.notificationService.saveNotification = new Subject<boolean>();
    this.notificationService.saveNotification.subscribe(save => {
      if(save) {
        this.saveNotification();
      }
    });

    this.notificationService.openWindow.subscribe(open => {
      if(open) {
        dispatchEventClient('sendArguments', this.parametro);
      }
    });

    this.buildForm();
    this.validarFiles();
  }
  typeDocument: TypeDocument[] = [
    { id: '', value: 'Seleccione' },
    { id: 'dni', value: 'DNI' },
    { id: 'ce', value: 'Carnet de Extranjería' },
  ];

  buildForm() {
    this.Formulario = this.fb.group({
      fm_optiontipo: this.fb.control('', [Validators.required] ),
      fm_numerodoc: this.fm_numerodoc,
      fm_destinatario: this.fb.control({
        value: '',
        disabled: this.inputDisabled,
      }),
      fm_expediente: this.fm_expediente,
      fm_optionproc: this.fb.control('',
        [Validators.required]
      ),
      fm_message: this.fm_message,
      files: this.filesControl
    });
    this.getNumeroDocumento();
  }

  getNumeroDocumento() {
    this.fm_numerodoc.valueChanges.subscribe((documento) => {
      this.Formulario.controls['fm_destinatario'].setValue('');
    });
  }

  private validRep(control: FormControl) {
    if (control.value) {
      var re = new RegExp(/^(\d)\1{7,}$/);
      var matches = re.test(control.value);
      return !matches ? null : { invalidName: true };
    } else {
      return null;
    }
  }

  getProcedure() {
    this.notificationService.GetProcedure().subscribe(
      (res) => {
        if (res.success) {
          this.listProcedure = res.data.procedures;
          this.listProcedure.push({ code: '', value: 'Seleccione' });
        }
      },
      (err) => {
        console.log('Problemas del servicio', err);
      }
    );
  }

  baseName1 = (str) => {
    if (typeof str !== 'string') return;
    var frags = str.split('.');
    return frags.splice(0, frags.length - 1).join('.');
  };

  ConsultPerson() {
    this.Formulario.controls['fm_destinatario'].setValue('');
    if (this.Formulario.controls['fm_optiontipo'].value !== '') {
      let personRequest: any = {
        docType: this.Formulario.controls['fm_optiontipo'].value,
        doc: this.fm_numerodoc.value,
      };
      this.notificationService.ConsultPerson(personRequest).subscribe(
        (res) => {
          if (res.success) {
            this.Formulario.controls['fm_destinatario'].setValue(res.person);
            this.inputDisabled = this.Formulario.controls['fm_destinatario'].value !== '' ? false : true;
          } else {
            this.funcionesService.mensajeError(
              res.error.message + ' ' + this.fm_numerodoc.value
            );
            this.inputDisabled = true;
          }
        },
        (err) => {
          console.log('Problemas del servicio', err);
        }
      );
    } else {
      this.funcionesService.mensajeError(
        'Debe seleccionar un tipo de documento'
      );
    }
  }

  changeTypeDocument() {
    this.fm_numerodoc.setValue('');
    //this.notification.doc = '';
    //this.addressee = '';
    this.Formulario.controls['fm_destinatario'].setValue('');
    if (this.Formulario.controls['fm_optiontipo'].value === 'dni') {
      this.maxlengthNumDoc = 8;
      this.getMin = 8;
      this.placeHolder = 'Ingrese número de DNI';
    } else if (this.Formulario.controls['fm_optiontipo'].value === 'ce') {
      this.maxlengthNumDoc = 12;
      this.getMin = 8;
      this.placeHolder = 'Ingrese número de CE';
    }
  }

  changeProcedure(event) {
    this.procedureSelectedValue = event.source.triggerValue;
  }

  validarFiles() {
    this.Formulario.controls['files'].valueChanges.subscribe((file:[any]) => {
      this.errmaxFiles = file.length > this.maxFiles;
      if(file.length > 1) {
        let count = 0;
        for(let i = 0; i<file.length; i++) {
          let j = i+1;
          while(j<file.length){
            if(file[i].name == file[j].name) {
              count++;
              break;
            }
            j++;
          }
        }
        this.errduplicate = !(count == 0);
      } else this.errduplicate = false;
      this.errmaxLengthName = file.filter((x:File) => this.baseName(x.name).length > this.maxLengthName).length > 0;
      this.errorOnlyFile = file.filter((x:File) => !(x.name.endsWith('pdf') || x.name.endsWith('png') || x.name.endsWith('jpg') || x.name.endsWith('jpeg') || x.name.endsWith('bmp'))).length > 0;
      this.errminSizeFile = file.filter((x:File) => x.size == 0 ).length > 0;
      this.errmaxSizeFile = file.filter((x:File) => x.size > this.maxSizeFile).length > 0;
      if(this.errmaxLengthName) this.Formulario.get(`files`)?.setErrors({ errmaxLengthName: true });
      if(this.errduplicate) this.Formulario.get(`files`)?.setErrors({ errduplicate: true });
    });
  }

  NotificationSign() {
    this.disabledVal =  true;
    const formDataNotification = new FormData();
    formDataNotification.append('docType', this.Formulario.controls['fm_optiontipo'].value);
    formDataNotification.append('doc', this.fm_numerodoc.value);
    formDataNotification.append('name', this.Formulario.controls['fm_destinatario'].value);
    formDataNotification.append('expedient', this.Formulario.controls['fm_expediente'].value);
    formDataNotification.append('message', this.Formulario.controls['fm_message'].value);
      
    for (let index = 0; index < this.uploadedFiles.length; index++) {
      //var str1 = this.uploadedFiles[index].name.replace(/.([^.]*)$/, '.pdf');
      const tempFile = new File(
        [this.uploadedFiles[index]],
        this.uploadedFiles[index].name, //str1.replace(/[^a-zA-Z0-9\\.\\-]/g, '-'),
        {
          type: this.uploadedFiles[index].type.toLowerCase(),
        }
      );
      formDataNotification.append('file' + (index + 1), tempFile);
    }
    this.notificationService.GetNotificationSign(formDataNotification).subscribe((res) => {
          this.loading = false;
          if (res.success) {
            this.parametro = res.param;
            if (this.parametro.length > 0) {
              //initInvoker(ResultSignature.TypeEvenReniec);
              this.saveNotification();
            } else {
              this.funcionesService.mensajeError(
                'No hay data para envío invoker'
              );
              this.disabledVal =  false;
            }
          } else {
            this.funcionesService.mensajeError(res.error.message);
            this.disabledVal =  false;
          }
        },
        (err) => {
          this.loading = false;
          console.log('Problemas del servicio', err);
          this.disabledVal =  false;
        }
      );
  }

  saveNotification() {
    const formDataNotification = new FormData();
    formDataNotification.append('docType', this.Formulario.controls['fm_optiontipo'].value);
    formDataNotification.append('doc', this.fm_numerodoc.value);
    formDataNotification.append('name', this.Formulario.controls['fm_destinatario'].value);
    formDataNotification.append('expedient', this.Formulario.controls['fm_expediente'].value);
    formDataNotification.append('message', this.Formulario.controls['fm_message'].value);
    for (let index = 0; index < this.uploadedFiles.length; index++) {
      //var str1 = this.uploadedFiles[index].name.replace(/.([^.]*)$/, '.pdf');
      const tempFile = new File(
        [this.uploadedFiles[index]],
        this.uploadedFiles[index].name, //str1.replace(/[^a-zA-Z0-9\\.\\-]/g, '-'),
        {
          type: this.uploadedFiles[index].type.toLowerCase(),
        }
      );
      formDataNotification.append('file' + (index + 1), tempFile);
    }

    this.notificationService.SendNotification(formDataNotification).subscribe(
      (res) => {
        if (res.success) {
          this.clearData();
          this.funcionesService.mensajeOk(
            'Los datos de notificación fueron registrados con éxito',
            '/main/notificaciones',
            {textSearch: '', pageIndex: 1, pageSize: 5}
          );
        } else {
          this.funcionesService.mensajeError(res.error.message);
        }
      },
      (err) => {
        console.log('Problemas del servicio', err);
      }
    );
  }

  baseName(str) {
    if (typeof str !== 'string') return;
    var frags = str.split('.');
    return frags.splice(0, frags.length - 1).join('.');
  }

  validations(): ModeloResponse {
    var sizeAll = 0;
    var maxfilesize = 1048576 * 10;
    for (let i = 0; i < this.uploadedFiles.length; i++) {
      let fileSizeMb = this.uploadedFiles[i].size;
      sizeAll += fileSizeMb;
    }
    if (sizeAll > maxfilesize) {
      this.modeloResponse.success = false;
      this.modeloResponse.message = 'Los archivos pesan más de 10Mb';
      return this.modeloResponse;
    }

    this.modeloResponse.success = true;
    this.modeloResponse.message = '';
    return this.modeloResponse;
  }

  clearData() {
    this.notification = new SendNotification();
    this.Formulario.controls['fm_destinatario'].setValue('');
    this.uploadedFiles = undefined;
  }

  cancel() {
    if (this.buttonSend) {
      this.sectionOne = true;
      this.sectionTree = false;
      this.buttonNext = true;
      this.buttonSend = false;
    } else {
      this.router.navigate(['/main']);
    }
  }

  next() {
    this.sectionOne = false;
    this.sectionTree = true;
    this.buttonNext = false;
    this.buttonSend = true;
  }

  validar_campo(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onKeydown(event) {
    if (event.keyCode === 13) {
      return false;
    }
  }

  eShowError = (input, error = null) => {
    if (error.required != undefined) {
      return 'Campo Requerido';
    } else if (error.pattern != undefined) {
      return 'Formato no válido';
    } else if (error.fileSize != undefined) {
      return 'Archivo(s) con peso excedido';
    } else if (error.minlength != undefined) {
      return 'Se requiere '+error.minlength.requiredLength+ ' caracteres como minimo' ;
    } else {
      return 'Campo inválido';
    }
  };

  soloExpReg(idInput: string, inputForm: FormControl, e: any) {

    let inicio = this.renderer.selectRootElement(`#${idInput}`).selectionStart;
    let fin = this.renderer.selectRootElement(`#${idInput}`).selectionEnd;
    
    let value : string = inputForm.value != null ? inputForm.value : '';
    if (e.metaKey || e.ctrlKey) {
      return true;
    }
    if(inicio === 0 && e.key === ' ') return false;
    if(e.key === 'Enter') return false;
    
    inputForm.setValue(value.replace(/ {2,}/g, ' '));
    this.renderer.selectRootElement(`#${idInput}`).setSelectionRange(inicio, fin, 'none');
    if(idInput === 'expediente') return !!this.patt.test(e.key);
  }

  ngOnDestroy(): void {
    this.notificationService.openWindow.unsubscribe();
    this.notificationService.saveNotification.unsubscribe();
  }
}
