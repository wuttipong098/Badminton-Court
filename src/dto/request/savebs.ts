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
    isBooked: number;
    userId: number;
    active: boolean;
    startTime: string;
    endTime: string;
  }
  