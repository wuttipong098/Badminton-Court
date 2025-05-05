import { LoginParams } from '@/dto/request/login';
import * as userAction from '@/repository/action/login';

export async function loginUserService(params: LoginParams): Promise<{ status_code: number; status_message: string; redirectPath?: string; role_name?: string }> {
  try {
    // ตรวจสอบว่า params.UserName มีค่าหรือไม่
    if (!params.UserName) {
      throw new Error('Username is missing');
    }

    const userData = await userAction.loginUser(params);
    let redirectPath: string;

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
        throw new Error('Invalid role');
    }

    return {
      status_code: 200,
      status_message: 'Login successful',
      redirectPath,
      role_name: userData.role_name,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error logging in:', error);
    return {
      status_code: 401,
      status_message: `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง: ${errorMessage}`,
    };
  }
}