// app/api/BS/getCourtData/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCourtData } from '@/repository/action/courtData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (isNaN(userId)) {
    return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
  }
  
  try {
    const data = await getCourtData(userId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ โหลดข้อมูลสนามไม่สำเร็จ", error);
    return NextResponse.json({ success: false, message: 'load court data failed' }, { status: 500 });
  }
}
