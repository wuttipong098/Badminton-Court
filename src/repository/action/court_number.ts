import { getDbConnection } from '../db_connection';
import { CourtNumber } from '@/repository/entity/court_number';
import { SlotTime } from '@/repository/entity/slot_time';
import { Status } from '@/repository/entity/status';
import { SearchAccountParams } from '@/dto/request/court';
import { Equal } from 'typeorm';

export const findCourtDetails = async (params: SearchAccountParams): Promise<{ data: CourtNumber[] }> => {
  return await getDbConnection(async (manager) => {
    const where: any = {
      stadium_id: params.StadiumID ? Equal(Number(params.StadiumID)) : undefined,
      court_number: params.CourtNumber ? Equal(Number(params.CourtNumber)) : undefined,
    };

    const data = await manager.find(CourtNumber, {
      where,
      relations: ['slots', 'slots.status'],
    });

    if (params.BookingDate) {
      const bookingDateFormatted = params.BookingDate.split('/').reverse().join('-'); 
      data.forEach((courtItem) => {
        courtItem.slots = courtItem.slots?.filter((slot: SlotTime) => {
          const slotDate = slot.booking_date.toISOString().split('T')[0]; 
          return slotDate === bookingDateFormatted;
        }) || [];
      });
    }

    return { data };
  });
};