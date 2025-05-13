import { SearchAccountParams, DeleteAccountParams, CreateAccountParams } from '@/dto/request/approve';
import { UserResponseModel, User } from '@/dto/response/approve';
import { register } from '@/repository/entity/approve_register';
import * as userRepo from '@/repository/action/approve';

function formatUserResponse(usersData: { total: number; data: register[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: usersData.data.map((user): User => ({
      RegisterID: user.register_id,
      FirstName: user.first_name,
      LastName: user.last_name,
      UserName: user.user_name,
      StadiumName: user.stadium_name,
      Location: user.location,
      PhoneNumber: user.phone_number,
    })),
    total: usersData.total,
  };
}

function formatSingleUserResponse(user: register): UserResponseModel {
  return {
    status_code: 201,
    status_message: 'User created successfully',
    data: [{
      RegisterID: user.register_id,
      FirstName: user.first_name,
      LastName: user.last_name,
      UserName: user.user_name,
      StadiumName: user.stadium_name,
      Location: user.location,
      PhoneNumber: user.phone_number,
    }],
    total: 1,
  };
}

export const searchUsers = async (params: SearchAccountParams): Promise<UserResponseModel> => {
  const usersData = await userRepo.findUsers(params);
  return formatUserResponse(usersData);
};

export const deleteUser = async (params: DeleteAccountParams): Promise<UserResponseModel> => {
  try {
    if (!params.RegisterID || isNaN(params.RegisterID) || params.RegisterID <= 0) {
      return {
        status_code: 400,
        status_message: 'Invalid or missing RegisterID',
        data: [],
        total: 0,
      };
    }

    const deleteSuccess = await userRepo.deleteUser(params);

    if (!deleteSuccess) {
      return {
        status_code: 404,
        status_message: 'No user found with the provided RegisterID',
        data: [],
        total: 0,
      };
    }

    return {
      status_code: 200,
      status_message: 'User deleted successfully',
      data: [],
      total: 0,
    };
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status_code: 500,
      status_message: `Failed to delete user: ${errorMessage}`,
      data: [],
      total: 0,
    };
  }
};

export const createUser = async (params: CreateAccountParams): Promise<UserResponseModel> => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!params.first_name || !params.last_name || !params.user_name || !params.password || !params.phone_number || !params.stadium_name || !params.location) {
      return {
        status_code: 400,
        status_message: 'Missing required fields',
        data: [],
        total: 0,
      };
    }

    // เรียกใช้ repository เพื่อสร้างผู้ใช้
    const createdUser = await userRepo.createUser(params);

    // จัดรูปแบบ response
    return formatSingleUserResponse(createdUser);
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status_code: 500,
      status_message: `Failed to create user: ${errorMessage}`,
      data: [],
      total: 0,
    };
  }
};