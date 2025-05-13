import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';

type CourtData = {
  stadiumId: number;
  courtId: number;
  slots: number[];
  timeSlots: string[];
};

export const getCourtData = async (userId: number) => {
  return await getDbConnection(async (manager) => {
    // ดึงข้อมูล Court ทั้งหมดที่ active
    const courts = await manager.find(Court, {
  where: {
    active: true,
    userId: userId,
  },
  });

    // ดึงเวลาทั้งหมดจากสนามทั้งหมด (ไม่ซ้ำ)
    const timeList = courts.map(c => c.start_time);
    const timeSlots = [...new Set(timeList)].sort();

    // จัดกลุ่มตาม stadiumId + courtId
    const grouped = courts.reduce((acc, court) => {
      const existing = acc.find(
        c => c.stadiumId === court.stadiumId && c.courtId === court.courtId
      );
      if (existing) {
        existing.slots.push(court.isBooked);
        existing.timeSlots.push(court.start_time);
      } else {
        acc.push({
          stadiumId: court.stadiumId,
          courtId: court.courtId,
          slots: [court.isBooked],
          timeSlots: [court.start_time],
        });
      }
      return acc;
    }, [] as CourtData[]);

    // จัดเรียงเวลาและสถานะการจองตามลำดับเวลา
    grouped.forEach(court => {
      const zipped = court.timeSlots.map((t, i) => ({ time: t, booked: court.slots[i] }));
      const sorted = zipped.sort((a, b) => a.time.localeCompare(b.time));
      court.timeSlots = sorted.map(s => s.time);
      court.slots = sorted.map(s => s.booked);
    });

    return {
      courts: grouped,
      timeSlots,
    };
  });
};
