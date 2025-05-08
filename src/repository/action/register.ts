import { getDbConnection } from '../db_connection';
import { user } from '../entity';
import { CreateAccountParams } from '@/dto/request/register';

export const insertUser = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newUser = new user();
    newUser.first_name = params.FirstName || '';
    newUser.last_name = params.LastName || '';
    newUser.user_name = params.UserName || '';
    newUser.password = params.Password || '';
    newUser.phone_number = params.PhoneNumber|| '';
    newUser.profile = params.Profile
      ? typeof params.Profile === 'string'
        ? Buffer.from(params.Profile, 'base64')
        : Buffer.isBuffer(params.Profile)
        ? params.Profile
        : null
      : null;
    newUser.role_name = params.RoleName || '';

    const savedUser = await manager.save(newUser);

    return {
      user_id: savedUser.user_id,
      first_name: savedUser.first_name,
      last_name: savedUser.last_name,
      user_name: savedUser.user_name,
      phone_number: savedUser.phone_number,
      profile: savedUser.profile ? savedUser.profile.toString('base64') : undefined,
      role_name: savedUser.role_name,
    };
  });
};

export const findUserByUsername = async (username: string) => {
  return await getDbConnection(async (manager) => {
    return await manager.findOne(user, { where: { user_name: username } });
  });
};

export const findUsers = async (params: any) => {
  return await getDbConnection(async (manager) => {
    const [data, total] = await manager.findAndCount(user, { where: params });
    return { total, data };
  });
};