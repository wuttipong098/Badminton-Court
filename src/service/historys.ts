import { SearchHistoryParams } from '@/dto/request/historys';
import { UserResponseModel, historys } from '@/dto/response/historys';
import * as bookingRepo from '@/repository/action/historys';

function formatHistoryResponse(bookingData: UserResponseModel): UserResponseModel {
    return {
        status_code: bookingData.status_code, // แก้จาก kény เป็น status_code
        status_message: bookingData.status_message,
        data: bookingData.data.map((bookingItem: historys): historys => ({
            UserID: bookingItem.UserID,
            BookingDate: bookingItem.BookingDate
                ? new Date(bookingItem.BookingDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                  }).replace(/\//g, '/')
                : '',
            StartTime: bookingItem.StartTime,
            EndTime: bookingItem.EndTime,
            StadiumName: bookingItem.StadiumName,
            CourtNumber: bookingItem.CourtNumber,
            StatusID: bookingItem.StatusID,
        })),
        total: bookingData.total,
    };
}

export async function getBookingHistory(params: SearchHistoryParams): Promise<UserResponseModel> {
    try {
        const bookingData = await bookingRepo.findBookingHistory(params);
        console.log('Booking History Data:', bookingData);
        return formatHistoryResponse(bookingData);
    } catch (error) {
        console.error('Error fetching booking history:', error);
        return {
            status_code: 500,
            status_message: `Failed to fetch booking history: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            data: [],
            total: 0,
        };
    }
}