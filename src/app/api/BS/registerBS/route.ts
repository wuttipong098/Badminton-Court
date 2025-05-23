import { NextResponse } from 'next/server';
import { registerUserService } from '@/service/registerBS';
import { CreateAccountParams } from '@/dto/request/registerBS';

export async function PUT(req: Request) {
  const requestBody = await req.json();
  const response = await registerUserService(requestBody as CreateAccountParams);
  return NextResponse.json(response, { status: response.status_code });
}