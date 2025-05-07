import { getDbConnection } from '../db_connection';
import { user } from '../entity';
import { SearchAccountParams, UpdateAccountParams } from '@/dto/request/account';
import { Like } from 'typeorm';

export const findUsers = async (params: SearchAccountParams) => {
    return await getDbConnection(async (manager) => {
        const total = await manager.count(user, {
            where: {
                user_id: params.UserID ? params.UserID : undefined,
                first_name: params.FirstName ? Like(`%${params.FirstName}%`) : undefined,
                last_name: params.LastName ? Like(`%${params.LastName}%`) : undefined,
                user_name: params.UserName ? Like(`%${params.UserName}%`) : undefined,
                phone_number: params.PhoneNumber ? params.PhoneNumber : undefined,
            },
        });

        const data = await manager.find(user, {
            where: {
                user_id: params.UserID ? params.UserID : undefined,
                first_name: params.FirstName ? Like(`%${params.FirstName}%`) : undefined,
                last_name: params.LastName ? Like(`%${params.LastName}%`) : undefined,
                user_name: params.UserName ? Like(`%${params.UserName}%`) : undefined,
                phone_number: params.PhoneNumber ? params.PhoneNumber : undefined,
            },
        });

        const transformedData = data.map((item) => ({
            UserID: item.user_id,
            FirstName: item.first_name,
            LastName: item.last_name,
            UserName: item.user_name,
            PhoneNumber: item.phone_number,
            Profile: item.profile ? item.profile.toString('base64') : null, 
        }));

        return {
            total,
            data: transformedData,
        };
    });
};

export const updateUserById = async (params: UpdateAccountParams) => {
    return await getDbConnection(async (manager) => {
        const userData = await manager.findOne(user, { where: { user_id: params.UserID } });
        if (!userData) throw new Error(`User with ID ${params.UserID} not found`);

        userData.first_name = params.FirstName ?? userData.first_name;
        userData.last_name = params.LastName ?? userData.last_name;
        userData.user_name = params.UserName ?? userData.user_name;
        userData.phone_number = params.PhoneNumber ?? userData.phone_number;

        if (params.Profile) {
            if (typeof params.Profile === 'string') {
                userData.profile = Buffer.from(params.Profile, 'base64');
            } else {
                userData.profile = params.Profile;
            }
        }
        return manager.save(userData);
    });
};