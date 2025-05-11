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
      const bookingDateFormatted = params.BookingDate.split('/').reverse().join('-'); // "YYYY-MM-DD" from "DD/MM/YYYY"
      data.forEach((courtItem) => {
        courtItem.slots = courtItem.slots?.filter((slot: SlotTime) => {
          // ใช้ type assertion เพื่อจัดการกรณีที่ booking_date อาจเป็น string
          const bookingDate = slot.booking_date as Date | string;
          const slotDate = bookingDate instanceof Date
            ? bookingDate.toISOString().split('T')[0]
            : typeof bookingDate === 'string'
            ? bookingDate.includes('/')
              ? bookingDate.split('/').reverse().join('-') // แปลง "DD/MM/YYYY" เป็น "YYYY-MM-DD"
              : bookingDate
            : '';
          return slotDate === bookingDateFormatted;
        }) || [];
      });
    }

    return { data };
  });
};