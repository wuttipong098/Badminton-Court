export interface SearchImageSlip {
    StadiumID: number;
    ImageSlip?: string | Buffer;
}

export interface UserResponseModel {
    status_code: number;
    status_message: string;
    data: SearchImageSlip[];
    total: number;
}

export interface ResponseModel {
    status_code: number;
    status_message: string;
}