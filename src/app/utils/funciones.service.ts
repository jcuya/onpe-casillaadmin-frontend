import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { searchNotifications } from '../models/notifications/notification';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  colorMtc: string = '';

  constructor(private router: Router, private notificationService: NotificationService) {
  }

  mensajeOk(text: string, accionRedirect?: string, search?: searchNotifications): Promise<null> {
    return new Promise((resolve) => {
      Swal.fire({
        text: text,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: "green"
      }).then(() => {
        if (accionRedirect !== undefined) {
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          if(search != null) this.notificationService.searchNotifications({textSearch: search.textSearch, pageIndex: search.pageIndex, pageSize: search.pageSize});
          this.router.navigate([accionRedirect]);
        }
      });
    });
  }

  mensajeError(text: string): Promise<null> {
    return new Promise((resolve, reject) => {
      Swal.fire({
        text: text,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        confirmButtonColor: '#23DF05'
      }).then(() => {
        resolve();
      });
    });

  }

  mensajeInfo(text: string): Promise<null> {
    return new Promise((resolve, reject) => {
      Swal.fire({
        text: text,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        confirmButtonColor: '#23DF05'
      }).then(() => {
        resolve();
      });
    });

  }

  mensajeConfirmar(text: string, title: string = null) {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCancelButton: true,
        cancelButtonColor: '#b5b3b3',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar',
        reverseButtons: true
      }).then((resultado) => {
        if (resultado.value)
          resolve();
        else
          reject();
      });
    });
  }

  jsonToFormData(data: any): FormData {
    const formData = new FormData();
    this.buildFormData(formData, data);
    return formData;
  }


  private buildFormData(formData: FormData, data: any, parentKey = undefined) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      let separationOpen = '';
      let separationClose = '';
      Object.keys(data).forEach((key: any) => {
        if (isNaN(key) === true) {//es letter
          separationOpen = '.';
          separationClose = '';
        } else {//es número
          separationOpen = '[';
          separationClose = ']';
        }
        this.buildFormData(formData, data[key], parentKey ? `${parentKey}${separationOpen}${key}${separationClose}` : key);
      });
    } else {
      const value = data == null ? '' : data;

      formData.append(parentKey, value);
    }
  }

  colorLetter(name: string): string {
    let letter = name.substring(-1, 1)?.toUpperCase();
    if (letter === 'A' || letter === 'B' || letter === 'C') {
      return 'listCircle rdmColor_1';
    } else if (letter === 'D' || letter === 'E' || letter === 'F') {
      return 'listCircle rdmColor_2';
    } else if (letter === 'G' || letter === 'H' || letter === 'I') {
      return 'listCircle rdmColor_3';
    } else if (letter === 'J' || letter === 'K' || letter === 'L') {
      return 'listCircle rdmColor_4';
    } else if (letter === 'M' || letter === 'N' || letter === 'Ñ') {
      return 'listCircle rdmColor_5';
    } else if (letter === 'O' || letter === 'P' || letter === 'Q') {
      return 'listCircle rdmColor_6';
    } else if (letter === 'R' || letter === 'S' || letter === 'T') {
      return 'listCircle rdmColor_7';
    } else if (letter === 'U' || letter === 'V' || letter === 'W') {
      return 'listCircle rdmColor_8';
    } else if (letter === 'X' || letter === 'Y' || letter === 'Z') {
      return 'listCircle rdmColor_9';
    }
  }

  downloadFile = (
    excelResponse,
    nameExcel = 'pdf',
  ) => {
    const dataType = excelResponse.type;
    const binaryData = [];
    binaryData.push(excelResponse);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(
      new Blob(binaryData, { type: dataType }),
    );
    downloadLink.setAttribute('download', nameExcel);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  };

}
