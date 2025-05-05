import { NextRequest, NextResponse } from 'next/server';
import { deleteCourtAction } from '@/repository/action/deleteCourtAction';

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const stadiumId = Number(searchParams.get('stadiumId'));
    const courtId = Number(searchParams.get('courtId'));
  
    if (isNaN(stadiumId) || isNaN(courtId)) {
      return NextResponse.json({ success: false, message: 'stadiumId หรือ courtId ไม่ถูกต้อง' }, { status: 400 });
    }
  
    const result = await deleteCourtAction(stadiumId, courtId);
  
    return NextResponse.json(result);
  }
