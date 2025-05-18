import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { stadium } from '@/repository/entity/stadium';
import { imageow } from '@/repository/entity/imageow';
import { Court } from '@/repository/entity/Court';
import { SlotTime } from '@/repository/entity/slot_time';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      stadiumId,
      userId,
      location,
      price,
      payment_time,
      courtImages,
      slipImages,
      closeDates,
    } = body;

    // 1) Validate input
    if (!stadiumId || !userId) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Missing stadiumId or userId' },
        { status: 400 }
      );
    }

    // ตรวจสอบ closeDates
    if (Array.isArray(closeDates)) {
      for (const date of closeDates) {
        if (new Date(date) < new Date()) {
          return NextResponse.json(
            { status_code: 400, status_message: 'Close dates cannot be in the past' },
            { status: 400 }
          );
        }
      }
    }

    await getDbConnection(async (manager) => {
      // 2) Find and update stadium
      const stadRepo = manager.getRepository(stadium);
      const stad = await stadRepo.findOne({
        where: { stadium_id: stadiumId, user_id: userId },
      });

      if (!stad) {
        throw new Error('Stadium record not found');
      }

      stad.location = location;
      stad.paymentTime = payment_time;
      stad.closeDates = closeDates && closeDates.length > 0 ? JSON.stringify(closeDates) : null;

      if (Array.isArray(slipImages) && slipImages.length > 0) {
        const base64 = slipImages[0];
        const [, payload] = base64.split(',');
        stad.image_slip = Buffer.from(payload, 'base64');
      } else {
        stad.image_slip = null;
      }

      await stadRepo.save(stad);

      // 3) Replace court images
      const imgRepo = manager.getRepository(imageow);
      await imgRepo.delete({ user_id: userId, stadium_id: stadiumId });

      if (Array.isArray(courtImages)) {
        for (const base64 of courtImages) {
          const payload = base64.includes(',') ? base64.split(',')[1] : base64;
          if (!payload) continue;
          const buffer = Buffer.from(payload, 'base64');

          const imgEnt = imgRepo.create({
            user_id: userId,
            stadium_id: stadiumId,
            image_stadium: buffer,
          });

          await imgRepo.save(imgEnt);
        }
      }

      // 4) อัปเดต price ในตาราง court
      const courtRepo = manager.getRepository(Court);
      await courtRepo.update(
        { stadiumId },
        { price: price } // อัปเดต price ให้ทุก court ที่มี stadiumId นี้
      );

      // 5) สร้างสล็อตใน slot_time
      const slotTimeRepo = manager.getRepository(SlotTime);

      // ดึง courtId, start_time, end_time
      const courts = await courtRepo.find({
        where: { stadiumId },
        select: ['id', 'start_time', 'end_time'],
      });

      if (courts.length === 0) {
        throw new Error('No courts found for this stadium');
      }

      // วันที่เริ่มและสิ้นสุด (30 วัน)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);

      // วันที่หยุด
      const closeDateStrings =
        closeDates && Array.isArray(closeDates)
          ? closeDates.map((d) => new Date(d).toISOString().split('T')[0])
          : [];

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

          // ข้ามวันที่หยุด
          if (closeDateStrings.includes(dateString)) {
            continue;
          }

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

      // 6) ลบสล็อตเกิน 30 วัน
      const courtIds = courts.map((c) => c.id);
      await slotTimeRepo.delete({
        court_id: In(courtIds),
        booking_date: new Date(endDate.toISOString().split('T')[0]),
      });
    });

    return NextResponse.json(
      { status_code: 200, status_message: 'บันทึกสำเร็จ!' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('❌ /api/BS/saveSetting error:', err.message || err);
    return NextResponse.json(
      { status_code: 500, status_message: 'Internal server error' },
      { status: 500 }
    );
  }
}