export class User {
  name: string;
  organization: string;
  doc: string;
  doc_type?: string;
  estate_inbox?:string;
  enAtencion ?: boolean;
  enAtencionPor: boolean;
}

export class Box {
  docType?: string;
  doc?: string;
  email?: string;
  cellphone?: string;
  address?: string;
  acreditation_type?: string;
  pdf_resolution: File;
  pdf_creation_solicitude: File;
  pdf_agree_tos: File;
  pdf_terminos: File;
}

export class TypeAccreditation {
  code: string;
  value: string;
}


export class UserDetail {
  inbox_id : string;
  email : string;
  cellphone : string;
  ubigeo : string;
  address : string;
  user : _User = new _User();
}


export class _User{
  name : string = "";
    lastname : string = "";
}