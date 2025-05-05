export interface CreateAccountParams {
  UserID?: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  Password?: string;
  PhoneNumber: number;
  Profile?: string | Buffer;
  RoleName?: string;
}