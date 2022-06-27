import { Filters } from './../../../models/notifications/notification';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NotificationData } from 'src/app/models/notifications/notification-data';
import { NotificationRequest } from 'src/app/models/notifications/notification-request';
import { NotificationService } from 'src/app/services/notification.service';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { FuncionesService } from 'src/app/utils/funciones.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notificationRequest: NotificationRequest = new NotificationRequest();
  notificationData: NotificationData = new NotificationData();
  listReadyCheck: boolean;
  textSearch: string = '';
  filterSelected: string = '0';
  subscription: Subscription;
  @ViewChild('paginator') initPage: MatPaginator;

  mensaje: string;
  pageIndex: number;
  pageSize: number;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private funcionesService: FuncionesService,
    private paginator: MatPaginatorIntl
  ) {
    this.pageIndex = 1;
    this.pageSize = 5;
    this.paginator.itemsPerPageLabel = 'Registros por página';
    this.paginator.nextPageLabel = 'Siguiente pagina';
    this.paginator.previousPageLabel = 'Pagina anterior';
    this.paginator.getRangeLabel = this.rangoPaginacion;
  }

  ngOnInit(): void {
    //this.loadNotifications('', 1, 5);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
  
      this.subscription = this.notificationService.fieldsSearch.subscribe(value => {
        if(value != null) {
          this.textSearch = value.textSearch;
          this.pageIndex = value.pageIndex;
          this.pageSize = value.pageSize;
          if(this.pageIndex == 1 && this.pageSize == 5) {
            this.initPage.firstPage();
          }
          else {
            this.initPage.pageIndex = this.pageIndex - 1;
            this.initPage.pageSize = this.pageSize;
          }
          this.loadNotifications(this.textSearch, this.pageIndex, this.pageSize);
        } else {
          this.resetValores();
          this.initPage.firstPage();
          this.loadNotifications('', this.pageIndex, this.pageSize);
        }
      });
    });
  }

  loadNotifications(querySearch: string, page?: number, pageSize?: number) {
    this.listReadyCheck = false;
    this.notificationRequest.search = querySearch;
    this.notificationRequest.filter = this.filterSelected.toString();
    this.notificationRequest.page = page;
    this.notificationRequest.count = pageSize;
    
    this.notificationService
      .GetNotifications<any>(this.notificationRequest)
      .subscribe(
        (data) => {
          if (data.success) {
            this.listReadyCheck = true;
            this.notificationData = data;
          } else {
            this.mensaje = data.error.message;

            this.funcionesService.mensajeError(this.mensaje);
          }
        },
        (error) => {
          this.funcionesService.mensajeError('Problemas en el servicio.');
        }
      );
  }

  filters: Filters[] = [
    { id: '0', value: 'Todos' },
    { id: '1', value: 'Leído' },
    { id: '2', value: 'No Leído' },
    { id: '3', value: 'Notificado' },
    { id: '4', value: 'No Notificado' },
  ];

  getColor(name: string) {
    return this.funcionesService.colorLetter(name);
  }
  searchByQuery() {
    this.resetValores();
    this.loadNotifications(this.textSearch, this.pageIndex, this.pageSize);
    this.initPage.firstPage();
  }

  pageChangeEvent(event) {
    this.pageIndex = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotifications(this.textSearch, this.pageIndex, this.pageSize);
  }

  goNotificationDetail(item: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(['/main/notificaciones-detalle/' + item], {state: {textSearch: this.textSearch, pageIndex: this.pageIndex, pageSize: this.pageSize}});
  }

  resetValores() {
    this.pageIndex = 1;
    this.pageSize = 5;
    this.filterSelected = '0';
  }

  private rangoPaginacion = (
    page: number,
    pageSize: number,
    length: number
  ) => {
    if (length == 0 || pageSize == 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
