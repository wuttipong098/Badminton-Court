import { NextResponse } from 'next/server';
import { SearchAccountParams } from '@/dto/request/stadium';
import * as stadiumService from '@/service/stadium';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await stadiumService.getAllStadiums(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}