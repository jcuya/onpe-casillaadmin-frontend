import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FuncionesService } from 'src/app/utils/funciones.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-solicitud-detail',
  templateUrl: './solicitud-detail.component.html',
  styleUrls: ['./solicitud-detail.component.scss'],
})
export class SolicitudDetailComponent implements OnInit {
  load = false;

  id;
  motivo1_detalle = "DNI no corresponde al usuario";
  motivo2_detalle = "Documento de representante no corresponde al representante legal";
  motivo3_detalle = "Documento de representante no corresponde al personero legal (titular)";
  motivo4_detalle = "Documento adjunto ilegible o en blanco";
  motivo5_detalle = "Documento de representación mayor a 90 días calendarios";
  motivo6_detalle = "Foto adjunto no cumple con las especificaciones";
  motivo7_detalle = "Foro adjunta no corresponde a los datos registrados";
  motivo8_detalle = "Información registrada errada (ejm. colocan lisuras en el campo de la direccion";
  motivo9_detalle = "otros";
  data: any = {};
  representante: any = {};

  imageURlss: any = '';

  constructor(
    private usuarioService: UserService,
    private router: ActivatedRoute,
    private funcionesService: FuncionesService,
    public domSanitizer: DomSanitizer
  ) {
    this.id = this.router.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.getDataUser();
  }

  async getDataUser() {
    const info = await this.usuarioService.getUserDetail(this.id).toPromise();
    if (!info) return;
    console.log('informacion', info);
    this.data = info.user;
    this.representante = this.data.representante;
    console.log('DATA-INFO', this.data);
    if (this.data.imageDNI) {
      this.imageURlss = this._arrayBufferToBase64(this.data.imageDNI);
    }
  }

  download = async (path: string, name: string) => {
    try {
      this.load = true;
      const file = await this.usuarioService.download(path).toPromise();

      console.log('archivoo', file);
      this.funcionesService.downloadFile(file, name);
      this.load = false;
    } catch (error) {
      this.load = false;
    }
  };

  ViewImg(attachments): string {
    let typeArray = new Uint8Array(attachments.data);
    const STRING_CHAR = String.fromCharCode.apply(null, typeArray);
    let base64String = btoa(STRING_CHAR);

    let info = 'data:image/jpeg;base64,' + base64String;
    return info;
    //this.domSanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,'+ base64String);
  }

  _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer.data);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let info = 'data:image/jpeg;base64,' + window.btoa(binary);
    return info;
  }

  consultar(estado) {
    let palabra = '';
    let envioestado = '';
    let motivoenvio = {};
    let palabraRespues = '';

    if (estado == 1) {
      envioestado = 'APROBADO';
      palabraRespues = 'aprobada';

      this.funcionesService
        .mensajeConfirmar(
          '¿Estás seguro de aprobar la creación de Casilla Electrónica de '+ this.data.name +'?'
        )
        .then((resp) => {
          this.usuarioService
            .updateEstateInbox({
              idUser: this.id,
              estado: envioestado,
              motivo: motivoenvio,
              name : this.data.lastname + " " + this.data.name,
              email : this.data.email
            })
            .subscribe((res) => {
              if (res.success) {
                this.funcionesService.mensajeOk(
                  'La casilla ha sido aprobada con éxito',
                  '/main/operador/usuarios'
                );
              } else {
              }
            });
        })
        .catch((err) => {});
    } else {
      palabra = 'desaprobar';
      envioestado = 'DESAPROBADO';
      palabraRespues = 'desaprobada';
    

      Swal.fire({
        width: '800px',
        title: 'Motivo de desaprobación',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        html: `
        <div id="contenidoSweet" style="
        text-align: start !important;
    ">
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="value1">
            <label class="form-check-label" for="value1">
            ${this.motivo1_detalle}   
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="value2">
            <label class="form-check-label" for="value2">
            ${this.motivo2_detalle}
            </label>
        </div>
        <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="value3">
        <label class="form-check-label" for="value3">
        ${this.motivo3_detalle}
        </label>
    </div>
      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="value4">
      <label class="form-check-label" for="value4">
      ${this.motivo4_detalle}
      </label>
      </div>

      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="value5">
      <label class="form-check-label" for="value5">
      ${this.motivo5_detalle}
      </label>
      </div>

      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="value6">
      <label class="form-check-label" for="value6">
      ${this.motivo6_detalle}
      </label>
      </div>

      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="value7">
      <label class="form-check-label" for="value7">
      ${this.motivo7_detalle}
      </label>
      </div>

      <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="value8">
      <label class="form-check-label" for="value8">
      ${this.motivo8_detalle}
      </label>
      </div>

      <div class="form">
      <label class="form-check-label" for="value9">
      ${this.motivo9_detalle} : 
      </label>
      <input class="form-check-input" type="text" value="" id="value9">
      </div>
      </div>
          `,

        focusConfirm: false,
        preConfirm: () => {
          return {
            motivo1:{
              detalle : this.motivo1_detalle,
              value : (<HTMLInputElement>document.getElementById('value1'))
              .checked
            } ,
            motivo2:{
              detalle : this.motivo2_detalle,
              value : (<HTMLInputElement>document.getElementById('value2'))
              .checked
            } ,
            motivo3:{
              detalle : this.motivo3_detalle,
              value : (<HTMLInputElement>document.getElementById('value3'))
              .checked
            } ,
            motivo4:{
              detalle : this.motivo4_detalle,
              value : (<HTMLInputElement>document.getElementById('value4'))
              .checked
            }  ,
            motivo5:{
              detalle : this.motivo5_detalle,
              value : (<HTMLInputElement>document.getElementById('value5'))
              .checked
            }  ,
            motivo6:{
              detalle : this.motivo6_detalle,
              value : (<HTMLInputElement>document.getElementById('value6'))
              .checked
            }  ,
            motivo7:{
              detalle : this.motivo7_detalle,
              value : (<HTMLInputElement>document.getElementById('value7'))
              .checked
            }  ,
            motivo8:{
              detalle : this.motivo8_detalle,
              value : (<HTMLInputElement>document.getElementById('value8'))
              .checked
            }  ,
            motivo9:{
              detalle : this.motivo9_detalle,
              value : (<HTMLInputElement>document.getElementById('value9')).value
              
            } 
          };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('resultado', result);
          this.usuarioService
          .updateEstateInbox({
            idUser: this.id,
            estado: envioestado,
            motivo: result.value,
            name : this.data.lastname + " " + this.data.name,
            email : this.data.email
          })
          .subscribe((res) => {
            if (res.success) {
              this.funcionesService.mensajeOk(
                'La casilla ha sido desaprobada',
                '/main/operador/usuarios'
              );
            } else {
            }
          });


        } else {
          return;
        }
      });
    }
  }
}
