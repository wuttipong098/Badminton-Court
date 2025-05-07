import { NextResponse } from 'next/server';
import {  updateAccount } from '@/service/account';
import { SearchAccountParams, UpdateAccountParams } from '@/dto/request/account';
import * as accountUserService from '@/service/account';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await accountUserService.getAllUsers(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}

export async function PATCH(req: Request) {
  const requestBody = await req.json() as UpdateAccountParams;
  const existingAccount = await updateAccount(requestBody);
  if (existingAccount) {
    return NextResponse.json(existingAccount);
  } else {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 404 }
    );
  }
}
