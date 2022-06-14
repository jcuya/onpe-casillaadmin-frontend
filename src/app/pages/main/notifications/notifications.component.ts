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
  notificationRequest: NotificationRequest;
  notificationData: NotificationData;
  listReadyCheck: boolean;
  textSearch: string = '';
  filterSelected: string = '0';
  subscription: Subscription;
  @ViewChild('paginator') initPage: MatPaginator;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private funcionesService: FuncionesService,
    private paginator: MatPaginatorIntl
  ) {
    this.notificationData = new NotificationData();
    this.paginator.itemsPerPageLabel = 'Registros por página';
    this.paginator.nextPageLabel = 'Siguiente pagina';
    this.paginator.previousPageLabel = 'Pagina anterior';
    this.paginator.getRangeLabel = this.rangoPaginacion;
  }

  ngOnInit(): void {
    this.loadNotifications('', 1, 5);
    this.subscription = this.notificationService.refreshNot.subscribe(refresh => {
      if(refresh) {
        this.textSearch = '';
        this.initPage.firstPage();
        //this.loadNotifications('', 1, 5);
      }
    });
  }

  loadNotifications(querySearch: string, page?: number, pageSize?: number) {
    this.listReadyCheck = false;
    this.notificationRequest = new NotificationRequest();
    this.notificationRequest.search = querySearch;
    this.notificationRequest.filter = this.filterSelected.toString();
    this.notificationRequest.page = page;
    this.notificationRequest.count = pageSize;
    this.notificationService
      .GetNotifications(this.notificationRequest)
      .subscribe(
        (res) => {
          if (res.success) {
            this.listReadyCheck = true;
            this.notificationData = res;
          }
        },
        (err) => {
          console.log('Problemas del servicio', err);
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
    this.loadNotifications(this.textSearch, 1, 5);
    this.initPage.firstPage();
  }

  pageChangeEvent(event) {
    this.loadNotifications(this.textSearch, event.pageIndex + 1, event.pageSize);
  }

  goNotificationDetail(item: any) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(['/main/notificaciones-detalle/' + item]);
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
