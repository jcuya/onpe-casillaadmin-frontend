import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TypeDocument } from 'src/app/models/notifications/notification';
import { Box, TypeAccreditation } from 'src/app/models/users/user';
import { BoxRequest } from 'src/app/models/users/user-request';
import { UserService } from 'src/app/services/user.service';
import { FuncionesService } from 'src/app/utils/funciones.service';
import {
  FileUploadControl,
  FileUploadValidators,
} from '@iplab/ngx-file-upload';
import { Profile } from 'src/app/transversal/enums/global.enum';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { LBL_ADD_FILES, LBL_ERROR_MAX_LENGTH_NAME, LBL_ERROR_ONLY_FILE, LBL_FEATURES_FILE, MAXFILES, MAX_LENGTH_NAME_FILES, MAX_TAM_FILES_10, MIN_TAM_FILES, 
  LBL_ERROR_MAX_SIZE_FILE, LBL_ERROR_MAX_FILES } from '../../../../shared/constantes';

interface Filtro {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-nueva-casilla',
  templateUrl: './new-box.component.html',
  styleUrls: ['./new-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewBoxComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  load: boolean = false;
  boxRequest: BoxRequest = new BoxRequest();
  box: Box = new Box();
  typeAccreditationSelected: string = '';
  name: string = '';
  documentTypeSelected: string = '';
  documentTypeSelectedRep: string = '';
  maxlengthNumDoc: number;
  minlengthNumDoc: number;
  maxlengthNumDocRep: number;
  minlengthNumDocRep: number;
  listTypeAcreditation: TypeAccreditation[];
  inputDisabled: boolean = false;
  placeHolder = 'Ingrese número ';
  Formulario: FormGroup;
  nombres: FormControl = new FormControl({ value: '', disabled: this.inputDisabled });
  apPaterno: FormControl = new FormControl({ value: '', disabled: this.inputDisabled });
  apMaterno: FormControl = new FormControl({ value: '', disabled: this.inputDisabled });
  fm_direccion: FormControl = new FormControl({ value: '', disabled: this.inputDisabled }, [Validators.required, Validators.minLength(9)]);
  fm_correo: FormControl = new FormControl({ value: '', disabled: this.inputDisabled }, [Validators.required, Validators.pattern('[a-zA-Z0-9.+-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')]);
  fm_organizacion: FormControl = new FormControl({value: '', disabled: this.inputDisabled},[]);
  
  fileLoad: any;
  public fileToUpload: File;
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

  existData = true;
  typeDocument: TypeDocument[] = [
    { id: 'dni', value: 'DNI' },
    { id: 'ce', value: 'Carnet de Extranjería' },
    { id: 'ruc', value: 'RUC' },
  ];
  typeDocument2: TypeDocument[] = [
    { id: 'dni', value: 'DNI' },
    { id: 'ce', value: 'Carnet de Extranjería' },
  ];

  isCE: boolean = false;
  isCERep: boolean = false;
  lblNombre: string = 'Nombres';
  lblApPat: string = 'Apellido paterno';
  lblApMat: string = 'Apellido materno';

  constructor(
    private userService: UserService,
    private funcionesService: FuncionesService,
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getTypeAcreditacion();
    this.validarFiles();
  }

  ///----------------------------
  private buildForm = () => {
    this.Formulario = this.fb.group({
      fm_optiontipo: this.fb.control(
        {
          value: '',
          disabled: this.inputDisabled,
        },
        [Validators.required]
      ),
      fm_optiontipo_rep: this.fb.control(
        {
          value: '',
          disabled: this.inputDisabled,
        },
        [Validators.required]
      ),
      fm_razon_social: this.fb.control(
        {
          value: '',
          disabled: this.inputDisabled,
        },
        [Validators.required]
      ),
      fm_organizacion: this.fm_organizacion,
      fm_numerodoc: this.fb.control('', [
        Validators.required,
        //Validators.pattern('^[0-9]+$'),
        //this.validRep,
      ]),
      fm_numerodoc_rep: this.fb.control('', [
        Validators.required,
        //Validators.pattern('^[0-9]+$'),
        //this.validRep,
      ]),
      nombres: this.nombres,
      apPaterno: this.apPaterno,
      apMaterno: this.apMaterno,
      fm_correo: this.fm_correo,    
      fm_celular: this.fb.control({ value: '', disabled: this.inputDisabled }, [
        Validators.required,
        Validators.minLength(9),
        this.validatorRepeatMovil,
      ]),
      fm_fijo: this.fb.control({ value: '', disabled: this.inputDisabled }, [
        // Validators.required,
        this.validatorRepeatFijo,
        Validators.pattern('^(?=.*).{7,}$'),
      ]),
      fm_direccion: this.fm_direccion,
      fm_optiontacreditacion: this.fb.control(
        {
          value: '',
          disabled: this.inputDisabled,
        },
        [Validators.required]
      ),
      files: this.filesControl,
    });

    this.getNumeroDocumento();
    this.getNumeroDocumentoRep();
  };
  private eResetForm = (level: number) => {
    this.nombres.setValue('');
    this.apPaterno.setValue('');
    this.apMaterno.setValue('');
    this.Formulario.get('fm_numerodoc_rep').setValue('');
    if (level == 6) return;
    this.Formulario.get('fm_razon_social').setValue('');
    this.Formulario.get('fm_optiontipo_rep').setValue(null);
    this.fm_organizacion.setValue('');
    this.Formulario.get('fm_numerodoc').setValue('');
    if (level == 5) return;
  };

  eChangeDocumento(event) {
    this.eResetForm(5);
    this.existData = true;
    this.documentTypeSelected = event.value;
    this.isCE = this.documentTypeSelected === 'ce';
    if (this.documentTypeSelected === 'dni') {
      this.minlengthNumDoc = 8;
      this.maxlengthNumDoc = 8;
      this.changeLabelRequired(false);
      this.eChangeType(false);
      this.eChangeRequired(false);
    } else if (this.documentTypeSelected === 'ce') {
      this.minlengthNumDoc = 9;
      this.maxlengthNumDoc = 12;
      this.changeLabelRequired(true);
      this.eChangeType(true);
      this.eChangeRequired(false);
    } else if (this.documentTypeSelected === 'ruc') {
      this.minlengthNumDoc = 11;
      this.maxlengthNumDoc = 11;
      this.changeLabelRequired(false);
      this.eChangeType(false);
      this.eChangeRequired(true);
    }
  }

  changeLabelRequired(required: boolean) {
    if(required) {
      this.lblNombre = "Nombres*";
      //this.lblApPat = "Apellido paterno*";
      //this.lblApMat = "Apellido materno*";
    } else {
      this.lblNombre = "Nombres";
      //this.lblApPat = "Apellido paterno";
      //this.lblApMat = "Apellido materno";
    }
  }
  
  eChangeDocumentoRep(event) {
    this.eResetForm(6);
    this.existData = true;
    this.documentTypeSelectedRep = event.value;
    this.isCERep = this.documentTypeSelectedRep === 'ce';
    if (this.documentTypeSelectedRep === 'dni') {
      this.minlengthNumDocRep = 8;
      this.maxlengthNumDocRep = 8;
      this.changeLabelRequired(false);
      this.eChangeType(false);
      //this.eChangeRequired(false);
    } else if (this.documentTypeSelectedRep === 'ce') {
      this.minlengthNumDocRep = 9;
      this.maxlengthNumDocRep = 12;
      this.changeLabelRequired(true);
      this.eChangeType(true);
      //this.eChangeRequired(false);
    }
  }

  getNumeroDocumento() {
    this.Formulario.get('fm_numerodoc').valueChanges.subscribe((documento) => {
      if(this.documentTypeSelected == 'dni') {
        if(documento.length == this.minlengthNumDoc){
          this.eSearch('general');
        }
        else {
          this.nombres.setValue('');
          this.apPaterno.setValue('');
          this.apMaterno.setValue('');
        }
      }
      else if(this.documentTypeSelected == 'ruc') {
        if(documento.length == this.minlengthNumDoc){
          this.eSearch('general');
        }
        else {
          this.Formulario.get('fm_razon_social').setValue('');
        }
      }
      else if(this.documentTypeSelected == 'ce') {
        this.existData = true;
        this.nombres.setValue('');
        this.apPaterno.setValue('');
        this.apMaterno.setValue('');
      }
    });
  }

  getNumeroDocumentoRep() {
    this.Formulario.get('fm_numerodoc_rep').valueChanges.subscribe((documento) => {
      if(this.documentTypeSelectedRep == 'dni') {
        if(documento.length == this.minlengthNumDocRep){
          this.eSearch('representante');
        }
        else {
          this.nombres.setValue('');
          this.apPaterno.setValue('');
          this.apMaterno.setValue('');
        }
      }
      else if(this.documentTypeSelectedRep == 'ruc') {
        if(documento.length == this.minlengthNumDocRep){
          this.eSearch('representante');
        }
      }
      else if(this.documentTypeSelectedRep == 'ce') {
        this.existData = true;
        this.nombres.setValue('');
        this.apPaterno.setValue('');
        this.apMaterno.setValue('');
      }
    });
  }

  private eChangeType = (status) => {
    let required = status ? [
          Validators.required,
          Validators.pattern(
            "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$"
          ),
        ] : null;

    let required2 = status ? [
          Validators.pattern(
            "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$"
          ),
        ] : null;

    this.nombres.setErrors(null);
    this.apPaterno.setErrors(null);
    this.apMaterno.setErrors(null);

    this.nombres.setValidators(required);
    this.apPaterno.setValidators(required2);
    this.apMaterno.setValidators(required2);

    this.nombres.updateValueAndValidity();
    this.apPaterno.updateValueAndValidity();
    this.apMaterno.updateValueAndValidity();
  }

  private eChangeRequired = (status) => {
    var required = status ? [Validators.required] : null;
    var required2 = status ? [Validators.required, this.validRep] : null;
    
    const a1 = this.Formulario.get('fm_optiontipo_rep');
    const a2 = this.Formulario.get('fm_numerodoc_rep');
    const a3 = this.Formulario.get('fm_razon_social');
    
    a1.setErrors(null);
    a2.setErrors(null);
    a3.setErrors(null);
    
    a1.setValidators(required);
    a2.setValidators(required2);
    a3.setValidators(required);
    
    a1.updateValueAndValidity();
    a2.updateValueAndValidity();
    a3.updateValueAndValidity();
  };

  eSearch = async (type: string) => {
    switch (type) {
      case 'general':
        var res = await this.validDocument(type);
        if (res) this.eSearchDocument(type);
        break;
      case 'representante':
        var res = await this.validDocument(type);
        if (res) this.eSearchDocument(type);
        break;
      default:
        break;
    }
  };
  buildLabel = (name: string) => {
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    switch (name) {
      case 'fm_numerodoc':
        if (esRuc) return 'Número de RUC*';
        return 'Número de documento*';
    }
  };
  buildHolder = (name: string) => {
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    switch (name) {
      case 'fm_numerodoc':
        if (esRuc) return 'Ingrese el número de RUC';
        return 'Ingrese el número de documento';
    }
  };
  buildHide = (name: string) => {
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    switch (name) {
      case 'fm_razon_social':
        if (esRuc) return true;
        return false;
      case 'fm_optiontipo_rep':
        if (esRuc) return true;
        return false;
      case 'fm_numerodoc_rep':
        if (esRuc) return true;
        return false;
      case 'fm_organizacion':
        if (esRuc) return false;
        return true;
    }
  };
  private buildError = (message: string) => {
    this.funcionesService.mensajeError(message);
  };
  private buildInfo = (message: string) => {
    this.funcionesService.mensajeInfo(message);
  }
  private validDocument = async (type: string) => {
    var isGeneral = type == 'general';
    var isRepresentante = type == 'representante';
    if (!this.Formulario.controls['fm_optiontipo'].valid && isGeneral) {
      this.buildError('Debe seleccionar un tipo de documento');
      return false;
    }
    if (!this.Formulario.controls['fm_numerodoc'].valid && isGeneral) {
      this.buildError('Debe ingresar un número correcto');
      return false;
    }
    if (
      !this.Formulario.controls['fm_optiontipo_rep'].valid &&
      isRepresentante
    ) {
      this.buildError('Debe seleccionar un tipo de documento Representante');
      return false;
    }
    if (
      !this.Formulario.controls['fm_numerodoc_rep'].valid &&
      isRepresentante
    ) {
      this.buildError('Debe ingresar un número correcto Representante');
      return false;
    }
    return true;
  };
  private eSearchDocument = async (type: string) => {
    var tipo = '';
    var doc = '';
    this.load = true;
    if (type == 'general') {
      tipo = this.Formulario.controls['fm_optiontipo'].value;
      doc = this.Formulario.controls['fm_numerodoc'].value;
    }
    if (type == 'representante') {
      tipo = this.Formulario.controls['fm_optiontipo_rep'].value;
      doc = this.Formulario.controls['fm_numerodoc_rep'].value;
    }
    var userExist = await this.consultaCasilla(doc, tipo);

    if(!userExist){
      this.buildError('El documento ingresado ya se encuentra registrado');
      this.load = false;
      return;
    }
    var response = null;
    var message = 'No se encontró los datos del documento.';
    switch (tipo) {
      case 'ruc':
        response = await this.consultaSunat(doc);
        message = 'El RUC ' + doc + ' no ha sido encontrado';
        break;
      case 'ce':
        response = await this.consultaExtranjeria(doc, tipo);
        message =
          'Por favor ingrese los datos del CE ' + doc;
        break;
      case 'dni':
        response = await this.consultaReniec(doc, type);
        message =
          'El DNI ' + doc + ' no ha sido encontrado en el padrón';
        break;
      default:
        break;
    }
    this.load = false;
    if (response) {
      this.existData = true;
    } else {
      if(tipo == 'ce') {
        this.buildInfo(message);
        this.existData = false;
        this.nombres.setValue('');
        this.apPaterno.setValue('');
        this.apMaterno.setValue('');
      }
      else this.buildError(message);
    }
  };
  private consultaReniec = (doc: string, type: string) => {
    return new Promise<boolean>((resolve) => {
      this.userService.ConsultaReniec(doc).subscribe(
        (resp: any) => {
          if (resp) {
            if(resp.nombres == null && resp.appat == null && resp.apmat == null) resolve(false);
            else {
              this.nombres.setValue(resp.nombres);
              this.apPaterno.setValue(resp.appat != null ? resp.appat: "");
              this.apMaterno.setValue(resp.apmat != null ? resp.apmat: "");
              resolve(true);
            }
          } else {
            resolve(false);
          }
        },
        (error) => {
          resolve(false);
        }
      );
    });
  };
  private consultaSunat = (doc: string) => {
    return new Promise<boolean>((resolve) => {
      this.userService.ConsultaSunat(doc).subscribe(
        (resp) => {
          if (resp) {
            if (resp.list.multiRef.ddp_nombre.$ != undefined) {
              var razon = `${resp.list.multiRef.ddp_nombre.$}`;
              this.Formulario.get('fm_razon_social').setValue(razon);
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        },
        (error) => {
          resolve(false);
        }
      );
    });
  };
  private consultaClaridad = (doc: string) => {
    return new Promise<boolean>((resolve) => {
      resolve(false);
    });
  };
  private consultaExtranjeria = (doc: string, type:string) => {
    return new Promise<boolean>((resolve) => {
      this.userService.ConsultaCE(doc, type).subscribe(
        (resp) => {
          if (resp.success) {
            this.nombres.setValue(resp.name);
            this.apPaterno.setValue(resp.lastname != null ? resp.lastname: "");
            this.apMaterno.setValue(resp.second_lastname != null ? resp.second_lastname: "");
            resolve(true);
          } else {
            resolve(false);
          }
        },
        (error) => {
          resolve(false);
        }
      )
    });
  };
  private consultaCasilla = (doc: string, type:string) => {
    return new Promise<boolean>((resolve) => {
      this.userService.ConsultaCasilla(doc, type).subscribe(
        (resp) => {
          if (resp.success) {
            resolve(true);  
          }else{
            resolve(false);
          }
        },
        (error) => {
          resolve(false);
        }
      );
    });
  };  
  //----------------------------

  filesControl = new FormControl(null, [
    Validators.required,
    FileUploadValidators.accept(['.pdf', '.jpg', '.jpeg', '.png', '.bmp']),
    FileUploadValidators.filesLimit(this.maxFiles),
    FileUploadValidators.sizeRange({minSize: this.minSizeFile, maxSize: this.maxSizeFile}),
    this.noWhitespaceValidator,
  ]);
  
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

  private noWhitespaceValidator(control: FormControl) {
    if (control.value == null) return null;
    if (control.value.length == 0) return null;

    for (let index = 0; index < control.value.length; index++) {
      const str = control.value[index].name;
      var frags = str.split('.');
      var name = frags.splice(0, frags.length - 1).join('.');
      if (name.length > 100) {
        return { whitespace: true };
      }
    }
    return null;
  }

  getTypeAcreditacion() {
    this.userService.GetTypeAcreditation().subscribe(
      (res) => {
        if (res.success) {
          this.listTypeAcreditation = res.data.acreditationTypes;
          //this.listTypeAcreditation.push({ code: '', value: 'Seleccione' });
        }
      },
      (err) => {
        console.log('Problemas del servicio', err);
      }
    );
  }

  changeTypeDocument(event) {
    this.documentTypeSelected = event.value;
    this.box.doc = '';
    this.name = '';
    if (this.documentTypeSelected === 'dni') {
      this.maxlengthNumDoc = 8;
      this.placeHolder = 'Ingrese número de DNI';
    } else if (this.documentTypeSelected === 'ce') {
      this.maxlengthNumDoc = 12;
      this.placeHolder = 'Ingrese número de CE';
    } else if (this.documentTypeSelected === 'ruc') {
      this.maxlengthNumDoc = 12;
      this.placeHolder = 'Ingrese número de RUC';
    }
  }
  formInvalid(control: string) {
    return (
      this.Formulario.get(control).invalid &&
      (this.Formulario.get(control).dirty ||
        this.Formulario.get(control).touched)
    );
  }

  ConsultPerson() {
    this.name = '';
    if (this.documentTypeSelected === '') {
      this.funcionesService.mensajeError(
        'Debe seleccionar un tipo de documento'
      );
      return;
    }
    if (this.Formulario.controls['fm_numerodoc'].value === '') {
      this.funcionesService.mensajeError('Debe ingresar un número');
      return;
    }

    let personRequest: any = {
      docType: this.documentTypeSelected,
      doc: this.Formulario.controls['fm_numerodoc'].value,
    };
    this.userService.ConsultPerson(personRequest).subscribe(
      (res) => {
        if (res.success) {
          this.name = res.person.name;
          this.inputDisabled = false;
          this.enableForm();
        } else {
          this.funcionesService.mensajeError(
            res.error.message + ' ' + this.box.doc
          );
          this.inputDisabled = true;
        }
      },
      (err) => {
        console.log('Problemas del servicio', err);
      }
    );
  }

  enableForm() {
    this.fm_correo.enable();
    this.Formulario.get('fm_celular').enable();
    this.Formulario.get('fm_fijo').enable();
    this.fm_direccion.enable();
  }

  baseName(str) {
    if (typeof str !== 'string') return;
    var frags = str.split('.');
    return frags.splice(0, frags.length - 1).join('.');
  }

  fileUploadchange(fileInput: any) {
    this.fileToUpload = <File>fileInput.target.files[0];
    if (this.baseName(this.fileToUpload.name).length > 100) {
      this.funcionesService.mensajeError(
        'El nombre del archivo debe tener un máximo de 100 caracteres'
      );
      fileInput.target.value = '';
      return;
    }

    if (this.fileToUpload.type != 'application/pdf') {
      this.funcionesService.mensajeError('El archivo debe ser un PDF');
      fileInput.target.value = '';
      return;
    }

    let fileSizeMb = 0;

    if (this.fileToUpload != undefined) {
      fileSizeMb = fileInput.target.files[0].size / 1024;
    }

    if (fileSizeMb < 272) {
      if (fileInput.target.id === 'pdf_creation_solicitude') {
        this.box.pdf_creation_solicitude = this.fileToUpload;
      } else if (fileInput.target.id === 'pdf_resolution') {
        this.box.pdf_resolution = this.fileToUpload;
      } else if (fileInput.target.id === 'pdf_agree_tos') {
        this.box.pdf_agree_tos = this.fileToUpload;
      } else if (fileInput.target.id === 'pdf_terminos') {
        this.box.pdf_terminos = this.fileToUpload;
      }
    } else {
      this.funcionesService.mensajeError(
        'El archivo no debe ser mayor a 272 Kb'
      );
      fileInput.target.value = '';
    }
  }

  submit = () => {
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    if (!this.Formulario.valid) return;

    const fd = new FormData();
    // validamos si elegio DNI o CE
    if(this.apPaterno.value == '' && this.apMaterno.value == '') {
      let message: string = `Debe ingresar al menos un apellido`;
      this.funcionesService.mensajeError(message.toUpperCase());
      return;
    }
    if(this.nombres.value == '' && this.apPaterno.value == '' && this.apMaterno.value == '') {
      let message: string = `Número de documento no válido, se debe registrar nombre(s) y apellido(s)`;
      this.funcionesService.mensajeError(message.toUpperCase());
      return;
    }

    //usuario
    fd.append('user_doc_type', this.Formulario.controls['fm_optiontipo'].value);
    fd.append('user_doc', this.Formulario.controls['fm_numerodoc'].value);
    fd.append('user_rep_doc_type', esRuc ? this.Formulario.controls['fm_optiontipo_rep'].value : null);
    fd.append('user_rep_doc', esRuc ? this.Formulario.controls['fm_numerodoc_rep'].value : null);      
    fd.append('user_name', this.nombres.value);
    fd.append('user_lastname', this.apPaterno.value);
    fd.append('user_second_lastname',this.apMaterno.value);
    fd.append('user_email', this.fm_correo.value);
    fd.append('user_cellphone', this.Formulario.controls['fm_celular'].value);
    fd.append('user_phone', this.Formulario.controls['fm_fijo'].value);
    fd.append('user_address', this.fm_direccion.value);
    fd.append('user_acreditation_type',this.Formulario.controls['fm_optiontacreditacion'].value);    
    fd.append('user_organization_name', esRuc ? this.Formulario.controls['fm_razon_social'].value : this.fm_organizacion.value);  

    //casilla
    fd.append('box_doc_type', this.Formulario.controls['fm_optiontipo'].value);
    fd.append('box_doc', this.Formulario.controls['fm_numerodoc'].value);
    fd.append('box_organization_name', esRuc ? this.Formulario.controls['fm_razon_social'].value : this.fm_organizacion.value);
    fd.append('box_email', this.fm_correo.value);
    fd.append('box_address', this.fm_direccion.value);        
    fd.append('box_acreditation_type',this.Formulario.controls['fm_optiontacreditacion'].value);

    var files = this.Formulario.controls['files'].value;

    for (let index = 0; index < files.length; index++) {
      var str1 = files[index].name.replace(/.([^.]*)$/, '.pdf');
      const tempFile = new File(
        [files[index]],
        str1, //str1.replace(/[^a-zA-Z0-9\\.\\-]/g, '-'),
        {
          type: files[index].type.toLowerCase(),
        }
      );
      fd.append('file' + (index + 1), tempFile);
    }
    this.load = true;
    this.userService.CreateBox(fd).subscribe(
      (res) => {
        this.load = false;
        if (res.success) {
          this.funcionesService.mensajeOk(
            'Los datos de casilla electrónica fueron registrados con éxito',
            '/main/list-boxes'
            // this.esAdministrador
            //   ? '/main/list-boxes'
            //   : '/main/operador/usuarios'
          );
        } else {
          this.funcionesService.mensajeError(res.error.message);
        }
      },
      (err) => {
        this.load = false;
        console.log('Problemas del servicio', err);
      }
    );
  };

  get esAdministrador() {
    const typeProfile = this.seguridadService.getUserProfile();
    return typeProfile === Profile.Administrador || typeProfile === Profile.RegistryOperator;
  }

  validateInputs() {
    let isValid: boolean = false;
    if (this.documentTypeSelected === '') {
      return (isValid = false);
    } else if (
      this.Formulario.controls['fm_optiontacreditacion'].value === ''
    ) {
      return (isValid = false);
    } else if (this.box.pdf_resolution === undefined) {
      return (isValid = false);
    } else if (this.box.pdf_creation_solicitude === undefined) {
      return (isValid = false);
    } else if (this.box.pdf_agree_tos === undefined) {
      return (isValid = false);
    } else if (this.box.pdf_terminos === undefined) {
      return (isValid = false);
    } else {
      return (isValid = true);
    }
  }

  validar_campo(event, type): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  cancelar() {
    if (this.esAdministrador) this.router.navigate(['/main/list-boxes']);
    else this.router.navigate(['/main']);
  }

  private validatorRepeatFijo(control: FormControl) {
    if (control.value) {
      var re = new RegExp(/^(\d)\1{9}$/);
      var matches = re.test(control.value);
      return !matches ? null : { invalidName: true };
    } else {
      return null;
    }
  }
  private validatorRepeatMovil(control: FormControl) {
    if (control.value) {
      var re = new RegExp(/^(\d)\1{8,}$/);
      var matches = re.test(control.value);
      return !matches ? null : { invalidName: true };
    } else {
      return null;
    }
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
  eShowError = (input, error = null) => {
    if (error.required != undefined) {
      return 'Campo Requerido';
    } else if (error.pattern != undefined) {
      return 'Formato no válido';
    } else if (error.fileSize != undefined) {
      return 'Archivo(s) con peso excedido';
    } else if (error.minlength != undefined) {
      return 'Se requiere '+error.minlength.requiredLength+ ' caracteres como mínimo' ;
    } else {
      return 'Campo inválido';
    }
  };  
  onKeydown(event, type) {
    // switch (type) {
    //   case 'fm_celular':
    //     var val = this.Formulario.controls['fm_celular'];
    //     if (val != null) {
    //       this.Formulario.get('fm_celular').clearValidators();
    //       this.Formulario.updateValueAndValidity();
    //     } else {
    //       this.Formulario.controls['fm_fijo'].setValidators([
    //         Validators.required,
    //         this.validatorRepeatFijo,
    //       ]);
    //       this.Formulario.updateValueAndValidity();
    //     }
    //     break;
    //   case 'fm_fijo':
    //     var val = this.Formulario.controls['fm_fijo'];
    //     if (val != null) {
    //       this.Formulario.get('fm_celular').clearValidators();
    //       this.Formulario.updateValueAndValidity();
    //     } else {
    //       this.Formulario.get('fm_celular').setValidators([
    //         Validators.required,
    //         Validators.minLength(9),
    //         this.validatorRepeatMovil,
    //       ]);
    //       this.Formulario.updateValueAndValidity();
    //     }
    //     break;
    // }
  }

  soloExpLetras(idInput: string, inputForm: FormControl, e: any) {
    let inicio = this.renderer.selectRootElement(`#${idInput}`).selectionStart;
    let fin = this.renderer.selectRootElement(`#${idInput}`).selectionEnd;
    let value : string = inputForm.value;
    if (e.metaKey || e.ctrlKey) {
      return true;
    }
    if(inicio == 0 && e.key === ' ') return false;
    inputForm.setValue(value.replace(/ {2,}/g, ' '));
    this.renderer.selectRootElement(`#${idInput}`).setSelectionRange(inicio, fin, 'none');
    return !!/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/.test(e.key);
  }

  quitarDobleEspacio(idInput: string, inputForm: FormControl, e: any) {
    let inicio = this.renderer.selectRootElement(`#${idInput}`).selectionStart;
    let fin = this.renderer.selectRootElement(`#${idInput}`).selectionEnd;
    let value : string = inputForm.value;
    if (e.metaKey || e.ctrlKey) {
      return true;
    }
    if(inicio == 0 && e.key === ' ') return false;
    inputForm.setValue(value.replace(/ {2,}/g, ' '));
    this.renderer.selectRootElement(`#${idInput}`).setSelectionRange(inicio, fin, 'none');
  }

  buscarCE() {
    if(this.isCE) this.eSearch('general');
    if(this.isCERep) this.eSearch('representante');
  }
}