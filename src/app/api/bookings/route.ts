import { NextResponse } from 'next/server';
import { createBookingService } from '@/service/bookings';
import { CreateAccountParams } from '@/dto/request/bookings';

export async function PUT(req: Request) {
  const requestBody = await req.json();
  const response = await createBookingService(requestBody as CreateAccountParams);
  return NextResponse.json(response);
}