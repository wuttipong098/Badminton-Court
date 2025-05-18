import { getDbConnection } from '../db_connection';
import { addmenu } from '@/repository/entity/addmenu';
import { CreateAccountParams, DeleteAccountParams, SearchAccountParams } from '@/dto/request/addmenu';
import { Equal } from 'typeorm';

export const insertBooking = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newBooking = new addmenu();
    newBooking.user_id = params.UserID!;
    newBooking.court_id = params.CourtId!;
    newBooking.start_time = params.StartTime!;
    newBooking.end_time = params.EndTime!;
    newBooking.total_price = params.TotalPrice!;
    newBooking.booking_date = params.BookingDate!;
    newBooking.status_id = 1; 
    newBooking.created_date = new Date();
    newBooking.update_date = null;

    const savedBooking = await manager.save(newBooking);
    return savedBooking.addmenu_id;
  });
};

export const findBookings = async (params: SearchAccountParams): Promise<{ data: addmenu[]; total: number }> => {
  return await getDbConnection(async (manager) => {
    const where: any = {
      addmenu_id: params.addmenuID ? Equal(Number(params.addmenuID)) : undefined,
      user_id: params.UserID ? Equal(Number(params.UserID)) : undefined,
      court_id: params.CourtId ? Equal(Number(params.CourtId)) : undefined,
      start_time: params.StartTime ? Equal(params.StartTime) : undefined,
      end_time: params.EndTime ? Equal(params.EndTime) : undefined,
      total_price: params.TotalPrice ? Equal(Number(params.TotalPrice)) : undefined,
      booking_date: params.BookingDate ? Equal(params.BookingDate) : undefined,
      status_id: params.StatusID ? Equal(Number(params.StatusID)) : undefined,
    };

    const total = await manager.count(addmenu, {
      where,
    });

    const data = await manager.find(addmenu, {
      where,
    });

    return { data, total };
  });
};

export const deleteBookingById = async (params: DeleteAccountParams) => {
  return await getDbConnection(async (manager) => {
    return await manager.delete(addmenu, { addmenu_id: params.addmenuID });
  });
};