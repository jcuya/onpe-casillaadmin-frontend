import {Component, OnInit} from '@angular/core';
import {SeguridadService} from '../../services/seguridad.service';
import {Usuario} from '../../models/Usuario';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  existeSession: boolean;
  usuario: Usuario = new Usuario();
  userName: string;

  constructor(
    private seguridadService: SeguridadService
  ) {

  }

  async ngOnInit() {
    this.existeSession = await this.seguridadService.verificarSesion();
    this.getUserName();
  }

  getUserName() {
    let name =  this.seguridadService.getUserName();
    let lastName =  this.seguridadService.getUserLastName();
    let firstName = name.split(' ');
    let surname = lastName.split(' ');
    this.userName = firstName[0] + ' ' + surname[0];
  }

  cerrarSession() {
    this.seguridadService.cerrarSesion();
  }
}
