import { getDbConnection } from '../db_connection';
import { register } from '@/repository/entity/approve_register';
import { user } from '@/repository/entity/login';
import { stadium } from '@/repository/entity/stadium';
import { SearchAccountParams, DeleteAccountParams, CreateAccountParams } from '@/dto/request/approve';
import { Like } from 'typeorm';

export const findUsers = async (params: SearchAccountParams): Promise<{ data: register[]; total: number }> => {
  return await getDbConnection(async (manager) => {
    const where: any = {};

    if (params.StadiumName) {
      where.stadium_name = Like(`%${params.StadiumName}%`);
    }

    const total = await manager.count(register, {
      where,
    });

    const data = await manager.find(register, {
      where,
    });

    return { data, total };
  });
};

export const deleteUser = async (params: DeleteAccountParams): Promise<boolean> => {
  return await getDbConnection(async (manager) => {
    try {
      if (!params.RegisterID || isNaN(params.RegisterID) || params.RegisterID <= 0) {
        throw new Error('Invalid or missing RegisterID');
      }

      const result = await manager.delete(register, {
        register_id: params.RegisterID,
      });

      if (!result.affected || result.affected === 0) {
        throw new Error('No user found with the provided RegisterID');
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  });
};

export const createUser = async (params: CreateAccountParams): Promise<register> => {
  return await getDbConnection(async (manager) => {
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!params.first_name || !params.last_name || !params.user_name || !params.password || !params.phone_number || !params.stadium_name || !params.location) {
        throw new Error('Missing required fields');
      }

      // เริ่ม transaction
      return await manager.transaction(async (transactionalEntityManager) => {
        // 1. สร้าง record ในตาราง register
        const newRegister = new register();
        newRegister.first_name = params.first_name!; // ใช้ non-null assertion
        newRegister.last_name = params.last_name!;
        newRegister.user_name = params.user_name!;
        newRegister.password = params.password!;
        newRegister.phone_number = params.phone_number!;
        newRegister.role_name = params.role_name || 'user';
        newRegister.stadium_name = params.stadium_name!;
        newRegister.location = params.location!;
        newRegister.created_date = new Date();

        const savedRegister = await transactionalEntityManager.save(register, newRegister);

        // 2. สร้าง record ในตาราง user
        const newUser = new user();
        newUser.first_name = params.first_name!;
        newUser.last_name = params.last_name!;
        newUser.user_name = params.user_name!;
        newUser.password = params.password!;
        newUser.phone_number = params.phone_number!;
        newUser.role_name = params.role_name || 'user';
        newUser.profile = null;

        const savedUser = await transactionalEntityManager.save(user, newUser);

        // 3. สร้าง record ในตาราง stadium
        const newStadium = new stadium();
        newStadium.user_id = savedUser.user_id;
        newStadium.stadium_name = params.stadium_name!;
        newStadium.location = params.location!;
        newStadium.court_all = 0;
        newStadium.image_slip = null;

        await transactionalEntityManager.save(stadium, newStadium);

        return savedRegister;
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });
};