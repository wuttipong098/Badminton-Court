import { LoginParams } from '@/dto/request/login';
import * as userAction from '@/repository/action/login';
import * as bcrypt from 'bcrypt';

export async function loginUserService(params: LoginParams): Promise<{
  status_code: number;
  status_message: string;
  redirectPath?: string;
  UserID?: number;
  UserName?: string;
  FirstName?: string;
  LastName?: string;
  RoleName?: string;
  PhoneNumber?: string;
  Profile?: string;
}> {
  try {
    if (!params.UserName || !params.Password) {
      return {
        status_code: 400,
        status_message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
      };
    }

    const userData = await userAction.findUserByUsername(params.UserName);
    if (!userData) {
      return {
        status_code: 401,
        status_message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const isPasswordValid = await bcrypt.compare(params.Password, userData.password);
    if (!isPasswordValid) {
      return {
        status_code: 401,
        status_message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    let redirectPath: string = '';
    switch (userData.role_name?.toLowerCase()) {
      case 'admin':
        redirectPath = '/WebsiteBusiness/approve';
        break;
      case 'user':
        redirectPath = '/BadmintonCourt/new';
        break;
      case 'owner':
        redirectPath = '/BadmintonShop';
        break;
      default:
        redirectPath = '/';
    }

    return {
      status_code: 200,
      status_message: 'เข้าสู่ระบบสำเร็จ',
      redirectPath,
      UserID: userData.user_id,
      UserName: userData.user_name,
      FirstName: userData.first_name,
      LastName: userData.last_name,
      RoleName: userData.role_name,
      PhoneNumber: userData.phone_number,
      Profile: userData.profile ? userData.profile.toString('base64') : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error logging in:', error);
    return {
      status_code: 500,
      status_message: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${errorMessage}`,
    };
  }
}