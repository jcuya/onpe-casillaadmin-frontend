import {
  Component,
  ElementRef,
  OnInit,
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
  maxlengthNumDoc: number;
  minlengthNumDoc: number;
  maxlengthNumDocRep: number;
  minlengthNumDocRep: number;
  listTypeAcreditation: TypeAccreditation[];
  inputDisabled: boolean = false;
  placeHolder = 'Ingrese número ';
  Formulario: FormGroup;

  fileLoad: any;
  public fileToUpload: File;
  uploadedFiles: Array<File> = [];

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

  constructor(
    private userService: UserService,
    private funcionesService: FuncionesService,
    private router: Router,
    private fb: FormBuilder,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getTypeAcreditacion();
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
      fm_organizacion: this.fb.control({
        value: '',
        disabled: this.inputDisabled,
      }),
      fm_numerodoc: this.fb.control('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
      ]),
      fm_numerodoc_rep: this.fb.control('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
      ]),
      fm_nombres: this.fb.control({ value: '', disabled: this.inputDisabled }, [
        Validators.required,
        Validators.pattern(
          "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$"
        ),
      ]),
      fm_appaterno: this.fb.control(
        { value: '', disabled: this.inputDisabled },
        [
          Validators.required,
          Validators.pattern(
            "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$"
          ),
        ]
      ),
      fm_apmaterno: this.fb.control(
        { value: '', disabled: this.inputDisabled },
        [
          Validators.required,
          Validators.pattern(
            "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$"
          ),
        ]
      ),
      fm_correo: this.fb.control({ value: '', disabled: this.inputDisabled }, [
        Validators.required,
        Validators.pattern(
          '[a-zA-Z0-9.+-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}'
        ),
      ]),
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
      fm_direccion: this.fb.control(
        { value: '', disabled: this.inputDisabled },
        [Validators.required]
      ),
      fm_optiontacreditacion: this.fb.control(
        {
          value: '',
          disabled: this.inputDisabled,
        },
        [Validators.required]
      ),
      files: this.filesControl,
    });
  };
  private eResetForm = (level: number) => {
    this.Formulario.get('fm_nombres').setValue('');
    this.Formulario.get('fm_appaterno').setValue('');
    this.Formulario.get('fm_apmaterno').setValue('');
    this.Formulario.get('fm_correo').setValue('');
    this.Formulario.get('fm_celular').setValue('');
    this.Formulario.get('fm_fijo').setValue('');
    this.Formulario.get('fm_direccion').setValue('');
    this.Formulario.get('fm_optiontacreditacion').setValue(null);
    if (level == 1) return;
    this.Formulario.get('fm_numerodoc_rep').setValue('');
    if (level == 2) return;
    this.Formulario.get('fm_razon_social').setValue('');
    this.Formulario.get('fm_optiontipo_rep').setValue(null);
    this.Formulario.get('fm_organizacion').setValue('');
    this.Formulario.get('files').setValue(null);
    this.uploadedFiles = [];
    if (level == 3) return;
    this.Formulario.get('fm_numerodoc').setValue('');
    if (level == 4) return;
  };
  eChangeDocumento(event) {
    this.eResetForm(4);
    this.existData = true;
    this.documentTypeSelected = event.value;
    if (this.documentTypeSelected === 'dni') {
      this.minlengthNumDoc = 8;
      this.maxlengthNumDoc = 8;
      this.eChangeRequired(false);
    } else if (this.documentTypeSelected === 'ce') {
      this.minlengthNumDoc = 9;
      this.maxlengthNumDoc = 9;
      this.eChangeRequired(false);
    } else if (this.documentTypeSelected === 'ruc') {
      this.minlengthNumDoc = 11;
      this.maxlengthNumDoc = 11;
      this.eChangeRequired(true);
    }
  }
  eChangeDocumentoRep(event) {
    this.eResetForm(2);
    if (event.value === 'dni') {
      this.minlengthNumDocRep = 8;
      this.maxlengthNumDocRep = 8;
    } else if (event.value === 'ce') {
      this.minlengthNumDocRep = 9;
      this.maxlengthNumDocRep = 9;
    }
  }
  private eChangeRequired = (status) => {
    var required = status ? [Validators.required] : null;
    //var required2 = !status ? [Validators.required] : null;
    const a1 = this.Formulario.get('fm_optiontipo_rep');
    const a2 = this.Formulario.get('fm_numerodoc_rep');
    const a3 = this.Formulario.get('fm_razon_social');
    //const a4 = this.Formulario.get('fm_organizacion');

    a1.setErrors(null);
    a2.setErrors(null);
    a3.setErrors(null);
    //a4.setErrors(null);

    a1.setValidators(required);
    a2.setValidators(required);
    a3.setValidators(required);
    //a4.setValidators(required2);

    a1.reset();
    a2.reset();
    a3.reset();
    //a4.reset();
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
        if (esRuc) return 'Número de RUC';
        return 'Número de Documento';
    }
  };
  buildHolder = (name: string) => {
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    switch (name) {
      case 'fm_numerodoc':
        if (esRuc) return 'Ingrese el número de RUC';
        return 'Ingrese el número de Documento';
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
    var response = null;
    var message = 'No se encontró los datos del documento.';
    switch (tipo) {
      case 'ruc':
        response = await this.consultaSunat(doc);
        message = 'El RUC ' + doc + ' solicitado no está registrado';
        break;
      case 'ce':
        response = await this.consultaExtranjeria(doc);
        message =
          'El CE ' +
          doc +
          ' solicitado no está registrado, por favor ingrese los datos';
        this.existData = false;
        break;
      case 'dni':
        response = await this.consultaReniec(doc, type);
        message =
          'El DNI ' + doc + ' solicitado no está registrado en el padrón';
        break;
      default:
        break;
    }
    this.load = false;
    if (response) {
      this.existData = true;
    } else {
      this.buildError(message);
    }
  };

  private consultaReniec = (doc: string, type: string) => {
    return new Promise<boolean>((resolve) => {
      this.userService.ConsultaReniec(doc).subscribe(
        (resp: any) => {
          if (resp) {
            var nombres = `${resp.nombres} ${resp.appat} ${resp.apmat}`;
            this.Formulario.get('fm_nombres').setValue(resp.nombres);
            this.Formulario.get('fm_appaterno').setValue(resp.appat);
            this.Formulario.get('fm_apmaterno').setValue(resp.apmat);
            resolve(true);
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
  private consultaExtranjeria = (doc: string) => {
    return new Promise<boolean>((resolve) => {
      resolve(false);
    });
  };
  //----------------------------

  public filesControl = new FormControl(null, [
    Validators.required,
    FileUploadValidators.accept(['.pdf']),
    FileUploadValidators.filesLimit(5),
    FileUploadValidators.fileSize(1048576 * 10),
    this.noWhitespaceValidator,
  ]);

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
      this.maxlengthNumDoc = 9;
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
    this.Formulario.get('fm_correo').enable();
    this.Formulario.get('fm_celular').enable();
    this.Formulario.get('fm_fijo').enable();
    this.Formulario.get('fm_direccion').enable();
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
    // console.log(this.Formulario.valid);
    //console.log(this.Formulario.value);
    // return;
    this.load = true;
    const esRuc = this.Formulario.get('fm_optiontipo').value == 'ruc';
    if (!this.Formulario.valid) return;

    const fd = new FormData();
    fd.append('email', this.Formulario.controls['fm_correo'].value);
    fd.append('cellphone', this.Formulario.controls['fm_celular'].value);
    fd.append('phone', this.Formulario.controls['fm_fijo'].value);
    fd.append('address', this.Formulario.controls['fm_direccion'].value);
    fd.append('name', this.Formulario.controls['fm_nombres'].value);
    fd.append('lastname', this.Formulario.controls['fm_appaterno'].value);
    fd.append(
      'second_lastname',
      this.Formulario.controls['fm_apmaterno'].value
    );
    fd.append(
      'acreditation_type',
      this.Formulario.controls['fm_optiontacreditacion'].value
    );

    if (esRuc) {
      fd.append('docType', this.Formulario.controls['fm_optiontipo_rep'].value);
      fd.append('doc', this.Formulario.controls['fm_numerodoc_rep'].value);
      fd.append('ruc', this.Formulario.controls['fm_numerodoc'].value);
      fd.append(
        'razonsocial',
        this.Formulario.controls['fm_razon_social'].value
      );
      fd.append(
        'organization',
        this.Formulario.controls['fm_razon_social'].value
      );
    } else {
      fd.append('docType', this.Formulario.controls['fm_optiontipo'].value);
      fd.append('doc', this.Formulario.controls['fm_numerodoc'].value);
      fd.append(
        'organization',
        this.Formulario.controls['fm_organizacion'].value
      );
    }

    var files = this.Formulario.controls['files'].value;

    for (let index = 0; index < files.length; index++) {
      var str1 = files[index].name.replace(/.([^.]*)$/, '.pdf');
      const tempFile = new File(
        [files[index]],
        str1.replace(/[^a-zA-Z0-9\\.\\-]/g, '-'),
        {
          type: files[index].type.toLowerCase(),
        }
      );
      fd.append('file' + (index + 1), tempFile);
    }

    this.userService.CreateBox(fd).subscribe(
      (res) => {
        this.load = false;
        if (res.success) {
          this.funcionesService.mensajeOk(
            'Los datos de casilla electrónica fueron registrados con éxito',
            this.esAdministrador
              ? '/main/list-boxes'
              : '/main/operador/usuarios'
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
    return typeProfile === Profile.Administrador;
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

  keydown(event, type) {
    if (event.keyCode == 9) return;

    if (type == 'fm_numerodoc_rep') {
      this.eResetForm(1);
    }
    if (type == 'fm_numerodoc') {
      this.eResetForm(3);
    }
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
}
