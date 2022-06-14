import { Box } from "./user";

export class UserRequest {
    search: string;
    filter: string;
    page  : number;
    count : number;
}

export class BoxRequest {
    box: Box = new Box();
}