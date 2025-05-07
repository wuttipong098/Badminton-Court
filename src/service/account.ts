import { SearchAccountParams, UpdateAccountParams } from '@/dto/request/account';
import { UserResponseModel, User, ResponseModel } from '@/dto/response/account';
import * as userAction from '@/repository/action/account';

function formatUserResponse(usersData: { total: number; data: { UserID: number; FirstName: string; LastName: string; UserName: string; PhoneNumber: number; Profile: string | null; }[] }): UserResponseModel {
    return {
        status_code: 200,
        status_message: 'Data fetched successfully',
        data: usersData.data.map((user): User => ({
            UserID: user.UserID,
            FirstName: user.FirstName,
            LastName: user.LastName,
            UserName: user.UserName,
            PhoneNumber: user.PhoneNumber,
            Profile: user.Profile ?? undefined,
        })),
        total: usersData.total,
    };
}

export async function getAllUsers(params: SearchAccountParams): Promise<UserResponseModel> {
    try {
        const usersData = await userAction.findUsers(params);
        return formatUserResponse(usersData);
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            status_code: 500,
            status_message: 'Failed to fetch users',
            data: [],
            total: 0,
        };
    }
}

export async function updateAccount(params: UpdateAccountParams): Promise<ResponseModel> {
    try {
        // ตรวจสอบว่าไม่มีค่าใดใน params เป็นค่าว่าง
        if (Object.values(params).some(value => value === undefined || value === null || value === '')) {
            return {
                status_code: 400,
                status_message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
            };
        }

        await userAction.updateUserById(params); 
        return {
            status_code: 200,
            status_message: 'User updated successfully',
        };
    } catch (error) {
        console.error('Error updating user:', error);
        return {
            status_code: 500,
            status_message: 'Failed to update user',
        };
    }
}