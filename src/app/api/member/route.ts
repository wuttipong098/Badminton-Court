import { NextResponse } from 'next/server';
import { SearchMemberParams } from '@/dto/request/member';
import { getAllMemberStadiums } from '@/service/member';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await getAllMemberStadiums(requestBody as SearchMemberParams);
  return NextResponse.json(response);
}