// app/actions/court.ts
import { getDbConnection } from '../db_connection';
import { Court } from '@/repository/entity/Court';

// ดึงคอร์ททั้งหมด หรือเฉพาะสนามที่ระบุ
export const getCourts = async (stadiumId?: number) => {
  return await getDbConnection(async (manager) => {
    const where = stadiumId ? { stadiumId } : {};

    return await manager.find(Court, {
      where,
      order: { courtId: 'ASC' },
    });
  });
};