import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { Court } from '@/repository/entity/Court';
import { SlotTime } from '@/repository/entity/slot_time';
import { stadium } from '@/repository/entity/stadium';
import { In } from 'typeorm';

// ฟังก์ชันสร้าง timeSlots จาก start_time ถึง end_time (สล็อตละ 1 ชั่วโมง)
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  while (currentHour < endHour || (currentHour === endHour && startMinute < endMinute)) {
    const nextHour = currentHour + 1;
    const start = `${currentHour.toString().padStart(2, '0')}:00`;
    const end = `${nextHour.toString().padStart(2, '0')}:00`;
    slots.push(`${start}-${end}`);
    currentHour++;
  }

  return slots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get('userId'));
    const bookingDate = searchParams.get('bookingDate');

    console.log("Received: userId =", userId, "bookingDate =", bookingDate); // Debug log

    if (isNaN(userId) || !bookingDate) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid userId or bookingDate' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า bookingDate ถูกต้อง
    const date = new Date(bookingDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid bookingDate format' },
        { status: 400 }
      );
    }

    const dateString = date.toISOString().split('T')[0];

    // ตรวจสอบวันที่ในอดีต
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { success: false, message: 'Cannot select past date' },
        { status: 400 }
      );
    }

    return await getDbConnection(async (manager) => {
      // 1) หา stadiumId จาก userId
      const stadRepo = manager.getRepository(stadium);
      const stad = await stadRepo.findOne({ where: { user_id: userId } });
      if (!stad) {
        return NextResponse.json(
          { success: false, message: 'Stadium not found for user' },
          { status: 404 }
        );
      }

      const stadiumId = stad.stadium_id;

      // 2) ตรวจสอบ closeDates
      if (stad.closeDates) {
        try {
          const closeDates = JSON.parse(stad.closeDates);
          if (Array.isArray(closeDates) && closeDates.includes(dateString)) {
            return NextResponse.json(
              { success: false, message: 'วันที่เลือกเป็นวันหยุดสนาม', data: { courts: [] } },
              { status: 200 }
            );
          }
        } catch (e) {
          console.warn(`Failed to parse closeDates for user ${userId}:`, e);
        }
      }

      // 3) ดึงสนามทั้งหมด
      const courtRepo = manager.getRepository(Court);
      const courts = await courtRepo.find({
        where: { stadiumId },
        select: ['courtId', 'stadiumId', 'start_time', 'end_time'],
      });

      if (courts.length === 0) {
        return NextResponse.json(
          { success: true, data: { courts: [] } },
          { status: 200 }
        );
      }

      // 4) ดึงสล็อตสำหรับวันที่เลือก
      const slotTimeRepo = manager.getRepository(SlotTime);
      const slots = await slotTimeRepo.find({
        where: {
          court_id: In(courts.map((c) => c.courtId)),
          booking_date: new Date(dateString),
        },
        select: ['court_id', 'start_time', 'status_id'],
      });

      // 5) จัดกลุ่ม Courts ตาม courtId และรวม timeSlots
      const groupedCourts = courts.reduce((acc, court) => {
        const key = court.courtId;
        if (!court.start_time || !court.end_time) {
          if (!acc[key]) {
            acc[key] = {
              stadiumId: court.stadiumId,
              courtId: court.courtId,
              timeSlots: [],
              slots: [],
            };
          }
          return acc;
        }

        const timeSlots = generateTimeSlots(court.start_time, court.end_time);
        if (!acc[key]) {
          acc[key] = {
            stadiumId: court.stadiumId,
            courtId: court.courtId,
            timeSlots: timeSlots,
            slots: timeSlots.map(() => 1), // Default: ว่าง
          };
        } else {
          // รวม timeSlots (หลีกเลี่ยงการซ้ำ)
          const existingTimeSlots = acc[key].timeSlots;
          timeSlots.forEach((slot) => {
            if (!existingTimeSlots.includes(slot)) {
              acc[key].timeSlots.push(slot);
              acc[key].slots.push(1); // Default: ว่าง
            }
          });
        }
        return acc;
      }, {} as Record<number, { stadiumId: number; courtId: number; timeSlots: string[]; slots: number[] }>);

      // 6) อัปเดตสถานะสล็อตจาก SlotTime
      Object.values(groupedCourts).forEach((court) => {
        const courtSlots = slots.filter((s) => s.court_id === court.courtId);
        court.timeSlots.forEach((timeSlot, idx) => {
          const slotStart = `${timeSlot.split('-')[0]}:00`;
          const slot = courtSlots.find((s) => s.start_time === slotStart);
          if (slot) {
            court.slots[idx] = slot.status_id;
          }
        });
      });

      // 7) สร้าง response
      const courtData = Object.values(groupedCourts).sort(
        (a, b) => a.courtId - b.courtId
      );

      return NextResponse.json(
        { success: true, data: { courts: courtData } },
        { status: 200 }
      );
    });
  } catch (err: any) {
    console.error('❌ /api/BS/getDataReservation error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}