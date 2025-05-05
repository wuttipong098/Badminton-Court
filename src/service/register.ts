import { CreateAccountParams } from '@/dto/request/register';
import { User, UserResponseModel, ResponseModel } from '@/dto/response/register';
import { user } from '@/repository/entity';
import * as userAction from '@/repository/action/register';
import * as bcrypt from 'bcrypt';

function formatUserResponse(usersData: { total: number; data: user[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: usersData.data.map((userData): User => ({
      UserID: userData.user_id,
      FirstName: userData.first_name,
      LastName: userData.last_name,
      UserName: userData.user_name,
      PhoneNumber: userData.phone_number,
      Profile: userData.profile ? userData.profile.toString('base64') : undefined,
      RoleName: userData.role_name,
    })),
    total: usersData.total,
  };
}

export async function registerUserService(params: CreateAccountParams): Promise<ResponseModel> {
  try {
    // ตรวจสอบว่าไม่มีค่าใดใน params เป็นค่าว่าง
    const requiredFields = {
      FirstName: params.FirstName || '',
      LastName: params.LastName || '',
      UserName: params.UserName || '',
      Password: params.Password || '',
      RoleName: params.RoleName || '',
      PhoneNumber: params.PhoneNumber || 0,
    };
    if (Object.values(requiredFields).some(value => !value)) {
      return {
        status_code: 400,
        status_message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
      };
    }

    // ตรวจสอบว่า username มี '@' และ '.'
    if (!requiredFields.UserName.includes('@') || !requiredFields.UserName.includes('.')) {
      return {
        status_code: 401,
        status_message: 'ชื่อผู้ใช้ต้องมี "@" และ "."',
      };
    }

    // ตรวจสอบว่าข้อมูลไม่ควรเป็น @. และควรมีข้อความหน้า @
    if (requiredFields.UserName.includes('@.') || requiredFields.UserName.indexOf('@') === 0) {
      return {
        status_code: 402,
        status_message: 'Username ไม่ควรมีรูปแบบ "@." และควรมีข้อมูลก่อนหน้า "@"',
      };
    }

    if (/[ก-ฮา-์]/.test(requiredFields.UserName)) {
        return {
          status_code: 405,
          status_message: 'ชื่อผู้ใช้ (Username) ต้องไม่ใช่ภาษาไทย',
        };
      }

    // firstname เป็นได้แค่ ตัวอักษรภาษาอังกฤษ และ พยัญชนะ กับสระ
    if (/[^a-zA-Zก-ฮา-์]/.test(requiredFields.FirstName)) {
      return {
        status_code: 403,
        status_message: 'ชื่อจริง (Firstname) เป็นได้แค่ตัวอักษรภาษาอังกฤษและพยัญชนะกับสระ',
      };
    }

    // lastname เป็นได้แค่ ตัวอักษรภาษาอังกฤษ และ พยัญชนะ กับสระ
    if (/[^a-zA-Zก-ฮา-์]/.test(requiredFields.LastName)) {
      return {
        status_code: 404,
        status_message: 'นามสกุล (Lastname) เป็นได้แค่ตัวอักษรภาษาอังกฤษและพยัญชนะกับสระ',
      };
    }

    // ตรวจสอบว่า Username มีอยู่ในระบบหรือไม่
    const existingUser = await userAction.findUserByUsername(requiredFields.UserName);
    if (existingUser) {
      return {
        status_code: 409,
        status_message: 'ชื่อผู้ใช้ (Username) นี้มีอยู่ในระบบแล้ว',
      };
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(requiredFields.Password, 10);

    // เรียก insertUser โดยใช้ params ที่มีค่าเริ่มต้น
    await userAction.insertUser({
      ...params,
      Password: hashedPassword,
      FirstName: requiredFields.FirstName,
      LastName: requiredFields.LastName,
      UserName: requiredFields.UserName,
      PhoneNumber: requiredFields.PhoneNumber,
      RoleName: requiredFields.RoleName,
    });

    return {
      status_code: 200,
      status_message: 'สร้างบัญชีผู้ใช้สำเร็จ',
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถสร้างผู้ใช้ได้',
    };
  }
}

export async function getAllUsers(params: any): Promise<UserResponseModel> {
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