import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TypeDocument } from 'src/app/models/notifications/notification';
import { UserService } from 'src/app/services/user.service';
import { Profile } from 'src/app/transversal/enums/global.enum';
import { FuncionesService } from 'src/app/utils/funciones.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  Formulario: FormGroup;
  inputDisabled = false;
  documentTypeSelected: string = '';
  maxlengthNumDoc: number;
  placeHolder = 'Ingrese número de documento';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditUserComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private funcionesService: FuncionesService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  typeDocument: TypeDocument[] = [
    { id: 'dni', value: 'DNI' },
    { id: 'ce', value: 'Carnet de Extranjería' },
  ];

  profiles: TypeDocument[] = [
    { id: Profile.RegistryOperator, value: 'Registrador' },
    { id: Profile.Notifier, value: 'Notificador' },
    { id: Profile.Administrador, value: 'Administrador' },
  ];

  formInvalid(control: string) {
    return (
      this.Formulario.get(control).invalid &&
      (this.Formulario.get(control).dirty ||
        this.Formulario.get(control).touched)
    );
  }

  initForm() {
    this.Formulario = this.fb.group({
      fm_optiontipo: this.fb.control({
        value: this.data ? this.data.doc_type : '',
        disabled: this.data ? true : this.inputDisabled,
      }),
      fm_numerodoc: this.fb.control(
        {
          value: this.data ? this.data.doc : '',
          disabled: this.data ? true : this.inputDisabled,
        },
        [Validators.pattern('^[0-9]+$')]
      ),
      fm_nombres: this.fb.control({
        value: this.data ? this.data.name : '',
        disabled: this.inputDisabled,
      }),
      // fm_apellidos: this.fb.control({
      //   value: this.data ? this.data.lastname : '',
      //   disabled: this.inputDisabled,
      // }),
      fm_apellidoPaterno: this.fb.control({
        value: this.data ? this.data.lastname : '',
        disabled: this.inputDisabled,
      }),
      fm_apellidoMaterno: this.fb.control({
        value: this.data ? this.data.second_lastname : '',
        disabled: this.inputDisabled,
      }),
      fm_correo: this.fb.control(
        {
          value: this.data ? this.data.email : '',
          disabled: this.inputDisabled,
        },
        [
          Validators.required,
          Validators.pattern(
            '[a-zA-Z0-9.+-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}'
          ),
        ]
      ),
      fm_profile: this.fb.control(
        {
          value: this.data ? this.data.profile : '',
          disabled: this.data ? true : this.inputDisabled,
        },
        [Validators.required]
      ),
    });
  }

  changeTypeDocument(event) {
    this.documentTypeSelected = event.value;

    if (this.documentTypeSelected === 'dni') {
      this.maxlengthNumDoc = 8;
      this.placeHolder = 'Ingrese número de DNI';
    } else {
      this.maxlengthNumDoc = 12;

      this.placeHolder = 'Ingrese número de CE';
    }
  }
  validar_campo(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  submit = () => {
    if (!this.Formulario.valid) return;
    const formValue = this.Formulario.getRawValue();

    this.inputDisabled = true;
    const promise = this.data
      ? this.userService.EditUser({
          doc: formValue.fm_numerodoc,
          email: formValue.fm_correo,
          lastname: formValue.fm_apellidoPaterno,
          second_lastname: formValue.fm_apellidoMaterno,
          name: formValue.fm_nombres,
          //id: this.data.id,
        })
      : this.userService.crearteUser({
          doc: formValue.fm_numerodoc,
          docType: formValue.fm_optiontipo,
          email: formValue.fm_correo,
          lastname: formValue.fm_apellidoPaterno,
          second_lastname: formValue.fm_apellidoMaterno,
          name: formValue.fm_nombres,
          profile: formValue.fm_profile,
        });

    promise.subscribe(
      (res) => {
        this.inputDisabled = false;
        if (res.success) {
          this.funcionesService.mensajeOk(
            'Los datos del usuario fueron registrados con éxito'
          );
          this.dialogRef.close(true);
        } else {
          this.funcionesService.mensajeError(res.error);
        }
      },
      (err) => {
        this.inputDisabled = false;
        console.log('Problemas del servicio', err);
      }
    );
  };

  cancelar() {
    this.dialogRef.close(false);
  }
}
