export interface User {
    ImownerID: number;
    UserID?: number;
    StadiumID?: number;
    ImageStadium?: string | Buffer;
}

export interface UserResponseModel {
    status_code: number;
    status_message: string;
    data: User[];
    total: number;
}

export interface ResponseModel {
    status_code: number;
    status_message: string;
}