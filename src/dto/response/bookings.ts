export interface Bookings {
  BookingId: number;
  UserID: number;
  CourtId: number;
  StartTime: string;
  EndTime: string;
  TotalPrice: number;
  StatusID: number;
  BookingDate: string;
}

export interface UserResponseModel {
  status_code: number;
  status_message: string;
  data: Bookings[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}