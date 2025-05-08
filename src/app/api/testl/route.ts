import { NextResponse } from 'next/server';
import {  updateAccount } from '@/service/test';
import { UpdateAccountParams } from '@/dto/request/test';

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
