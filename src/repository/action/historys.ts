import { getDbConnection } from '../db_connection';
import { bookings } from '@/repository/entity/bookings';
import { UserResponseModel, historys } from '@/dto/response/historys';
import { Equal } from 'typeorm';

export interface SearchHistoryParams {
    UserID: number;
    BookingDate?: string;
    StatusID?: number;
    Page?: number;
    PageSize?: number;
}

export const findBookingHistory = async (params: SearchHistoryParams): Promise<UserResponseModel> => {
    return await getDbConnection(async (manager) => {
        const where: any = {
            user_id: Equal(Number(params.UserID)),
            status_id: params.StatusID ? Equal(Number(params.StatusID)) : undefined,
        };

        if (params.BookingDate) {
            const bookingDateFormatted = params.BookingDate.split('/').reverse().join('-');
            where.booking_date = Equal(bookingDateFormatted);
        }

        const page = params.Page || 1;
        const pageSize = params.PageSize || 10;
        const skip = (page - 1) * pageSize;

        const [bookingData, total] = await manager.findAndCount(bookings, {
            where,
            relations: ['court', 'court.stadium'], // ตรวจสอบว่า court และ court.stadium มี relation ใน entity
            skip,
            take: pageSize,
            order: { booking_date: 'DESC', start_time: 'ASC' },
        });

        const data: historys[] = bookingData.map((booking) => ({
            UserID: booking.user_id,
            BookingDate: booking.booking_date,
            StartTime: booking.start_time,
            EndTime: booking.end_time,
            StadiumName: booking.court?.stadium?.stadium_name || '', // ปลอดภัยจาก null/undefined
            CourtNumber: booking.court?.court_number || 0,
            StatusID: booking.status_id,
        }));

        return {
            status_code: 200,
            status_message: 'Success',
            data,
            total,
        };
    });
};