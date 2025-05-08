import {  UpdateAccountParams } from '@/dto/request/test';
import { UserResponseModel, User, ResponseModel } from '@/dto/response/test';
import * as userAction from '@/repository/action/test';

function formatUserResponse(usersData: { total: number; data: { ImownerID: number; UserID: number; StadiumID: number;  Profile: string | null; }[] }): UserResponseModel {
    return {
        status_code: 200,
        status_message: 'Data fetched successfully',
        data: usersData.data.map((user): User => ({
            ImownerID: user.ImownerID,
            UserID: user.UserID,
            StadiumID: user.StadiumID,
            ImageStadium: user.Profile ?? undefined,
        })),
        total: usersData.total,
    };
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