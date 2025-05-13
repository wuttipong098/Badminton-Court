import { NextResponse } from 'next/server';
import { SearchAccountParams, DeleteAccountParams, CreateAccountParams } from '@/dto/request/approve';
import * as userService from '@/service/approve';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await userService.searchUsers(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}

export async function DELETE(req: Request) {
  const requestBody = (await req.json()) as DeleteAccountParams;
  const response = await userService.deleteUser(requestBody);
  return NextResponse.json(response);
}

export async function PUT(req: Request) {
  const requestBody = (await req.json()) as CreateAccountParams;
  const response = await userService.createUser(requestBody);
  return NextResponse.json(response);
}