import { NextResponse } from 'next/server';
import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { saveOrUpdateBookingSettingsService } from '@/service/savebs';

export async function POST(req: Request) {
  try {
    const body: SaveBookingSettingRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ userId กรุณาเข้าสู่ระบบใหม่' },
        { status: 400 }
      );
    }

    const result = await saveOrUpdateBookingSettingsService(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    );
  }
}
