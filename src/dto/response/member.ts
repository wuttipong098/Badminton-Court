export interface MemberList {
  StadiumID: number;
  StadiumName: string;
  PhoneNumber: string;
  Location?: string;
  ImageStadium?: string[];
  Situation: string;
  UserID: number;
  FirstName: string;
  LastName: string;

}

export interface MemberResponseModel {
  status_code: number;
  status_message: string;
  data: MemberList[];
  total: number;
}