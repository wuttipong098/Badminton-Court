import { NextResponse } from 'next/server';
import { SearchAccountParams } from '@/dto/request/court';
import * as courtService from '@/service/court_number';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await courtService.getCourtDetails(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}