import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';
import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { SaveBookingSettingResponse } from '@/dto/response/savebs';

export async function saveOrUpdateBookingSettingsRepo(
  data: SaveBookingSettingRequest
): Promise<SaveBookingSettingResponse> {
  const courtIdNum = Number(data.courtId);
  const stadiumIdNum = Number(data.stadiumId);

  if (isNaN(courtIdNum) || isNaN(stadiumIdNum)) {
    throw new Error('courtId หรือ stadiumId ไม่ถูกต้อง');
  }

  return await getDbConnection(async (manager) => {
    await manager.delete(Court, { courtId: courtIdNum });

    for (const range of data.timeRanges) {
      const court = new Court();
      court.courtId = courtIdNum;
      court.stadiumId = stadiumIdNum;
      court.price = data.price.toString();
      court.start_time = `${range.start} - ${range.end}`;
      court.paymentTime = data.paymentTime.toString();
      court.userId = data.userId;
      court.isBooked = false;
      court.active = true;

      await manager.save(Court, court);
    }

    return {
      success: true,
      message: 'เพิ่มการตั้งค่าการจองแล้ว',
    };
  });
}