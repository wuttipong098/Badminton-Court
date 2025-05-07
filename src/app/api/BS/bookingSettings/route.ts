import { NextResponse } from 'next/server';
import { saveOrUpdateBookingSettings } from '@/repository/action/savebs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await saveOrUpdateBookingSettings(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    );
  }
}