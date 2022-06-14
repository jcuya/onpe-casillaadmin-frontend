import { getSupportedInputTypes } from '@angular/cdk/platform';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogService } from 'src/app/services/catalog.service';
import { FuncionesService } from 'src/app/utils/funciones.service';

@Component({
  selector: 'app-new-catalog',
  templateUrl: './new-catalog.component.html',
  styleUrls: ['./new-catalog.component.scss']
})
export class NewCatalogComponent implements OnInit {
  form: FormGroup;
  types: [];
  isLoading = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewCatalogComponent>, private fb: FormBuilder,
    private funcionesService: FuncionesService,
    private catalogService: CatalogService) { }

  ngOnInit () {
    this.form = this.fb.group({
      type: this.fb.control({
        value: this.data ? this.data.type : '',
        disabled: this.data ? true : this.isLoading,
      }),
      code: this.fb.control({
        value: this.data ? this.data.code : '',
        disabled: this.data ? true : this.isLoading,
      }),
      value: this.fb.control({
        value: this.data ? this.data.value : '',
        disabled: this.isLoading,
      }),
    });
    this.getTypes();
  }

  getTypes = async () => {
    this.catalogService.gettypes().subscribe(resp => {
      this.types = resp;
    });
  }

  submit = () => {
    if (!this.form.valid) return;
    const formValue = this.form.getRawValue();

    this.isLoading = true;
    const promise = !this.data
      ? this.catalogService.createCatalog({
        type: formValue.type,
        code: formValue.code,
        value: formValue.value,
      })
      : this.catalogService.updateCatalog({
        id: this.data.id,
        value: formValue.value,
      });

    promise.subscribe(
      (res) => {
        this.isLoading = false;
        if (res.success) {
          this.funcionesService.mensajeOk(
            'Los datos del catálogo fueron registrados con éxito'
          );
          this.dialogRef.close(true);
        } else {
          this.funcionesService.mensajeError(res.error);
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('Problemas del servicio', err);
      }
    );
  };

  cancel() {
    this.dialogRef.close();
  }

}
