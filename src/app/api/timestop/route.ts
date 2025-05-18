import { NextResponse } from 'next/server';
import { getAllTimeStops } from '@/service/timestop';
import { SearchTimeParams } from '@/dto/request/timestop';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await getAllTimeStops(requestBody as SearchTimeParams);
  return NextResponse.json(response);
}