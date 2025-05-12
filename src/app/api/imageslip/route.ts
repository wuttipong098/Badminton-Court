import { NextResponse } from 'next/server';
import { SearchImageSlip } from '@/dto/request/imageslip';
import * as stadiumService from '@/service/imageslip';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await stadiumService.getStadiumsWithImageSlip(requestBody as SearchImageSlip);
  return NextResponse.json(response);
}