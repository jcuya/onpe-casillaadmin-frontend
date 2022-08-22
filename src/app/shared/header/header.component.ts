import {Component, OnInit} from '@angular/core';
import {SeguridadService} from '../../services/seguridad.service';
import {Usuario} from '../../models/Usuario';
import { UserService } from 'src/app/services/user.service';

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
    private seguridadService: SeguridadService,
    private userService : UserService
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
    this.userService.CerrarSesion().subscribe(
      (res) => {
        if (res.success) {
          this.seguridadService.cerrarSesion();
        } else {
        return;
        }
      },
      (err) => {
        console.log('Problemas del servicio', err);
      }
    );
  }
}
