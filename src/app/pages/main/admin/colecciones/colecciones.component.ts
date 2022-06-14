import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PopFiltroComponent} from "./pop-filtro/pop-filtro.component";

export interface DialogData {
  animal: string;
  name: string;
}

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-colecciones',
  templateUrl: './colecciones.component.html',
  styleUrls: ['./colecciones.component.scss']
})
export class ColeccionesComponent implements OnInit {

  constructor(
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  }
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  //
  colFiltro() {
    const popDetalle = this.dialog.open(PopFiltroComponent, {
        width: '80%',
        maxWidth: '600px',
        disableClose: false
    })
  }
  //

}


