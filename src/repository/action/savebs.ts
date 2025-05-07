'use server';

import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';

export interface BookingSettings {
  courtId: string | null;
  stadiumId: number;
  price: number;
  promoPrice?: number; // ยังไม่ใช้
  timeRanges: { start: string; end: string }[];
  paymentTime: number;
}

export async function saveOrUpdateBookingSettings(data: BookingSettings) {
  console.log("📦 Received booking settings:", data);

  const courtIdNum = Number(data.courtId);
  const stadiumIdNum = Number(data.stadiumId);

  if (isNaN(courtIdNum) || isNaN(stadiumIdNum)) {
    throw new Error("courtId หรือ stadiumId ไม่ถูกต้อง");
  }

  if (!data.timeRanges || data.timeRanges.length === 0) {
    throw new Error("กรุณาใส่ช่วงเวลาอย่างน้อย 1 รายการ");
  }

  return await getDbConnection(async (manager) => {
    // ลบรายการเก่าของ court นี้ออกก่อน
    await manager.delete(Court, { courtId: courtIdNum });

    // สร้างใหม่ทีละช่วงเวลา
    for (const range of data.timeRanges) {
      const court = new Court();
      court.courtId = courtIdNum;
      court.stadiumId = stadiumIdNum;
      court.price = data.price.toString();
      court.start_time = `${range.start} - ${range.end}`;
      court.paymentTime = data.paymentTime.toString();
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
