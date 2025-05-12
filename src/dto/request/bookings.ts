export interface Slot {
  CourtId: number;
  StartTime: string;
  EndTime: string;
}

export interface CreateAccountParams {
  BookingId?: number;
  UserID?: number;
  CourtId?: number; 
  StartTime?: string; 
  EndTime?: string; 
  TotalPrice?: number; 
  StatusID?: number;
  BookingDate?: string;
  MoneySlip?: string | Buffer;
  Slots?: Slot[]; 
}

export interface UpdateAccountParams {
  SlotTimeID: number;
  CourtId?: number; 
  BookingDate?: string;
  StartTime?: string; 
  EndTime?: string;
  StatusID?: number;
}
