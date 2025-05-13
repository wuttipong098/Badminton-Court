// src/pages/api/allsearch
import { NextResponse } from 'next/server';
import { SearchAccountParams } from '@/dto/request/allsearch';
import * as stadiumService from '@/service/allsearch';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await stadiumService.getStadiumBySlot(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}