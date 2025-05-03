export interface historys {
    HistoryID: number;
    UserID: number;
    BookingDate: string;
    StartTime: string;
    EndTime: string;
    StadiumName: string;
    CourtNumber: number;
  }
  
  export interface UserResponseModel {
    status_code: number;
    status_message: string;
    data: historys[];
    total: number;
  }
  
  export interface ResponseModel {
    status_code: number;
    status_message: string;
  }