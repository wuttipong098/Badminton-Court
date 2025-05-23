export interface CreateAccountParams {
  UserID?: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  Password?: string;
  PhoneNumber?: string;
  Profile?: string | Buffer;
  RoleName?: string;
  Location?: string;
  StadiumName?: string;
  Image?: string[] | Buffer;
}