export interface TimeSlot {
  StartTime: string;
  EndTime: string;
  StatusName: string;
  Price?: number;
}

export interface court {
  CourtID: number;
  StadiumID: number;
  CourtNumber: number;
  PriceHour: number;
  Active: string;
  BookingDate: string;
  TimeSlots: TimeSlot[]; 
}

export interface UserResponseModel {
  status_code: number;
  status_message: string;
  data: court[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}