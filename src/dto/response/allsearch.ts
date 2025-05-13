export interface allsearch {
  StadiumID: number;
}

export interface UserResponseModel {
  status_code: number;
  status_message: string;
  data: allsearch[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}