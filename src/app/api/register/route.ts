import { NextResponse } from 'next/server';
import * as userService from '@/service/register';
import { CreateAccountParams } from '@/dto/request/register';
import { ResponseModel, UserResponseModel } from '@/dto/response/register';

export async function PUT(req: Request) {
  try {
    const requestBody = await req.json() as CreateAccountParams;
    const response: ResponseModel = await userService.registerUserService(requestBody);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PUT API:', error);
    return NextResponse.json(
      {
        status_code: 500,
        status_message: 'Failed to create user',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get('roleName') || undefined;
    const params: any = { roleName };

    const response: UserResponseModel = await userService.getAllUsers(params);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET API:', error);
    return NextResponse.json(
      {
        status_code: 500,
        status_message: 'Failed to fetch users',
        data: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}