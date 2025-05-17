import { NextResponse } from "next/server";
import { getDbConnection } from "@/repository/db_connection";
import { bookings as BookingEntity } from "@/repository/entity/bookings";
import { Court } from "@/repository/entity/Court";
import { SlotTime } from "@/repository/entity/slot_time";
import { In } from "typeorm";

type Selection = {
  userId?: number;
  stadiumId: number;
  courtId: number;
  slots: number[]; // index ของ time slot เช่น [0, 2]
};

export async function POST(req: Request) {
  let body: {
    userId?: number;
    bookingDate?: string;
    selections?: Selection[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Payload ต้องเป็น JSON" },
      { status: 400 }
    );
  }

  const { userId, bookingDate, selections } = body;
  console.log("📦 Request body:", body);
  if (
    typeof userId !== "number" ||
    typeof bookingDate !== "string" ||
    !Array.isArray(selections) ||
    selections.some(
      (s) =>
        typeof s.stadiumId !== "number" ||
        typeof s.courtId !== "number" ||
        !Array.isArray(s.slots) ||
        s.slots.some((i) => typeof i !== "number")
    )
  ) {
    return NextResponse.json(
      { success: false, message: "Request payload ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  try {
    await getDbConnection(async (manager) => {
      // หา stadiumId ที่เกี่ยวข้องทั้งหมด
      const stadiumIds = Array.from(new Set(selections.map(s => s.stadiumId)));

      // ดึงคอร์ททั้งหมดจาก stadium ที่เกี่ยวข้อง
      const dbCourts = await manager.find(Court, {
        where: { stadiumId: In(stadiumIds) },
        order: { courtId: "ASC", start_time: "ASC" },
      });

      // map court slots ตาม stadiumId-courtId
      const timeMap = new Map<string, Court[]>();
      for (const c of dbCourts) {
        const key = `${c.stadiumId}-${c.courtId}`;
        const arr = timeMap.get(key) ?? [];
        arr.push(c);
        timeMap.set(key, arr);
      }

      // วน loop ตาม selections ที่ผู้ใช้เลือก
      for (const sel of selections) {
        const key = `${sel.stadiumId}-${sel.courtId}`;
        const courtTimeSlots = timeMap.get(key) || [];

        for (const idx of sel.slots) {
          const slot = courtTimeSlots[idx];
          if (!slot) {
            throw new Error(
              `ไม่พบช่วงเวลาที่ index ${idx} สำหรับคอร์ท ${sel.courtId}`
            );
          }

          const price = parseFloat(slot.price);
          if (isNaN(price)) {
            throw new Error(`ราคาไม่ถูกต้องสำหรับ slot ${idx}`);
          }

          const booking = manager.create(BookingEntity, {
            user_id: userId,
            court_id: slot.id, // ใช้ court_id แท้ (primary key)
            start_time: slot.start_time,
            end_time: slot.end_time,
            booking_date: bookingDate, // บันทึกวันที่ที่เลือก
            total_price: price,
            status_id: 2, // 2 = pending
          });

          await manager.save(booking);

          // อัปเดต slot_time ด้วย booking_date ที่เลือก
          const updateResult = await manager.update(
            SlotTime,
            {
              court_id: slot.id,
              start_time: slot.start_time,
              booking_date: bookingDate,
            },
            {
              status_id: 2, // อัปเดตสถานะเป็น 2 (pending)
            }
          );

          if (updateResult.affected === 0) {
            throw new Error(`ไม่สามารถอัปเดต slot_time สำหรับ court_id ${slot.id}, start_time ${slot.start_time}, booking_date ${bookingDate}`);
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ bookMultipleCourts error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}