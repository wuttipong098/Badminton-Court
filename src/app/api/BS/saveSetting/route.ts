import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { stadium } from '@/repository/entity/stadium';
import { bookingRule } from '@/repository/entity/bookingRule';
import { imageow } from '@/repository/entity/imageow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      stadiumId,
      userId,
      location,
      bookingRules,
      courtImages,
      slipImages
    } = body;

    // 1) Validate input
    if (!stadiumId || !userId) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Missing stadiumId or userId' },
        { status: 400 }
      );
    }

    await getDbConnection(async (manager) => {
      //
      // 2) Find and update stadium
      //
      const stadRepo = manager.getRepository(stadium);
      const stad = await stadRepo.findOne({
        where: { stadium_id: stadiumId, user_id: userId }
      });

      if (!stad) {
        throw new Error('Stadium record not found');
      }

      stad.location = location;

      // ✅ แปลงภาพสลิปภาพแรกเป็น Buffer
      if (Array.isArray(slipImages) && slipImages.length > 0) {
        const base64 = slipImages[0];
        const [, payload] = base64.split(',');
        stad.image_slip = Buffer.from(payload, 'base64');
      } else {
        stad.image_slip = null;
      }

      await stadRepo.save(stad);

      //
      // 3) Replace booking rules
      //
      const ruleRepo = manager.getRepository(bookingRule);
      await ruleRepo.delete({ user_id: userId });

      if (Array.isArray(bookingRules)) {
        for (const rule of bookingRules) {
          if (!rule) continue;
          const ent = ruleRepo.create({ user_id: userId, stadiumId: stadiumId , rule_name: rule });
          await ruleRepo.save(ent);
        }
      }

      //
      // 4) Replace court images
      //
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
            image_stadium: buffer
          });

          await imgRepo.save(imgEnt);
        }
      }
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
