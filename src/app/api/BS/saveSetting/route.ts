import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { stadium } from '@/repository/entity/stadium';
import { imageow } from '@/repository/entity/imageow';
import { Court } from '@/repository/entity/Court';
import { closeDate } from '@/repository/entity/closeDate';

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

      if (Array.isArray(slipImages) && slipImages.length > 0) {
        const base64 = slipImages[0];
        const [, payload] = base64.split(',');
        stad.image_slip = Buffer.from(payload, 'base64');
      } else {
        stad.image_slip = null;
      }

      await stadRepo.save(stad);

      // 3) จัดการ closeDates
      const closeDateRepo = manager.getRepository(closeDate);
      const existingCloseDate = await closeDateRepo.findOne({
        where: { stadium_id: stadiumId },
      });

      if (existingCloseDate) {
        // อัปเดต
        existingCloseDate.closeDates = closeDates && closeDates.length > 0 ? JSON.stringify(closeDates) : null;
        await closeDateRepo.save(existingCloseDate);
      } else {
        // สร้างใหม่
        const newCloseDate = closeDateRepo.create({
          stadium_id: stadiumId,
          closeDates: closeDates && closeDates.length > 0 ? JSON.stringify(closeDates) : null,
        });
        await closeDateRepo.save(newCloseDate);
      }

      // 4) Replace court images
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

      // 5) อัปเดต price ในตาราง court
      const courtRepo = manager.getRepository(Court);
      await courtRepo.update(
        { stadiumId },
        { price: price } // อัปเดต price ให้ทุก court ที่มี stadiumId นี้
      );
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