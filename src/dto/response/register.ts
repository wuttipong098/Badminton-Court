export interface User {
  UserID:number;
  FirstName: string;
  LastName: string;
  UserName: string;
  PhoneNumber: number;
  Profile?: string | Buffer;
  RoleName: string;
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