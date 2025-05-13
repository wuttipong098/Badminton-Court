import { getDbConnection } from '../db_connection';
import { SlotTime } from '@/repository/entity/slot_time';
import { CourtNumber } from '@/repository/entity/court_number';
import { SearchAccountParams } from '@/dto/request/allsearch';
import { Equal, In } from 'typeorm';

export const findStadiumBySlot = async (params: SearchAccountParams): Promise<{ data: CourtNumber[] }> => {
  return await getDbConnection(async (manager) => {
    // แปลง BookingDate จาก DD/MM/YYYY เป็น Date
    let bookingDate: Date | undefined;
    if (params.BookingDate) {
      const [day, month, year] = params.BookingDate.split('/');
      bookingDate = new Date(`${year}-${month}-${day}`);
      if (isNaN(bookingDate.getTime())) {
        return { data: [] }; // คืนผลลัพธ์ว่างถ้าวันที่ไม่ถูกต้อง
      }
    }

    // ค้นหา SlotTime ที่มี BookingDate, StartTime และ StatusID = 1
    const slotTimes = await manager.find(SlotTime, {
      where: {
        booking_date: bookingDate ? Equal(bookingDate) : undefined,
        start_time: params.StartTime ? Equal(params.StartTime) : undefined,
        status_id: Equal(1),
      },
      relations: ['court'],
    });

    // ดึง CourtID จาก SlotTime ที่พบ
    const courtIds = slotTimes.map((slot) => slot.court_id).filter((id) => id);

    if (courtIds.length === 0) {
      return { data: [] };
    }

    // ค้นหา CourtNumber จาก CourtID เพื่อดึง StadiumID โดยใช้ In
    const courts = await manager.find(CourtNumber, {
      where: {
        court_id: In(courtIds), // ใช้ In แทนการ map ด้วย Equal
      },
      select: ['court_id', 'stadium_id'],
    });

    return { data: courts };
  });
};