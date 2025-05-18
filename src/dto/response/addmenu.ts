export interface AddMenu {
  addmenuID: number;
  UserID: number;
  CourtId: number;
  StartTime: string;
  EndTime: string;
  TotalPrice: number;
  BookingDate: string;
  StatusID?: number;
}

export interface AddMenuResponseModel {
  status_code: number;
  status_message: string;
  data: AddMenu[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}