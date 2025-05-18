import { NextResponse } from 'next/server';
import { CreateAccountParams, DeleteAccountParams, SearchAccountParams } from '@/dto/request/addmenu';
import * as bookingService from '@/service/addmenu';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const params: SearchAccountParams = {
    addmenuID: searchParams.get('addmenuID') ? Number(searchParams.get('addmenuID')) : undefined,
    UserID: searchParams.get('UserID') ? Number(searchParams.get('UserID')) : undefined,
    CourtId: searchParams.get('CourtId') ? Number(searchParams.get('CourtId')) : undefined,
    StartTime: searchParams.get('StartTime') || undefined,
    EndTime: searchParams.get('EndTime') || undefined,
    TotalPrice: searchParams.get('TotalPrice') ? Number(searchParams.get('TotalPrice')) : undefined,
    BookingDate: searchParams.get('BookingDate') || undefined,
    StatusID: searchParams.get('StatusID') ? Number(searchParams.get('StatusID')) : undefined,
  };
  const response = await bookingService.getAllBookings(params);
  return NextResponse.json(response);
}

export async function PUT(req: Request) {
  const requestBody = (await req.json()) as CreateAccountParams;
  const response = await bookingService.addBooking(requestBody);
  return NextResponse.json(response);
}

export async function DELETE(req: Request) {
  const requestBody = (await req.json()) as DeleteAccountParams;
  const response = await bookingService.removeBooking(requestBody);
  return NextResponse.json(response);
}