import { NextResponse } from 'next/server';
import { updateSlotTime } from '@/service/slottime';
import { UpdateAccountParams } from '@/dto/request/slottime';

export async function PATCH(req: Request) {
  const requestBody = await req.json();
  const response = await updateSlotTime(requestBody as UpdateAccountParams);
  return NextResponse.json(response);
}