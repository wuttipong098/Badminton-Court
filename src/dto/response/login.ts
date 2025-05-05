export interface login {
  UserID: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  PhoneNumber: string;
  Profile?: string | Buffer;
  RoleName?: string; 
}

export interface loginPageResponseModel {
  status_code: number;
  status_message: string;
  data: login[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}