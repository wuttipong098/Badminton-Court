import { getDbConnection } from '../db_connection';
import { stadium } from '@/repository/entity/stadium';
import { Like } from 'typeorm';
import { SearchMemberParams } from '@/dto/request/member';

export const findMemberStadiums = async (params: SearchMemberParams): Promise<{ total: number; data: stadium[] }> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 30;
  const skip = (page - 1) * pageSize;

  try {
    return await getDbConnection(async (manager) => {
      const where: any = {
        stadium_name: params.StadiumName ? Like(`%${params.StadiumName}%`) : undefined,
      };

      const total = await manager.count(stadium, {
        where,
        relations: ['user', 'images'],
      });

      const data = await manager.find(stadium, {
        where,
        relations: ['user', 'images'],
        skip,
        take: pageSize,
      });

      return { data, total };
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(errorMessage); // Throw error เพื่อให้ service จัดการ
  }
};