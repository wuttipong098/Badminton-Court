import { getDbConnection } from '../db_connection';
import { bookings } from '../entity';
import { CreateAccountParams } from '@/dto/request/bookings';

export const insertBooking = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newBooking = new bookings();
    newBooking.user_id = params.UserID || 0;
    newBooking.court_id = params.CourtId || 0;
    newBooking.start_time = params.StartTime ? params.StartTime.slice(0, 5) : '';
    newBooking.end_time = params.EndTime ? params.EndTime.slice(0, 5) : '';
    newBooking.total_price = params.TotalPrice || 0;
    newBooking.status_id = params.StatusID || 0;
    newBooking.booking_date = params.BookingDate || '';
    newBooking.created_date = new Date();
    newBooking.update_date = null;

    const savedBooking = await manager.save(newBooking);

    return {
      BookingId: savedBooking.booking_id,
      UserID: savedBooking.user_id,
      CourtId: savedBooking.court_id,
      StartTime: savedBooking.start_time ? savedBooking.start_time.slice(0, 5) : '',
      EndTime: savedBooking.end_time ? savedBooking.end_time.slice(0, 5) : '',
      TotalPrice: savedBooking.total_price,
      StatusID: savedBooking.status_id,
      BookingDate: savedBooking.booking_date,
    };
  });
};

export const findBookingById = async (bookingId: number) => {
  return await getDbConnection(async (manager) => {
    const booking = await manager.findOne(bookings, { where: { booking_id: bookingId } });
    if (booking) {
      return {
        ...booking,
        start_time: booking.start_time ? booking.start_time.slice(0, 5) : '',
        end_time: booking.end_time ? booking.end_time.slice(0, 5) : '',
      };
    }
    return null;
  });
};

export const findBookings = async (params: any) => {
  return await getDbConnection(async (manager) => {
    const [data, total] = await manager.findAndCount(bookings, { where: params });
    const formattedData = data.map((booking) => ({
      ...booking,
      start_time: booking.start_time ? booking.start_time.slice(0, 5) : '',
      end_time: booking.end_time ? booking.end_time.slice(0, 5) : '',
    }));
    return { total, data: formattedData };
  });
};