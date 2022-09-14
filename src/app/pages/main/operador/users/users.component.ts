import { DatePipe } from '@angular/common';
import { Route } from '@angular/compiler/src/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserData } from 'src/app/models/users/user-data';
import { UserRequest } from 'src/app/models/users/user-request';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UserService } from 'src/app/services/user.service';
import { Profile } from 'src/app/transversal/enums/global.enum';
import { FuncionesService } from 'src/app/utils/funciones.service';
import { EditUserComponent } from '../../user/edit-user/edit-user.component';
import { NewUserComponent } from '../../user/new-user/new-user.component';

interface Filtro {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, AfterViewInit {
  userRequest: UserRequest;
  userData: UserData;
  filterSelected: string = '0';
  textSearch: string = '';
  txtestado : string =''
  txtfechaini : string = '';
  txtfechafin : string = '';
  ordenFec : string = 'asc';
  tamanoPaginado: number = 100;
  listReadyCheck: boolean;
  pageEvent: PageEvent;
  toDay = new Date();
  dateMax ="";
  subscription: Subscription;

  listEstados = [
    {name: "- TODOS -", value:""},
    {name: "APROBADO", value:"APROBADO"},
    {name: "DESAPROBADO", value:"DESAPROBADO"},
    {name: "REGISTRO INTERNO", value:"REGISTRO INTERNO"},
    {name: "PENDIENTE", value:"PENDIENTE"}
  ]

  constructor(
    private route: Router,
    private userService: UserService,
    private funcionesService: FuncionesService,
    private paginator: MatPaginatorIntl,
    private seguridadService: SeguridadService,
    public dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    this.userData = new UserData();
    this.paginator.itemsPerPageLabel = 'Registros por página';
    this.paginator.nextPageLabel = 'Página siguiente';
    this.paginator.previousPageLabel = 'Página anterior';
    this.paginator.getRangeLabel = this.rangoPaginacion;
    this.dateMax = this.datePipe.transform(this.toDay, "yyyy-MM-dd");

  }

  ngOnInit(): void {

     this.loadUsers('', 1, this.tamanoPaginado,'','','','asc');
  }



  ngAfterViewInit(): void {
    setTimeout(() => {
  
      this.subscription = this.userService.fieldsSearch.subscribe(value => {
        if(value != null) {
          // this.textSearch = value.search;
          // this.page = value.page;
          // this.pageSize = value.filter;
          // if(this.pageIndex == 1 && this.pageSize == 5) {
          //   this.initPage.firstPage();
          // }
          // else {
          //   this.initPage.pageIndex = this.pageIndex - 1;
          //   this.initPage.pageSize = this.pageSize;
          // }
          this.cleanSearch();
        } else {
          // this.resetValores();
          // this.initPage.firstPage();
          // this.loadUsers('', this.pageIndex, this.pageSize);
        }
      });
    });
  }








  loadUsers(uerySearch: string, page?: number, pageSize?: number, estado ?:string, fechaini ?:string , fechafin ?: string, ordenFec ?: string) {
    this.listReadyCheck = false;
    this.userRequest = new UserRequest();
    this.userRequest.search = uerySearch;
    this.userRequest.page = page;
    this.userRequest.count = pageSize;

    this.userRequest.estado = estado;
    this.userRequest.fechaInicio = fechaini;
    this.userRequest.fechaFin = fechafin;
    this.userRequest.ordenFec = ordenFec;
    const promesa = this.esAdministrador && this.esVentanadeCasillas == false ? this.userService.ListUsers(this.userRequest) :
      this.userService.GetUsers(this.userRequest);
      promesa.subscribe(
        (res) => {
          if (res.success) {
            this.listReadyCheck = true;
            this.userData = res;
           
  
            this.userData.Items.map(res =>{
              if(res.estate_inbox === ""){
                res.estate_inbox = "Registro interno"
              }
            })
          }
        },
        (err) => {
          console.log('Problemas del servicio', err);
        }
      );
  }
  searchByQuery() {
    this.loadUsers(this.textSearch, 1, this.tamanoPaginado, this.txtestado, this.txtfechaini, this.txtfechafin, this.ordenFec);
  }
  deleteUser(user: any) {
    this.funcionesService
      .mensajeConfirmar('¿Desea eliminar el registro?')
      .then((resp) => {
        this.userService.delete(user.doc_type, user.doc).subscribe((res) => {
          if (res.success) {
            this.funcionesService.mensajeOk('registro eliminado correctamente');

            this.loadUsers(
              this.textSearch,
              this.pageEvent?.pageIndex || 1,
              this.pageEvent?.pageSize || this.tamanoPaginado
            );
          } else {
            this.funcionesService.mensajeError(
              'No se pudo eliminar el registro'
            );
          }
        });
      })
      .catch((err) => { });
  }
  get esVentanadeCasillas() {
    return this.route.url.toString().indexOf('list-boxes') !== -1;
  }
  get esAdministrador() {
    const typeProfile = this.seguridadService.getUserProfile();
    return typeProfile === Profile.Administrador;
  }

  get esEvaluador() {
    const typeProfile = this.seguridadService.getUserProfile();
    return typeProfile === Profile.Evaluator;
  }
  get esRegistrador() {
    const typeProfile = this.seguridadService.getUserProfile();
    return typeProfile === Profile.RegistryOperator;
  }

  getColor(name: string) {
    return this.funcionesService.colorLetter(name);
  }

  redirectDetail(user){
    this.route.navigate(['/main/operador/solicitud-detalle',user.id]);
  }
  redirectDetailRegCasilla(user){
    this.route.navigate(['/main/operador/solicitud-detalle-valid',user.id]);
  }

  pageChangeEvent(event) {
    this.loadUsers(this.textSearch, event.pageIndex + 1, event.pageSize,this.txtestado, this.txtfechaini, this.txtfechafin, this.ordenFec);
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

  newUser() {

    if (this.esVentanadeCasillas) {
      this.route.navigate(['/main/operador/nueva-casilla']);
    } else {
      const component = this.dialog.open(NewUserComponent, {
        disableClose: true,
        data: null,
      });

      component.afterClosed().subscribe(resp => {
        if (resp) {
          this.loadUsers(this.textSearch, this.pageEvent?.pageIndex || 1, this.pageEvent?.pageSize || this.tamanoPaginado);
        }
      })
    }
  }

  editUser(user) {
    const component = this.dialog.open(NewUserComponent, {
      disableClose: true,
      data: user,
    });
    component.afterClosed().subscribe(resp => {
      if (resp) {
        this.funcionesService.mensajeOk("El registro fue actualizado correctamente");
        this.loadUsers(this.textSearch, this.pageEvent?.pageIndex || 1, this.pageEvent?.pageSize || this.tamanoPaginado);
      }
    })
  }
  
 async editCasilla(user) {
  console.log("Esto es lo que llega en edit user", user)
    const component = this.dialog.open(EditUserComponent, {
      disableClose: true,
      //data: user.id,
      data: user,
    });
    component.afterClosed().subscribe(resp => {
      if (resp) {
        this.funcionesService.mensajeOk("El registro fue actualizado correctamente");
        this.loadUsers(this.textSearch, this.pageEvent?.pageIndex || 1, this.pageEvent?.pageSize || this.tamanoPaginado);
      }
    })
  }

  handleVerCasilla(user){
    /*if((this.esAdministrador || this.esRegistrador) && !this.esVentanadeCasillas){
      this.route.navigate(['/main/view-box',user.id]);
    }*/
    this.route.navigate(['/main/view-box',user.id]);
  }

  cleanSearch(){
    this.loadUsers('', 1, this.tamanoPaginado,'','', '','asc');
    this.cleanInputs();
  }

  cleanInputs(){
    this.textSearch = "";
    this.txtestado = "";
    this.txtfechaini = "";
    this.txtfechafin = "";
    this.ordenFec = "asc";

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
}
