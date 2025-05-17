import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';
import { stadium } from '@/repository/entity/stadium';
import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { SaveBookingSettingResponse } from '@/dto/response/savebs';

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
        existing.paymentTime = data.paymentTime.toString();
        existing.active = data.active ?? true;
        await manager.save(Court, existing);
      } else {
        // ➕ เพิ่มใหม่หากไม่มี
        const court = new Court();
        court.courtId = courtIdNum;
        court.stadiumId = stadiumIdNum;
        court.price = data.price.toString();
        court.time = `${range.start} - ${range.end}`;
        court.paymentTime = data.paymentTime.toString();
        court.userId = data.userId;
        court.isBooked = 0;
        court.active = data.active ?? true;
        court.start_time = range.start;
        court.end_time = range.end;

        await manager.save(Court, court);
      }
    }

    return {
      success: true,
      message: 'อัปเดต/เพิ่มการตั้งค่าการจองเรียบร้อยแล้ว',
    };
  });
}
