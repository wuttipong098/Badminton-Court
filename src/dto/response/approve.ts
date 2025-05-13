export interface User {
    RegisterID?: number;
    FirstName?: string;
    LastName?: string;
    UserName?: string;
    StadiumName?: string;
    Location?: string;
    PhoneNumber: string;
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