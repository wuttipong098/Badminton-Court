export interface Slot {
  CourtId: number;
  StartTime: string;
  EndTime: string;
  BookingDate?: string;
}

export interface SearchAccountParams {
  addmenuID?: number;
  UserID?: number;
  CourtId?: number; 
  StartTime?: string; 
  EndTime?: string; 
  TotalPrice?: number; 
  BookingDate?: string;
  StatusID?: number;
  Slots?: Slot[]; 
}

export interface CreateAccountParams {
  addmenuID?: number;
  UserID?: number;
  CourtId?: number; 
  StartTime?: string; 
  EndTime?: string; 
  TotalPrice?: number; 
  BookingDate?: string;
  StatusID?: number;
  Slots?: Slot[]; 
}

export interface DeleteAccountParams {
  addmenuID?: number;
}

