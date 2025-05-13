// app/api/BS/getStadiumId/route.ts
import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { stadium }        from '@/repository/entity/stadium';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    if (!userIdParam) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Missing userId' },
        { status: 400 }
      );
    }
    const userId = Number(userIdParam);
    if (isNaN(userId)) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Invalid userId' },
        { status: 400 }
      );
    }

    let foundStadiumId: number | null = null;
    await getDbConnection(async (manager) => {
      const repo = manager.getRepository(stadium);
      const stadiumEntity = await repo.findOne({
        where: { user_id: userId },
      });
      if (stadiumEntity) {
        //
        // **USE** stadium_id here, not `.id`
        //
        foundStadiumId = stadiumEntity.stadium_id;
      }
    });

    if (!foundStadiumId) {
      return NextResponse.json(
        { status_code: 404, status_message: 'Stadium not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { stadiumId: foundStadiumId },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/BS/getStadiumId error:', err);
    return NextResponse.json(
      { status_code: 500, status_message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}