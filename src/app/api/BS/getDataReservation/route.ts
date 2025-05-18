import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { Court } from '@/repository/entity/Court';
import { SlotTime } from '@/repository/entity/slot_time';
import { stadium } from '@/repository/entity/stadium';
import { In, Between } from 'typeorm';

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

    console.log("Received: userId =", userId, "bookingDate =", bookingDate);

    if (isNaN(userId) || !bookingDate) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid userId or bookingDate' },
        { status: 400 }
      );
    }

    const date = new Date(bookingDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid bookingDate format' },
        { status: 400 }
      );
    }

    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { success: false, message: 'Cannot select past date' },
        { status: 400 }
      );
    }

    return await getDbConnection(async (manager) => {
      const stadRepo = manager.getRepository(stadium);
      const stad = await stadRepo.findOne({ where: { user_id: userId } });
      if (!stad) {
        return NextResponse.json(
          { success: false, message: 'Stadium not found for user' },
          { status: 404 }
        );
      }

      const stadiumId = stad.stadium_id;

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

      const courtRepo = manager.getRepository(Court);
      const courts = await courtRepo.find({
        where: { stadiumId },
        select: ['id', 'courtId', 'stadiumId', 'start_time', 'end_time'],
      });

      if (courts.length === 0) {
        return NextResponse.json(
          { success: true, data: { courts: [] } },
          { status: 200 }
        );
      }

      console.log("Court IDs (court_id):", courts.map(c => c.id));
      console.log("Court Numbers (court_number):", courts.map(c => c.courtId));

      const slotTimeRepo = manager.getRepository(SlotTime);
      const slots = await slotTimeRepo.find({
        where: {
          court_id: In(courts.map((c) => c.id)),
          booking_date: Between(new Date(`${dateString}T00:00:00Z`), new Date(`${dateString}T23:59:59Z`)),
        },
        select: ['court_id', 'start_time', 'status_id'],
      });

      console.log("SlotTime data raw:", slots);

      // กลุ่มตาม court_number และรวม schedule จาก court_id
      const groupedCourts = courts.reduce((acc, court) => {
        const key = court.courtId; // ใช้ court_number เป็น key
        if (!acc[key]) {
          acc[key] = {
            courtNumber: court.courtId,
            courtIds: [court.id], // เก็บ court_id ที่เกี่ยวข้อง
            schedule: [],
          };
        } else {
          acc[key].courtIds.push(court.id);
        }
        return acc;
      }, {} as Record<number, { courtNumber: number; courtIds: number[]; schedule: { time: string; status: number | null }[] }>);

      // เพิ่ม schedule จาก timeSlots ของแต่ละ court_id
      Object.values(groupedCourts).forEach((court) => {
        court.courtIds.forEach((courtId) => {
          const courtData = courts.find(c => c.id === courtId);
          if (courtData && courtData.start_time && courtData.end_time) {
            const timeSlots = generateTimeSlots(courtData.start_time, courtData.end_time);
            const existingTimes = new Set(court.schedule.map(s => s.time));
            timeSlots.forEach(timeSlot => {
              if (!existingTimes.has(timeSlot)) {
                court.schedule.push({ time: timeSlot, status: null });
              }
            });
          }
        });
        court.schedule.sort((a, b) => a.time.localeCompare(b.time)); // เรียงเวลา
      });

      // อัปเดตสถานะจาก SlotTime
      Object.values(groupedCourts).forEach((court) => {
        const courtSlots = slots.filter((s) => court.courtIds.includes(s.court_id));
        court.schedule.forEach((slot, idx) => {
          const [startStr] = slot.time.split('-');
          const matchedSlot = courtSlots.find((s) => {
            const slotStartTime = s.start_time.split(':').slice(0, 2).join(':');
            return slotStartTime === startStr;
          });
          if (matchedSlot) {
            court.schedule[idx].status = matchedSlot.status_id;
            console.log(`Matched slot for court ${court.courtNumber} at ${startStr}: status_id = ${matchedSlot.status_id}`);
          } else {
            console.log(`No slot found for court ${court.courtNumber} at ${startStr} on ${dateString}`);
          }
        });
      });

      const courtData = Object.values(groupedCourts)
        .filter((court) => court.schedule.length > 0)
        .sort((a, b) => a.courtNumber - b.courtNumber);

      console.log("CourtData:", courtData);

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