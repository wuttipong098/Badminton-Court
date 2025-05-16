import { SearchHistoryParams } from '@/dto/request/historys';
import { UserResponseModel, historys } from '@/dto/response/historys';
import * as bookingRepo from '@/repository/action/historys';

export async function getBookingHistory(params: SearchHistoryParams): Promise<UserResponseModel> {
  try {
    const bookingData = await bookingRepo.findBookingHistory(params);
    console.log('Booking History Data:', {
      page: params.page,
      pageSize: params.pageSize,
      dataLength: bookingData.data.length,
      total: bookingData.total,
    });

    // ตรวจสอบจำนวนข้อมูลที่คืนมา
    const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 5;
    if (bookingData.data.length > pageSize) {
      console.warn('Data exceeds pageSize, trimming to pageSize:', pageSize);
      bookingData.data = bookingData.data.slice(0, pageSize);
    }

    // คืนค่า response ตามโครงสร้าง UserResponseModel
    return {
      status_code: bookingData.status_code,
      status_message: bookingData.status_message,
      data: bookingData.data.map((item): historys => ({
        UserID: item.UserID,
        BookingDate: item.BookingDate,
        StartTime: item.StartTime,
        EndTime: item.EndTime,
        StadiumName: item.StadiumName,
        CourtNumber: item.CourtNumber,
        StatusID: item.StatusID,
      })),
      total: bookingData.total,
    };
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return {
      status_code: 500,
      status_message: 'Failed to fetch booking history',
      data: [],
      total: 0,
    };
  }
}