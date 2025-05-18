export interface UpSlotTime {
  SlotTimeID: number;
  CourtId?: number; 
  BookingDate?: string;
  StartTime?: string; 
  EndTime?: string;
  StatusID?: number;
}

export interface SlotTimeResponseModel {
  status_code: number;
  status_message: string;
  data: UpSlotTime[];
  total: number;
}

export interface ResponseModel {
  status_code: number;
  status_message: string;
}