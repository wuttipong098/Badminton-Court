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
    // ✅ ดึง stadium จาก userId
    const stadiums = await manager.findOne(stadium, {
      where: { user_id: data.userId },
    });

    if (!stadium) {
      return {
        success: false,
        message: 'ไม่พบสนามของผู้ใช้งาน',
      };
    }

    const stadiumIdNum = stadiums.stadium_id;

    await manager.delete(Court, { courtId: courtIdNum });

    for (const range of data.timeRanges) {
      const court = new Court();
      court.courtId = courtIdNum;
      court.stadiumId = stadiumIdNum;
      court.price = data.price.toString();
      court.time = `${range.start} - ${range.end}`;
      court.paymentTime = data.paymentTime.toString();
      court.userId = data.userId;
      court.isBooked = 1;
      court.active = true;

      await manager.save(Court, court);
    }

    return {
      success: true,
      message: 'เพิ่มการตั้งค่าการจองแล้ว',
    };
  });
}