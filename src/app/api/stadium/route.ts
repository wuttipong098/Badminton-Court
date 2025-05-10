import { NextResponse } from 'next/server';
import { SearchAccountParams, CreateAccountParams, DeleteAccountParams } from '@/dto/request/stadium';
import * as stadiumService from '@/service/stadium';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await stadiumService.getAllStadiums(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}

export async function PUT(req: Request) {
  const requestBody = (await req.json()) as CreateAccountParams;
  const response = await stadiumService.addFavorite(requestBody);
  return NextResponse.json(response);
}

export async function DELETE(req: Request) {
  const requestBody = (await req.json()) as DeleteAccountParams;
  const response = await stadiumService.removeFavorite(requestBody);
  return NextResponse.json(response);
}