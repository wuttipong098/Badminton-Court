import { NextResponse } from 'next/server';
import { SearchAccountParams} from '@/dto/request/historys';
import * as accountUserService from '@/service/historys';

export async function POST(req: Request) {
  const requestBody = await req.json();
  const response = await accountUserService.getAllUsers(requestBody as SearchAccountParams);
  return NextResponse.json(response);
}