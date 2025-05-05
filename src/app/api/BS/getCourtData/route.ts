// app/api/BS/getCourtData/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCourtData } from '@/repository/action/courtData';

export async function GET(req: NextRequest) {
  try {
    const data = await getCourtData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ โหลดข้อมูลสนามไม่สำเร็จ", error);
    return NextResponse.json({ success: false, message: 'load court data failed' }, { status: 500 });
  }
}
