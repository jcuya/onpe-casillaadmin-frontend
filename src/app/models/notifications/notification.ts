export class Notification {
    id                ?:string;
    expedient         ?:string;
    inbox_doc         ?:string;
    inbox_name        ?:string;
    organization_name ?:string;
    received_at       ?:string;
    read_at           ?:string;
}

export class SendNotification {
    docType  ?: string;
    doc      ?: string;
    name     ?: string;
    expedient?: string;
    message  ?: string;
    file1    ?: File[];
    // file2    ?: string;
    // file3    ?: string;
}
export class TypeDocument {
	id   : string;
	value: string;
}
export class Filters {
    id   : string;
	value: string;
}

export class Procedure {
    code : string;
    value: string;
}


export class ModeloResponse{
    success: boolean;
    message: string;
}

export class attachment{

    name :string;
    url : string;
}


export class notificationRequest{
    id: string;
}
export class notification{
    id              : string;
    expedient       : string;
    notifier_area   : string;
    received_at     : string;
    read_at         : string;
    message         : string;
    attachments     : attachment[];
    automatic       : boolean;
    created_at       : string;
    inbox_name      : string;
    inbox_doc       : string;
}