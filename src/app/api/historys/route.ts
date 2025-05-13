import { NextResponse } from 'next/server';
import { SearchHistoryParams } from '@/dto/request/historys';
import { getBookingHistory } from '@/service/historys';

export async function POST(req: Request) {
    const requestBody = await req.json();
    const response = await getBookingHistory(requestBody as SearchHistoryParams);
    return NextResponse.json(response);
}