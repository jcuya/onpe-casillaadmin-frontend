import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationData } from '../models/notifications/notification-data';
import { NotificationRequest, SendNotificationRequest } from '../models/notifications/notification-request';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { notificationRequest, searchNotifications } from '../models/notifications/notification';

const API_URL = environment.URL_SERVICES;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};
const httpOptionsFormData = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
    'boundary' : 'BoundaryHere'
  })
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private fields = new BehaviorSubject<searchNotifications>(null);
  fieldsSearch = this.fields.asObservable();

  searchNotifications(value : searchNotifications) {
    this.fields.next(value);
  }

  openWindow = new Subject<boolean>();
  saveNotification = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  GetNotifications<T>(notificationRequest: NotificationRequest): Observable<T> {
    return this.http.post<any>(API_URL + '/notifications', notificationRequest, httpOptions).pipe(map(res => res));
  }

  GetProcedure(): Observable<any> {
    return this.http.get<any>(API_URL + '/cache-send-notification', httpOptions)
    .pipe(map(res => res));
  }

  ConsultPerson(personRequest: any): Observable<any>{
    return this.http.post<any>(API_URL + '/person-notify', personRequest, httpOptions)
    .pipe(map(res => res));
  }

  SendNotification(sendNotificationRequest: FormData): Observable<any> {
    return this.http.post<any>(API_URL + '/send-notification', sendNotificationRequest)
    .pipe(map(res => res));
  }

  GetNotificationSign(sendNotificationRequest: FormData): Observable<any>{
    return this.http.post<any>(API_URL + '/sing-notification', sendNotificationRequest)
    .pipe(map(res => res));
  }

  GetNotificationAutomaticSign(sendNotificationRequest: FormData): Observable<any>{
    return this.http.post<any>(API_URL + '/sing-notification-automatic', sendNotificationRequest);
  }

  SendNotificationAutomatic(sendNotificationRequest: FormData): Observable<any> {
    return this.http.post<any>(API_URL + '/send-notification-automatic', sendNotificationRequest);
  }

  getNotificationDetail<T>(notirequest: notificationRequest): Observable<T> {
    return this.http.post<any>(API_URL + "/notification", notirequest, httpOptions).pipe(map(res => res));
  }

  downloadAttachment(url: string) {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

}
