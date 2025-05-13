import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { Court } from '@/repository/entity/Court';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courtId = Number(searchParams.get("courtId"));
  const userId = Number(searchParams.get("userId"));

  if (isNaN(courtId) || isNaN(userId)) {
    return NextResponse.json(
      { success: false, message: "พารามิเตอร์ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    const result = await getDbConnection(async (manager) => {
      const courts = await manager.find(Court, {
        where: { courtId, userId },
        order: { time: "ASC" },
      });
      console.log("✅ userId:", userId);
      if (courts.length === 0) {
        return { success: false, message: "ไม่พบข้อมูลสนาม" };
      }

      return {
        success: true,
        data: {
          courtId,
          price: courts[0].price,
          paymentTime: courts[0].paymentTime,
          timeRanges: courts.map((c) => {
            const [start, end] = c.time.split(" - ");
            return { start, end };
          }),
        },
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ getCourtSetting error:", err);
    return NextResponse.json(
      { success: false, message: "ดึงข้อมูลล้มเหลว" },
      { status: 500 }
    );
  }
}