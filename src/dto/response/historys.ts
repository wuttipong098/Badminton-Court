export interface historys {
  UserID: number;
  BookingDate: string;
  StartTime: string;
  EndTime: string;
  StadiumName: string;
  CourtNumber: number;
  StatusID: number;
}

export interface UserResponseModel {
  status_code: number;
  status_message: string;
  data: historys[];
  total: number;
}