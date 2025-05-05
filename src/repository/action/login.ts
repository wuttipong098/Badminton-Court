import { getDbConnection } from '../db_connection';
import { user } from '@/repository/entity/login';
import { LoginParams } from '@/dto/request/login';
import { Equal } from 'typeorm';

export const loginUser = async (params: LoginParams) => {
  return await getDbConnection(async (manager) => {

    if (!params.Password) {
      throw new Error('กรุณาใส่รหัสผ่าน');
    }

    const userRecord = await manager.findOne(user, {
      where: {
        user_name: Equal(params.UserName),
      },
    });

    if (!userRecord) {
      throw new Error('ไม่พบผู้ใช้');
    }
    if (params.Password !== userRecord.password) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    return {
      user_id: userRecord.user_id,
      first_name: userRecord.first_name,
      last_name: userRecord.last_name,
      user_name: userRecord.user_name,
      phone_number: userRecord.phone_number,
      profile: userRecord.profile ? userRecord.profile.toString('utf8') : undefined,
      role_name: userRecord.role_name,
    };
  });
};