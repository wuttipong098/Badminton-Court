import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';
import { stadium } from '@/repository/entity/stadium';
import { SlotTime } from '@/repository/entity/slot_time';
import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { SaveBookingSettingResponse } from '@/dto/response/savebs';
import { In } from 'typeorm';

// ฟังก์ชันช่วยสร้างสล็อตจาก start_time ถึง end_time (สล็อตละ 1 ชั่วโมง)
function generateSlotTimes(startTime: string, endTime: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  while (currentHour < endHour || (currentHour === endHour && startMinute < endMinute)) {
    const nextHour = currentHour + 1;
    const start = `${currentHour.toString().padStart(2, '0')}:00:00`;
    const end = `${nextHour.toString().padStart(2, '0')}:00:00`;
    slots.push({ start, end });
    currentHour++;
  }

  return slots;
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
        // ✅ แก้ไขข้อมูลเดิม
        existing.price = data.price.toString();
        existing.active = data.active ?? true;
        await manager.save(Court, existing);
      } else {
        // ➕ เพิ่มใหม่หากไม่มี
        const court = new Court();
        court.courtId = courtIdNum;
        court.stadiumId = stadiumIdNum;
        court.price = data.price.toString();
        court.time = `${range.start} - ${range.end}`;
        court.userId = data.userId;
        court.isBooked = 1;
        court.active = data.active ?? true;
        court.start_time = range.start;
        court.end_time = range.end;

        await manager.save(Court, court);
      }
    }

    // เพิ่มส่วนสร้าง slot_time โดยใช้ข้อมูลจาก Court ที่บันทึก
    const courtRepo = manager.getRepository(Court);
    const slotTimeRepo = manager.getRepository(SlotTime);

    // ดึงข้อมูล Court ที่เพิ่งบันทึก
    const courts = await courtRepo.find({
      where: { courtId: courtIdNum, stadiumId: stadiumIdNum },
      select: ['id', 'start_time', 'end_time'],
    });

    if (courts.length === 0) {
      return {
        success: false,
        message: 'ไม่พบข้อมูล Court สำหรับการสร้าง slot_time',
      };
    }

    // วันที่เริ่มและสิ้นสุด (30 วัน)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    const defaultStatusId = 1; // ว่าง

    // สร้างสล็อตสำหรับแต่ละ court
    for (const court of courts) {
      const courtId = court.id;
      if (!court.start_time || !court.end_time) {
        console.warn(`Court ${courtId} missing start_time or end_time`);
        continue;
      }

      // สร้างสล็อตจาก start_time ถึง end_time
      const slotTimes = generateSlotTimes(court.start_time, court.end_time);

      for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];

        // ตรวจสอบสล็อต
        const existingSlots = await slotTimeRepo.find({
          where: {
            court_id: courtId,
            booking_date: new Date(dateString),
          },
        });

        for (const slot of slotTimes) {
          const slotExists = existingSlots.some(
            (s) => s.start_time === slot.start && s.end_time === slot.end
          );

          if (!slotExists) {
            const newSlot = slotTimeRepo.create({
              court_id: courtId,
              booking_date: new Date(dateString),
              start_time: slot.start,
              end_time: slot.end,
              status_id: defaultStatusId,
              created_date: new Date(),
              update_date: null,
            });

            await slotTimeRepo.save(newSlot);
          }
        }
      }
    }

    // ลบสล็อตเกิน 30 วัน
    const courtIds = courts.map((c) => c.id);
    await slotTimeRepo.delete({
      court_id: In(courtIds),
      booking_date: new Date(endDate.toISOString().split('T')[0]),
    });

    return {
      success: true,
      message: 'อัปเดต/เพิ่มการตั้งค่าการจองและสร้าง slot_time เรียบร้อยแล้ว',
    };
  });
}