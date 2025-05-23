import { getDbConnection } from '../db_connection';
import { registerB } from '../entity/registerBS';
import { imaregister } from '../entity/imaregister';
import { CreateAccountParams } from '@/dto/request/registerBS';
import { User } from '@/dto/response/registerBs';

export const insertRegister = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newRegister = new registerB();
    newRegister.first_name = params.FirstName || '';
    newRegister.last_name = params.LastName || '';
    newRegister.user_name = params.UserName || '';
    newRegister.password = params.Password || '';
    newRegister.phone_number = params.PhoneNumber || '';
    newRegister.role_name = params.RoleName || '';
    newRegister.location = params.Location || '';
    newRegister.stadium_name = params.StadiumName || '';

    // บันทึก registerB ก่อน
    const savedRegister = await manager.save(newRegister);

    // จัดการ images ถ้ามี
    if (params.Image && Array.isArray(params.Image)) {
      const images = params.Image.map((img) => {
        const newImage = new imaregister();
        newImage.register_id = savedRegister.register_id;
        newImage.image = img
          ? typeof img === 'string'
            ? Buffer.from(img, 'base64')
            : Buffer.isBuffer(img)
            ? img
            : null
          : null;
        return newImage;
      });
      await manager.save(images);
    }

    // สร้าง response
    const user: User = {
      UserID: savedRegister.register_id,
      FirstName: savedRegister.first_name,
      LastName: savedRegister.last_name,
      UserName: savedRegister.user_name,
      PhoneNumber: savedRegister.phone_number,
      RoleName: savedRegister.role_name,
      Location: savedRegister.location,
      StadiumName: savedRegister.stadium_name,
      Image: params.Image,
    };

    return user;
  });
};

export const findRegisterById = async (registerId: number) => {
  return await getDbConnection(async (manager) => {
    const register = await manager.findOne(registerB, {
      where: { register_id: registerId },
      relations: ['images'],
    });

    if (!register) {
      return null;
    }

    const user: User = {
      UserID: register.register_id,
      FirstName: register.first_name,
      LastName: register.last_name,
      UserName: register.user_name,
      PhoneNumber: register.phone_number,
      RoleName: register.role_name,
      Location: register.location,
      StadiumName: register.stadium_name,
      Image: register.images
        ? register.images
            .filter((img) => img.image !== null)
            .map((img) => img.image!.toString('base64'))
        : undefined,
    };

    return user;
  });
};

export const findRegisters = async (params: any) => {
  return await getDbConnection(async (manager) => {
    const [data, total] = await manager.findAndCount(registerB, {
      where: params,
      relations: ['images'],
    });

    const users: User[] = data.map((register) => ({
      UserID: register.register_id,
      FirstName: register.first_name,
      LastName: register.last_name,
      UserName: register.user_name,
      PhoneNumber: register.phone_number,
      RoleName: register.role_name,
      Location: register.location,
      StadiumName: register.stadium_name,
      Image: register.images
        ? register.images
            .filter((img) => img.image !== null)
            .map((img) => img.image!.toString('base64'))
        : undefined,
    }));

    return { total, data: users };
  });
};

export const insertImage = async (params: {
  register_id: number;
  image: string | Buffer;
}) => {
  return await getDbConnection(async (manager) => {
    const newImage = new imaregister();
    newImage.register_id = params.register_id;
    newImage.image = params.image
      ? typeof params.image === 'string'
        ? Buffer.from(params.image, 'base64')
        : Buffer.isBuffer(params.image)
        ? params.image
        : null
      : null;

    const savedImage = await manager.save(newImage);

    return {
      image_register_id: savedImage.image_register_id,
      register_id: savedImage.register_id,
      image: savedImage.image ? savedImage.image.toString('base64') : undefined,
    };
  });
};