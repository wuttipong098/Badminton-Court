import { NextResponse } from 'next/server';
import { LoginParams} from '@/dto/request/login';
import * as accountUserService from '@/service/login';

export async function POST(req: Request) {
    const requestBody = await req.json();
    const response = await accountUserService.loginUserService(requestBody as LoginParams);
    return NextResponse.json(response);
  }