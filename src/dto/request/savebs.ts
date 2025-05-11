export interface TimeRange {
    start: string;
    end: string;
  }
  
  export interface SaveBookingSettingRequest {
    courtId: string | null;
    stadiumId?: number;
    price: number;
    promoPrice?: number;
    timeRanges: TimeRange[];
    paymentTime: number;
    userId: number;
  }
  