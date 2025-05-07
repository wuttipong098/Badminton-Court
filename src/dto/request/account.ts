export interface SearchAccountParams {
  UserID?: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  PhoneNumber?: string;
  Profile?: string | Buffer;
}

export interface UpdateAccountParams {
  UserID: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  PhoneNumber?: string;
  Profile?: string | null;  
}