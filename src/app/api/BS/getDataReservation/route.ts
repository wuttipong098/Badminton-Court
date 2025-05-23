import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { Court } from '@/repository/entity/Court';
import { SlotTime } from '@/repository/entity/slot_time';
import { stadium } from '@/repository/entity/stadium';
import { closeDate } from '@/repository/entity/closeDate';
import { In, Between } from 'typeorm';

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

      const closeDateRepo = manager.getRepository(closeDate);
      const closeDateData = await closeDateRepo.findOne({ where: { stadium_id: stadiumId } });
      if (closeDateData && closeDateData.closeDates) {
        try {
          const closeDates = JSON.parse(closeDateData.closeDates);
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
        order: { courtId: 'ASC', start_time: 'ASC' },
      });

      if (courts.length === 0) {
        return NextResponse.json(
          { success: true, data: { courts: [] } },
          { status: 200 }
        );
      }

      console.log("Court IDs (id):", courts.map(c => c.id));
      console.log("Court Numbers (courtId):", courts.map(c => c.courtId));
      console.log("Court Time Ranges:", courts.map(c => `${c.start_time}-${c.end_time}`));

      const slotTimeRepo = manager.getRepository(SlotTime);
      const slots = await slotTimeRepo.find({
        where: {
          court_id: In(courts.map((c) => c.id)),
          booking_date: Between(new Date(`${dateString}T00:00:00Z`), new Date(`${dateString}T23:59:59Z`)),
        },
        select: ['court_id', 'start_time', 'end_time', 'status_id'],
        order: { court_id: 'ASC', start_time: 'ASC' },
      });

      console.log("SlotTime data raw:", slots);

      // กลุ่มตาม court_number และสร้าง schedule จาก Court
      const groupedCourts = courts.reduce((acc, court) => {
        const key = court.courtId;
        if (!acc[key]) {
          acc[key] = {
            stadiumId: court.stadiumId,
            courtNumber: court.courtId,
            courtIds: [court.id],
            schedule: [],
          };
        }
        const time = `${court.start_time.split(':').slice(0, 2).join(':')}-${court.end_time.split(':').slice(0, 2).join(':')}`;
        acc[key].schedule.push({ time, status: 1, courtId: court.id }); // เริ่มต้น status: 1 (ว่าง)
        return acc;
      }, {} as Record<number, { stadiumId: number; courtNumber: number; courtIds: number[]; schedule: { time: string; status: number | null; courtId: number }[] }>);

      // อัปเดตสถานะจาก SlotTime
      Object.values(groupedCourts).forEach((court) => {
        court.schedule.forEach((slot) => {
          const [startStr] = slot.time.split('-');
          const courtId = slot.courtId;
          const matchedSlot = slots.find((s) => {
            const slotStartTime = s.start_time.split(':').slice(0, 2).join(':');
            return s.court_id === courtId && slotStartTime === startStr;
          });
          if (matchedSlot) {
            slot.status = matchedSlot.status_id;
            console.log(`Matched slot for court ${court.courtNumber} at ${slot.time} (court_id: ${courtId}): status_id = ${matchedSlot.status_id}`);
          } else {
            console.log(`No slot found for court ${court.courtNumber} at ${slot.time} (court_id: ${courtId}) on ${dateString}`);
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