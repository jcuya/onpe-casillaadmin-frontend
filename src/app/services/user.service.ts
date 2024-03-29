import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { BoxRequest, UserRequest } from '../models/users/user-request';
import { UserData } from '../models/users/user-data';
import { convertObjectToGetParams } from '../utils/http-utils';
import { UserDetail } from '../models/users/user';

const API_URL = environment.URL_SERVICES;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private fields = new BehaviorSubject<UserRequest>(null);
  fieldsSearch = this.fields.asObservable();


  constructor(private http: HttpClient) { }
  delete(docType: string, doc: any): Observable<any> {
    return this.http
      .post(API_URL + '/delete-user', { docType, doc }, httpOptions)
      .pipe(map((res) => res));
  }

  download(path: string): Observable<any> {
    return this.http
      .get<any>(API_URL + '/download-pdf', {
        params: { path },
        responseType: 'blob' as 'json'
      }).pipe(map((res) => res));
  }

  getUser(id: string): Observable<any> {
    return this.http
      .get<any>(API_URL + '/get-user', {
        params: { id }, headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      }).pipe(map((res) => res));
  }

  getUserDetail(id: string, enAtencion: boolean): Observable<any> {
    const atender = enAtencion ? 'true' : 'false';
    return this.http
      .get<any>(API_URL + '/get-user-info-detail', {
        params: { id, atender }, headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      }).pipe(map((res) => res));
  }

  updateEstateInbox(request: { idUser: string, estado: string, motivo: {},name :string ,email : string }
    ) {
      return this.http
        .post<any>(API_URL + '/updateEstateInbox', request)
        .pipe(map((res) => res));
    }

    editUserDetail(userDetail: UserDetail
      ) {
        return this.http
          .post<any>(API_URL + '/inbox/edit', userDetail)
          .pipe(map((res) => res));
      }

  GetUsers(userRequest: UserRequest): Observable<UserData> {
    return this.http
      .post<any>(API_URL + '/users', userRequest, httpOptions)
      .pipe(map((res) => res));
  }
  ListUsers(userRequest: UserRequest): Observable<UserData> {
    return this.http
      .post<any>(API_URL + '/list-users', userRequest, httpOptions)
      .pipe(map((res) => res));
  }
  crearteUser(request: { docType: string, doc: string, profile: String, name: string, lastname: string,second_lastname: string, email: string }
  ) {
    return this.http
      .post<any>(API_URL + '/create-user', request)
      .pipe(map((res) => res));
  }

  EditUser(request: { doc: string, name: string, lastname: string,second_lastname: string, email: string}
    //EditUser(request: { doc: string, name: string, lastname: string,second_lastname: string, email: string, id: string }
  ) {
    return this.http
      .put<any>(API_URL + '/edit-user', request)
      .pipe(map((res) => res));
  }

  GetTypeAcreditation(): Observable<any> {
    return this.http
      .get(API_URL + '/cache-box', httpOptions)
      .pipe(map((res) => res));
  }

  ConsultPerson(personRequest: any): Observable<any> {
    return this.http
      .post<any>(API_URL + '/person', personRequest, httpOptions)
      .pipe(map((res) => res));
  }

  CreateBox(boxRequest: FormData): Observable<any> {
    return this.http
      .post<any>(API_URL + '/create-box', boxRequest)
      .pipe(map((res) => res));
  }

  ConsultaReniec = (doc: string) => {
    var request = {
      dni: doc,
    };
    //return this.http.post<any>(environment.URL_RENIEC, request, httpOptions);
    //return this.http.post<any>('/ws_padron_reniec/api/padron/dni', request, httpOptions);

    return this.http
      .get(API_URL + '/search-person', {
        params: convertObjectToGetParams(request),
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      });
  };

  ConsultaSunat(ruc: string): Observable<any> {
    var request = {
      ruc: ruc,
    };
    //return this.http.get<any>(environment.URL_SUNAT+`?numruc=${ruc}&out=json`);
    //return this.http.get<any>(`/Rest/Sunat/DatosPrincipales?numruc=${ruc}&out=json`);
    return this.http
      .get(API_URL + '/search-ruc', {
        params: convertObjectToGetParams(request),
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      });
  }

  ConsultaCE(doc: string, type: string): Observable<any> {
    var request = {
      doc: doc,
      type: type
    };
    return this.http.get(API_URL + '/search-ce', {
      params: convertObjectToGetParams(request),
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  ConsultaCasilla(doc: string, type: string): Observable<any> {
    var request = {
      doc: doc,
      type: type
    };
    return this.http.get(API_URL + '/search-casilla', {
      params: convertObjectToGetParams(request),
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  ConsultaClaridad(doc: string): Observable<any> {
    return this.http.post<any>('', '', httpOptions);
  }

  CerrarSesion(): Observable<any> {
    return this.http
      .post<any>(API_URL + '/logout',"")
      .pipe(map((res) => res));
  }


  searchListuser(value : UserRequest) {
    this.fields.next(value);
  }
}
