import { getDbConnection } from '../db_connection';
import { registerB } from '@/repository/entity/registerBS';
import { user } from '@/repository/entity/login';
import { stadium } from '@/repository/entity/stadium';
import { imaregister } from '@/repository/entity/imaregister'; 
import { SearchAccountParams, DeleteAccountParams, CreateAccountParams } from '@/dto/request/approve';
import { Like } from 'typeorm';

export const findUsers = async (params: SearchAccountParams): Promise<{ data: (registerB & { images: string[] })[]; total: number }> => {
  return await getDbConnection(async (manager) => {
    const where: any = {};

    if (params.StadiumName) {
      where.stadium_name = Like(`%${params.StadiumName}%`);
    }

    const total = await manager.count(registerB, {
      where,
    });

    const data = await manager.find(registerB, {
      where,
      relations: ['images'], // โหลด relation images
    });

    // แปลงภาพ bytea เป็น Base64
    const dataWithImages = data.map((user) => ({
      ...user,
      images: user.images
        ? user.images
            .filter((img) => img.image !== null)
            .map((img) => `data:image/jpeg;base64,${Buffer.from(img.image!).toString('base64')}`)
        : [],
    }));

    return { data: dataWithImages, total };
  });
};

export const findUserImages = async (registerId: number): Promise<string[]> => {
  return await getDbConnection(async (manager) => {
    try {
      if (!registerId || isNaN(registerId) || registerId <= 0) {
        throw new Error('Invalid or missing RegisterID');
      }

      const images = await manager.find(imaregister, {
        where: { register_id: registerId },
        select: ['image'],
      });

      // แปลงข้อมูล bytea เป็น Base64
      const imageUrls = images
        .filter((img) => img.image !== null)
        .map((img) => `data:image/jpeg;base64,${Buffer.from(img.image!).toString('base64')}`);

      return imageUrls;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  });
};

export const deleteUser = async (params: DeleteAccountParams): Promise<boolean> => {
  return await getDbConnection(async (manager) => {
    try {
      if (!params.RegisterID || isNaN(params.RegisterID) || params.RegisterID <= 0) {
        throw new Error('Invalid or missing RegisterID');
      }

      const result = await manager.delete(registerB, {
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

export const createUser = async (params: CreateAccountParams): Promise<registerB> => {
  return await getDbConnection(async (manager) => {
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!params.first_name || !params.last_name || !params.user_name || !params.password || !params.phone_number || !params.stadium_name || !params.location) {
        throw new Error('Missing required fields');
      }

      // เริ่ม transaction
      return await manager.transaction(async (transactionalEntityManager) => {
        // 1. สร้าง record ในตาราง register
        const newRegister = new registerB();
        newRegister.first_name = params.first_name!;
        newRegister.last_name = params.last_name!;
        newRegister.user_name = params.user_name!;
        newRegister.password = params.password!;
        newRegister.phone_number = params.phone_number!;
        newRegister.role_name = params.role_name || 'user';
        newRegister.stadium_name = params.stadium_name!;
        newRegister.location = params.location!;
        newRegister.created_date = new Date();

        const savedRegister = await transactionalEntityManager.save(registerB, newRegister);

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