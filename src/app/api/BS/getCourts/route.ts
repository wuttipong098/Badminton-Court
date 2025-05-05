// app/api/court/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCourts } from '@/repository/action/court';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stadiumId = searchParams.get('stadiumId');

  try {
    const courts = await getCourts(stadiumId ? Number(stadiumId) : undefined);
    return NextResponse.json({ success: true, data: courts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to fetch courts' }, { status: 500 });
  }
}
