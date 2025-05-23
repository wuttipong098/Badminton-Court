import { CreateAccountParams } from '@/dto/request/registerBS';
import { User, UserResponseModel, ResponseModel } from '@/dto/response/registerBs';
import * as registerAction from '@/repository/action/registerBS';
import * as bcrypt from 'bcrypt';

function formatUserResponse(usersData: { total: number; data: User[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: usersData.data,
    total: usersData.total,
  };
}

export async function registerUserService(params: CreateAccountParams): Promise<ResponseModel> {
  try {
    // ตรวจสอบฟิลด์ที่จำเป็น
    const requiredFields = {
      FirstName: params.FirstName?.trim() || '',
      LastName: params.LastName?.trim() || '',
      UserName: params.UserName?.trim() || '', // ยังคงกำหนดค่าเริ่มต้นเป็น ''
      Password: params.Password?.trim() || '',
      RoleName: params.RoleName?.trim() || '',
      PhoneNumber: params.PhoneNumber?.trim() || '',
      Location: params.Location?.trim() || '',
      StadiumName: params.StadiumName?.trim() || '',
    };

    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นครบและไม่เป็นค่าว่าง
    if (Object.values(requiredFields).some(value => value === '')) {
      return {
        status_code: 400,
        status_message: 'กรุณากรอกข้อมูลให้ครบทุกช่องและต้องไม่เป็นช่องว่าง',
      };
    }

    // การันตีว่า requiredFields.UserName ไม่เป็น undefined ด้วยการ cast type
    const userName: string = requiredFields.UserName;

    // ตรวจสอบรูปแบบ Username
    if (!userName.includes('@') || !userName.includes('.')) {
      return {
        status_code: 400,
        status_message: 'ชื่อผู้ใช้ต้องมี "@" และ "."',
      };
    }

    if (userName.includes('@.') || userName.startsWith('@')) {
      return {
        status_code: 400,
        status_message: 'ชื่อผู้ใช้ไม่ถูกต้อง: ต้องไม่มี "@." และต้องมีตัวอักษรก่อน "@"',
      };
    }

    // ตรวจสอบว่า Username ไม่มีภาษาไทย
    if (/[ก-ฮะ-ูเ-์]/.test(userName)) {
      return {
        status_code: 400,
        status_message: 'ชื่อผู้ใช้ต้องไม่มีตัวอักษรภาษาไทย',
      };
    }

    // ตรวจสอบ FirstName และ LastName
    if (/[^a-zA-Zก-ฮะ-ูเ-์]/.test(requiredFields.FirstName)) {
      return {
        status_code: 400,
        status_message: 'ชื่อจริงต้องเป็นตัวอักษรภาษาอังกฤษหรือภาษาไทยเท่านั้น',
      };
    }

    if (/[^a-zA-Zก-ฮะ-ูเ-์]/.test(requiredFields.LastName)) {
      return {
        status_code: 400,
        status_message: 'นามสกุลต้องเป็นตัวอักษรภาษาอังกฤษหรือภาษาไทยเท่านั้น',
      };
    }

    // ตรวจสอบ PhoneNumber
    if (!/^\d{10}$/.test(requiredFields.PhoneNumber)) {
      return {
        status_code: 400,
        status_message: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก',
      };
    }

    // ตรวจสอบว่า Username ซ้ำหรือไม่
    const existingUsers = await registerAction.findRegisters({ user_name: userName });
    if (existingUsers.total > 0) {
      return {
        status_code: 409,
        status_message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว',
      };
    }

    // ตรวจสอบ Image
    if (params.Image && Array.isArray(params.Image)) {
      for (const img of params.Image) {
        if (typeof img !== 'string' && !Buffer.isBuffer(img)) {
          return {
            status_code: 400,
            status_message: 'รูปภาพต้องเป็น base64 string หรือ Buffer',
          };
        }
      }
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(requiredFields.Password, 10);

    // เรียก insertRegister
    await registerAction.insertRegister({
      ...params,
      Password: hashedPassword,
      FirstName: requiredFields.FirstName,
      LastName: requiredFields.LastName,
      UserName: userName,
      PhoneNumber: requiredFields.PhoneNumber,
      RoleName: requiredFields.RoleName,
      Location: requiredFields.Location,
      StadiumName: requiredFields.StadiumName,
    });

    return {
      status_code: 201,
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

export async function getAllRegisters(params: any): Promise<UserResponseModel> {
  try {
    const registersData = await registerAction.findRegisters(params);
    return formatUserResponse(registersData);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
      data: [],
      total: 0,
    };
  }
}

export async function getRegisterById(registerId: number): Promise<UserResponseModel> {
  try {
    const register = await registerAction.findRegisterById(registerId);
    if (!register) {
      return {
        status_code: 404,
        status_message: 'ไม่พบผู้ใช้',
        data: [],
        total: 0,
      };
    }
    return {
      status_code: 200,
      status_message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: [register],
      total: 1,
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
      data: [],
      total: 0,
    };
  }
}

export async function addImageService(params: { register_id: number; image: string | Buffer }): Promise<ResponseModel> {
  try {
    // ตรวจสอบว่า register_id มีอยู่ในระบบ
    const existingRegister = await registerAction.findRegisterById(params.register_id);
    if (!existingRegister) {
      return {
        status_code: 404,
        status_message: 'ไม่พบผู้ใช้ที่ระบุ',
      };
    }

    // ตรวจสอบว่า image เป็น base64 string หรือ Buffer
    if (typeof params.image !== 'string' && !Buffer.isBuffer(params.image)) {
      return {
        status_code: 400,
        status_message: 'รูปภาพต้องเป็น base64 string หรือ Buffer',
      };
    }

    // เรียก insertImage
    await registerAction.insertImage(params);

    return {
      status_code: 201,
      status_message: 'เพิ่มรูปภาพสำเร็จ',
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มรูปภาพ:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถเพิ่มรูปภาพได้',
    };
  }
}