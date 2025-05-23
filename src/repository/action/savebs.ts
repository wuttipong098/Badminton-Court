import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';
import { stadium } from '@/repository/entity/stadium';
import { SlotTime } from '@/repository/entity/slot_time';
import { bookings } from '@/repository/entity/bookings';
import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { SaveBookingSettingResponse } from '@/dto/response/savebs';
import { In, LessThan, MoreThan } from 'typeorm';

// ฟังก์ชันช่วยสร้างสล็อตจาก start_time ถึง end_time (รองรับครึ่งชั่วโมง)
function generateSlotTimes(startTime: string, endTime: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const nextMinute = currentMinute + 30;
    const nextHour = currentHour + Math.floor(nextMinute / 60);
    const newMinute = nextMinute % 60;
    const start = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
    const end = `${nextHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}:00`;
    slots.push({ start, end });
    currentMinute = newMinute;
    if (currentMinute === 0) currentHour = nextHour;
  }

  return slots;
}

// ฟังก์ชันช่วยแปลงวันที่ให้เป็น string ในรูปแบบ YYYY-MM-DD
function ensureDateString(dateInput: Date | string): string {
  if (typeof dateInput === 'string') {
    return new Date(dateInput).toISOString().split('T')[0];
  }
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }
  throw new Error(`Invalid date format: ${dateInput}`);
}

export async function saveOrUpdateBookingSettingsRepo(
  data: SaveBookingSettingRequest
): Promise<SaveBookingSettingResponse> {
  const courtIdNum = Number(data.courtId);
  if (isNaN(courtIdNum)) {
    throw new Error('courtId ไม่ถูกต้อง');
  }

  return await getDbConnection(async (manager) => {
    const stadiums = await manager.findOne(stadium, {
      where: { user_id: data.userId },
    });

    if (!stadiums) {
      return {
        success: false,
        message: 'ไม่พบสนามของผู้ใช้งาน',
      };
    }

    const stadiumIdNum = stadiums.stadium_id;

    // ดึงข้อมูล Court เดิมทั้งหมดสำหรับ courtId, stadiumId, และ userId
    const courtRepo = manager.getRepository(Court);
    const existingCourts = await courtRepo.find({
      where: {
        courtId: courtIdNum,
        stadiumId: stadiumIdNum,
        userId: data.userId,
      },
      select: ['id', 'start_time', 'end_time'],
    });

    // สร้าง set ของช่วงเวลาที่ต้องการเก็บ (จาก data.timeRanges)
    const newTimeRanges = new Set(
      data.timeRanges.map(range => `${range.start}-${range.end}`)
    );

    // ลบ record ใน Court ที่ไม่อยู่ใน data.timeRanges
    const courtsToDelete = existingCourts.filter(court => {
      const currentRange = `${court.start_time}-${court.end_time}`;
      return !newTimeRanges.has(currentRange);
    });

    if (courtsToDelete.length > 0) {
      const courtIdsToDelete = courtsToDelete.map(c => c.id);
      console.log(`Deleting Court records with IDs: ${courtIdsToDelete}`);
      await courtRepo.delete({ id: In(courtIdsToDelete) });
    }

    // อัปเดตหรือเพิ่มข้อมูลในตาราง Court
    for (const range of data.timeRanges) {
      const existing = await manager.findOne(Court, {
        where: {
          courtId: courtIdNum,
          stadiumId: stadiumIdNum,
          userId: data.userId,
          start_time: range.start,
          end_time: range.end,
        },
      });

      if (existing) {
        existing.price = data.price.toString();
        existing.active = data.active ?? true;
        await manager.save(Court, existing);
      } else {
        const court = new Court();
        court.courtId = courtIdNum;
        court.stadiumId = stadiumIdNum;
        court.price = data.price.toString();
        court.time = `${range.start} - ${range.end}`;
        court.userId = data.userId;
        court.isBooked = 1; // เปลี่ยนเป็น 1 เพื่อให้โชว์สีเขียว
        court.active = data.active ?? true;
        court.start_time = range.start;
        court.end_time = range.end;

        await manager.save(Court, court);
      }
    }

    // ดึงข้อมูล Court ที่อัปเดตล่าสุด
    const updatedCourt = await courtRepo.find({
      where: { courtId: courtIdNum, stadiumId: stadiumIdNum },
      select: ['id', 'start_time', 'end_time'],
    });

    if (updatedCourt.length === 0) {
      return {
        success: false,
        message: 'ไม่พบข้อมูล Court หลังการอัปเดต',
      };
    }

    const slotTimeRepo = manager.getRepository(SlotTime);
    const bookingRepo = manager.getRepository(bookings);

    // สร้างสล็อตใหม่ตามช่วงเวลาใหม่
    const newSlotTimesMap = new Map<number, { start: string; end: string }[]>();
    updatedCourt.forEach(court => {
      newSlotTimesMap.set(court.id, generateSlotTimes(court.start_time, court.end_time));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    const defaultStatusId = 1;

    // ดึงสล็อตเก่าที่มีอยู่
    const existingSlots = await slotTimeRepo.find({
      where: { court_id: In(updatedCourt.map(c => c.id)) },
      select: ['slot_time_id', 'court_id', 'start_time', 'end_time', 'booking_date'],
    });

    console.log('Existing Slots:', existingSlots);

    // ดึงวันที่ที่มีการจองในอนาคต
    const bookedDates = await bookingRepo.createQueryBuilder('booking')
      .select('DISTINCT booking.booking_date')
      .where('booking.court_id IN (:...courtIds)', { courtIds: updatedCourt.map(c => c.id) })
      .andWhere('booking.booking_date >= :today', { today: today.toISOString().split('T')[0] })
      .getRawMany();

    console.log('Booked Dates:', bookedDates);

    const bookedDateStrings = bookedDates.map(b => {
      try {
        return ensureDateString(b.booking_date);
      } catch (error) {
        console.error(`Error converting booking_date: ${b.booking_date}`, error);
        return null;
      }
    }).filter((date): date is string => date !== null);

    console.log('Booked Date Strings:', bookedDateStrings);

    // วนลูปวันที่เพื่อจัดการสล็อต
    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      const isBooked = bookedDateStrings.includes(dateString);

      console.log(`Processing date: ${dateString}, isBooked: ${isBooked}`);

      for (const court of updatedCourt) {
        const newSlotTimes = newSlotTimesMap.get(court.id) || [];
        const slotsForDate = existingSlots.filter(s => {
          try {
            const slotDateString = ensureDateString(s.booking_date);
            return s.court_id === court.id && slotDateString === dateString;
          } catch (error) {
            console.error(`Error converting slot booking_date: ${s.booking_date}`, error);
            return false;
          }
        });

        console.log(`Slots for court ${court.id} on ${dateString}:`, slotsForDate);

        // ลบสล็อตเก่าที่ไม่อยู่ในช่วงใหม่
        const slotsToDelete = slotsForDate.filter(slot =>
          !newSlotTimes.some(newSlot => newSlot.start === slot.start_time && newSlot.end === slot.end_time)
        );

        console.log(`Slots to delete for court ${court.id} on ${dateString}:`, slotsToDelete);

        if (slotsToDelete.length > 0) {
          const slotIdsToDelete = slotsToDelete.map(s => s.slot_time_id);
          console.log(`Deleting slot_time_ids for court ${court.id}: ${slotIdsToDelete}`);
          await slotTimeRepo.delete({ slot_time_id: In(slotIdsToDelete) });
        }

        // เพิ่มสล็อตใหม่
        for (const slot of newSlotTimes) {
          const slotExists = slotsForDate.some(s => s.start_time === slot.start && s.end_time === slot.end);
          if (!slotExists) {
            const newSlot = slotTimeRepo.create({
              court_id: court.id,
              booking_date: new Date(dateString),
              start_time: slot.start,
              end_time: slot.end,
              status_id: defaultStatusId,
              created_date: new Date(),
              update_date: null,
            });
            console.log(`Creating new slot for court ${court.id} on ${dateString}:`, slot);
            await slotTimeRepo.save(newSlot);
          }
        }
      }
    }

    // ลบสล็อตเกิน 30 วัน
    await slotTimeRepo.delete({
      court_id: In(updatedCourt.map(c => c.id)),
      booking_date: MoreThan(endDate),
    });

    return {
      success: true,
      message: 'อัปเดต/เพิ่มการตั้งค่าการจองและจัดการ slot_time สำหรับวันที่ไม่มีจองเรียบร้อยแล้ว',
    };
  });
}