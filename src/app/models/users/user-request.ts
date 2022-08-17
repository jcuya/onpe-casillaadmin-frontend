import { Box } from "./user";

export class UserRequest {
    search: string;
    filter: string;
    page  : number;
    count : number;
    estado :string;
    fechaInicio: string;
    fechaFin : string;
}

export class BoxRequest {
    box: Box = new Box();
}