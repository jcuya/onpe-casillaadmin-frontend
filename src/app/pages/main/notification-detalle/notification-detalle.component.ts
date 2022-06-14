import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationRequest } from 'src/app/models/notifications/notification-request';
import {
  attachment,
  notification,
  notificationRequest,
} from 'src/app/models/notifications/notification';
import { NotificationService } from 'src/app/services/notification.service';
import { FuncionesService } from 'src/app/utils/funciones.service';
import { ResultSignature } from 'src/app/shared/constantes';
import { Subject } from 'rxjs';

declare var initInvoker: any;
declare var dispatchEventClient: any;
@Component({
  selector: 'app-notification-detalle',
  templateUrl: './notification-detalle.component.html',
  styleUrls: ['./notification-detalle.component.scss'],
})
export class NotificationDetalleComponent implements OnInit {
  notiRequest: notificationRequest = new notificationRequest();
  //notificationRequest : notificationsRequest = new notificationsRequest();
  id: string;
  public formulario: FormGroup;
  adjuntos: attachment[];
  view1: string = 'color_1 posUno';

  view2: string = 'color_2 posDos';
  icon2: string = 'stop_circle';
  formDataNotification: FormData = new FormData();
  notification: notification = new notification();
  isAutomatic: boolean = false;
  parametro: string;
  loading: boolean = true;
  lbl_bloqueado: string = 'El documento contiene datos que sólo el administrado puede acceder';

  @Input() numNotview: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private funcionesService: FuncionesService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.createForm();
    this.GetNotificationDetail();
    this.notification.read_at = null;
    this.notification.received_at = null;
    if(this.notificationService.openWindow.isStopped) this.notificationService.openWindow = new Subject<boolean>();
    if(this.notificationService.saveNotification.isStopped) this.notificationService.saveNotification = new Subject<boolean>();

    this.notificationService.saveNotification.subscribe(save => {
      if(save) {
        this.updateNotification();
      }
    });

    this.notificationService.openWindow.subscribe(open => {
      if(open) {
        dispatchEventClient('sendArguments', this.parametro);
      }
    });

    this.notificationService.refreshNoticacions(false);
  }

  createForm(): void {
    this.formulario = this.fb.group({
      n_expediente: [''],
      n_notifier_Area: [''],
      n_received_at: [''],
      n_read_at: [''],
      n_message: [''],
    });
  }

  getColor(name: string) {
    return this.funcionesService.colorLetter(name);
  }

  GetNotificationDetail() {
    this.notiRequest.id = this.id;
    this.loading = true;
    this.notificationService
      .getNotificationDetail<any>(this.notiRequest)
      .subscribe(
        (data) => {
          this.loading = false;
          if (data.success) {
            //this.notificationRespone = data;
            this.notification = data.notification;
            this.isAutomatic = data.notification.automatic;
            this.adjuntos = data.notification.attachments;
            if(!this.isAutomatic) {
              this.loadNotificationData(data.notification);
              if (data.notification.read_at != undefined) {
                this.view2 = 'color_1 posDos';
                this.icon2 = 'check_circle';
              }
            }
          } else {
            this.funcionesService.mensajeError(data.error.message);
            //this.mensaje=data.error.message;
          }
        },
        (error) => {
          // this.mensaje="Error de servicio, intente de nuevo o mas tarde.";
        }
      );
  }

  loadNotificationData(noti: notification) {
    this.formulario.get('n_expediente').setValue(noti.expedient);
    this.formulario.get('n_notifier_Area').setValue(noti.notifier_area);
    this.formulario.get('n_received_at').setValue(noti.received_at);
    this.formulario.get('n_read_at').setValue(noti.read_at);
    this.formulario.get('n_message').setValue(noti.message);
    //this.adjuntos = noti.attachments;
  }

  viewDocument(item: any) {
    this.notificationService.downloadAttachment(item.url).subscribe(data => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.setAttribute('style', 'display:none');
      document.body.appendChild(a);
      a.href = url;
      a.download = item.name;
      a.click();
    });
  }

  print() {
    let printContents = document.getElementById('imp1').innerHTML;
    document.getElementById('no-imp1').remove();
    let contenido = document.getElementById('imp1').innerHTML;

    let contenidoOriginal = document.body.innerHTML;
    document.body.innerHTML = contenido;
    window.print();
    document.body.innerHTML = contenidoOriginal;
    location.reload();
  }

  cancel() {
    this.router.navigate(['/main/notificaciones']);
  }

  clearData() {
    this.notification = new notification();
  }

  getFormDataNotification() {
    this.formDataNotification = new FormData();
    this.formDataNotification.append('id', this.notification.id);
  }

  NotificationSign() {
    this.getFormDataNotification();
    
    this.notificationService
      .GetNotificationAutomaticSign(this.formDataNotification)
      .subscribe(
        (res) => {
          if (res.success) {
            this.parametro = res.param;
            if (this.parametro.length > 0) {
              initInvoker(ResultSignature.TypeEvenReniec);
            } else {
              this.funcionesService.mensajeError(
                'No hay data para envío invoker'
              );
            }
          } else {
            this.funcionesService.mensajeError(res.error.message);
          }
        },
        (err) => {
          console.log('Problemas del servicio', err);
        }
      );
  }

  updateNotification() {
    this.getFormDataNotification();
    this.notificationService.SendNotificationAutomatic(this.formDataNotification).subscribe(
      (res) => {
        if (res.success) {
          //this.clearData();
          this.funcionesService.mensajeOk(
            'La notificación fue enviada con éxito',
            '/main/notificaciones'
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

  ngOnDestroy(): void {
    this.notificationService.openWindow.unsubscribe();
    this.notificationService.saveNotification.unsubscribe();
  }
}
