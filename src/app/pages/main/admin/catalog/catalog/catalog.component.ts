import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { CatalogService } from 'src/app/services/catalog.service';
import { FuncionesService } from 'src/app/utils/funciones.service';
import { NewCatalogComponent } from '../new-catalog/new-catalog.component';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  data: Data;
  pageEvent: PageEvent;
  textSearch: string;
  isLoading: boolean = false;
  displayedColumns: string[] = ['tipo', 'codigo', 'nombre', 'acciones'];

  constructor(private catalogService: CatalogService,
    private funcionesService: FuncionesService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.data = new Data();
    this.refreshTable('', 1, 5);
  }

  refreshTable(querySearch: string, page?: number, pageSize?: number) {
    this.isLoading = true;
    this.catalogService.paginateCatalog({
      search: querySearch,
      count: pageSize,
      page: page,
    }).subscribe(
      (res) => {
        if (res.success) {
          this.isLoading = false;
          this.data.count = res.count;
          this.data.recordsTotal = res.recordsTotal;
          this.data.items = res.data;
        }
      },
      (err) => {
        this.isLoading = true;
      }
    );
  }

  remove(data: any) {
    this.funcionesService
      .mensajeConfirmar('¿Desea eliminar al usuario?')
      .then((resp) => {
        this.catalogService.removeCatalog(data.id).subscribe((res) => {
          if (res.success) {
            this.funcionesService.mensajeOk('Catálogo eliminado correctamente');
            this.refreshTable(
              this.textSearch,
              this.pageEvent?.pageIndex || 1,
              this.pageEvent?.pageSize || 5
            );
          } else {
            this.funcionesService.mensajeError(
              'No se pudo eliminar al usuario'
            );
          }
        });
      })
      .catch((err) => { });
  }

  newCatalog() {
    this.dialog.open(NewCatalogComponent).afterClosed().subscribe(resp => {
      if (resp) {
        this.refreshTable(
          this.textSearch,
          this.pageEvent?.pageIndex || 1,
          this.pageEvent?.pageSize || 5
        );
      }
    })
  }
  edit(data: any) {
    this.dialog.open(NewCatalogComponent, { data }).afterClosed().subscribe(resp => {
      if (resp) {
        this.refreshTable(
          this.textSearch,
          this.pageEvent?.pageIndex || 1,
          this.pageEvent?.pageSize || 5
        );
      }
    })
  }
  searchByQuery() {
    this.refreshTable(this.textSearch, 1, 5);
  }
  pageChangeEvent(event) {
    this.refreshTable(this.textSearch, event.pageIndex + 1, event.pageSize);
  }
}

export class Data {
  success: boolean;
  recordsTotal: number;
  page: number;
  count: number;
  items: [];
}