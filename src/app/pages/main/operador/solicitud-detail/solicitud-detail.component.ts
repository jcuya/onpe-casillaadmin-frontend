import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FuncionesService } from 'src/app/utils/funciones.service';

@Component({
  selector: 'app-solicitud-detail',
  templateUrl: './solicitud-detail.component.html',
  styleUrls: ['./solicitud-detail.component.scss']
})
export class SolicitudDetailComponent implements OnInit {
    load = false;

    id
     
     data: any = {};
     representante : any ={};

    imageURlss : any="" ;

  constructor( private usuarioService: UserService,
    private router: ActivatedRoute,
    private funcionesService: FuncionesService,
    public domSanitizer : DomSanitizer ) { 
      this.id = this.router.snapshot.paramMap.get('id');
     
    }

  ngOnInit(): void {

    this.getDataUser();
  }



  async getDataUser(){
    
    const info =  await this.usuarioService.getUserDetail(this.id).toPromise();
    if(!info) return;
    console.log("informacion", info)
    this.data = info.user;
    this.representante = this.data.representante;
    console.log("DATA-INFO", this.data)
    if(this.data.imageDNI){
    this.imageURlss=  this._arrayBufferToBase64(this.data.imageDNI)
    }
  }


  download = async (path: string, name: string) => {
    try {
      this.load = true;
      const file = await this.usuarioService.download(path).toPromise();

      console.log("archivoo", file)
      this.funcionesService.downloadFile(file, name);
      this.load = false;
    } catch (error) {
      this.load = false;

    }
   
  }


  ViewImg(attachments): string{
    
    let typeArray = new Uint8Array(attachments.data)
    const STRING_CHAR = String.fromCharCode.apply(null, typeArray);
    let base64String = btoa(STRING_CHAR);
   
   let info =    'data:image/jpeg;base64,' + base64String;
    return info;
      //this.domSanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,'+ base64String);
  }

  _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer.data );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
       binary += String.fromCharCode( bytes[ i ] );
    }
    let info =    'data:image/jpeg;base64,' +window.btoa( binary );
    return info;
  }

}
