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
  Slots?: Slot[]; 
}