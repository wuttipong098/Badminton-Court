'use server';

import { getDbConnection } from '@/repository/db_connection';
import { Court } from '@/repository/entity/Court';

export const deleteCourtAction = async (stadiumId: number, courtId: number) => {
  if (!stadiumId || !courtId) {
    return { success: false, message: '❗ กรุณาระบุ stadiumId และ courtId ให้ครบถ้วน' };
  }

  try {
    await getDbConnection(async (manager) => {
      const court = await manager.find(Court, {
        where: { stadiumId, courtId },
      });

      if (!court) {
        throw new Error(`ไม่พบสนามที่ stadiumId=${stadiumId}, courtId=${courtId}`);
      }

      await manager.remove(Court, court); // ลบจากฐานข้อมูล
    });

    return { success: true, message: `✅ ลบคอร์ทที่ ${courtId} สำเร็จ` };
  } catch (error: any) {
    console.error('❌ deleteCourtAction error:', error);
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดบางอย่าง' };
  }
};
