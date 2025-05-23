import { NextResponse } from "next/server";
import { getDbConnection } from "@/repository/db_connection";
import { bookings as BookingEntity } from "@/repository/entity/bookings";
import { Court } from "@/repository/entity/Court";
import { SlotTime } from "@/repository/entity/slot_time";
import { In } from "typeorm";

type Selection = {
  courtId: number;
  slots: number[];
  stadiumId: number | null;
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
  console.log("📦 Request body:", JSON.stringify(body, null, 2));

  if (
    typeof userId !== "number" ||
    typeof bookingDate !== "string" ||
    !Array.isArray(selections) ||
    selections.length === 0 ||
    selections.some(
      (s) =>
        typeof s.courtId !== "number" ||
        !Array.isArray(s.slots) ||
        s.slots.length > 1 ||
        s.slots.some((i) => typeof i !== "number" || i < 0)
    )
  ) {
    return NextResponse.json(
      { success: false, message: "Request payload ไม่ถูกต้อง: แต่ละ courtId ต้องเลือกได้เพียง 1 ช่วงเวลา" },
      { status: 400 }
    );
  }

  const totalSlots = selections.length;
  console.log(`จำนวนช่วงเวลาที่เลือกทั้งหมด: ${totalSlots}`);
  selections.forEach((sel) => {
    console.log(`courtId ${sel.courtId} เลือกช่วง:`, sel.slots);
  });

  const date = new Date(bookingDate);
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { success: false, message: "Invalid bookingDate format" },
      { status: 400 }
    );
  }

  try {
    return await getDbConnection(async (manager) => {
      const courtIds = selections.map((s) => s.courtId);
      console.log("Requested courtIds (from selections):", courtIds);

      const courts = await manager.find(Court, {
        where: { id: In(courtIds) },
      });

      console.log(
        "Fetched courts for price:",
        courts.map((c) => ({
          id: c.id,
          price: c.price,
        }))
      );

      const foundCourtIds = new Set(courts.map((c) => c.id));
      const missingCourtIds = courtIds.filter((id) => !foundCourtIds.has(id));
      if (missingCourtIds.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `ไม่พบข้อมูล Court สำหรับ courtIds: ${missingCourtIds.join(", ")}`,
          },
          { status: 404 }
        );
      }

      const slotTimes = await manager
        .createQueryBuilder(SlotTime, "slot")
        .where("slot.court_id IN (:...courtIds)", { courtIds })
        .andWhere("slot.booking_date = :date", { date: date.toISOString().split("T")[0] })
        .andWhere("slot.status_id != :statusId", { statusId: 2 })
        .orderBy("slot.court_id", "ASC")
        .addOrderBy("slot.start_time", "ASC")
        .getMany();

      console.log(
        "Fetched slotTimes:",
        slotTimes.map((s) => ({
          slot_time_id: s.slot_time_id,
          court_id: s.court_id,
          booking_date: s.booking_date,
          start_time: s.start_time,
          end_time: s.end_time,
          status_id: s.status_id,
        }))
      );

      if (slotTimes.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `ไม่พบช่องว่างสำหรับ courtIds: ${courtIds.join(", ")} ในวันที่ ${bookingDate}`,
          },
          { status: 404 }
        );
      }

      const foundSlotCourtIds = new Set(slotTimes.map((s) => s.court_id));
      const missingSlotCourtIds = courtIds.filter((id) => !foundSlotCourtIds.has(id));
      if (missingSlotCourtIds.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `ไม่พบช่องว่างใน slot_time สำหรับ courtIds: ${missingSlotCourtIds.join(", ")} ในวันที่ ${bookingDate}`,
          },
          { status: 404 }
        );
      }

      const slotTimeMap = new Map<number, SlotTime[]>();
      for (const slot of slotTimes) {
        const arr = slotTimeMap.get(slot.court_id) ?? [];
        arr.push(slot);
        slotTimeMap.set(slot.court_id, arr);
      }

      const bookings = [];
      for (const sel of selections) {
        const courtSlots = slotTimeMap.get(sel.courtId) || [];
        console.log(`Available slots for courtId ${sel.courtId}:`, courtSlots);

        if (courtSlots.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: `ไม่พบช่องว่างสำหรับ courtId ${sel.courtId} ในวันที่ ${bookingDate}`,
            },
            { status: 404 }
          );
        }

        const slot = courtSlots.find((s) => s.court_id === sel.courtId); // ใช้ courtId ที่ส่งมา
        if (!slot) {
          return NextResponse.json(
            {
              success: false,
              message: `ไม่พบช่องว่างสำหรับ courtId ${sel.courtId}`,
            },
            { status: 400 }
          );
        }

        const court = courts.find((c) => c.id === slot.court_id);
        if (!court) {
          return NextResponse.json(
            {
              success: false,
              message: `ไม่พบข้อมูล Court สำหรับ courtId ${slot.court_id}`,
            },
            { status: 404 }
          );
        }
        const price = parseFloat(court.price || "0");
        if (isNaN(price)) {
          return NextResponse.json(
            {
              success: false,
              message: `ราคาไม่ถูกต้องสำหรับ courtId ${slot.court_id}`,
            },
            { status: 400 }
          );
        }

        const existingBooking = await manager.findOne(BookingEntity, {
          where: {
            court_id: slot.court_id,
            booking_date: date.toISOString().split("T")[0],
            start_time: slot.start_time,
          },
        });

        if (existingBooking) {
          return NextResponse.json(
            {
              success: false,
              message: `ช่องเวลา ${slot.start_time}-${slot.end_time} สำหรับ courtId ${slot.court_id} ถูกจองแล้ว`,
            },
            { status: 400 }
          );
        }

        const booking = manager.create(BookingEntity, {
          user_id: userId,
          court_id: slot.court_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          booking_date: date.toISOString().split("T")[0],
          total_price: price,
          status_id: 2,
        });

        const updateResult = await manager.update(
          SlotTime,
          {
            slot_time_id: slot.slot_time_id,
          },
          {
            status_id: 2,
          }
        );

        if (updateResult.affected === 0) {
          return NextResponse.json(
            {
              success: false,
              message: `ไม่สามารถอัปเดต slot_time ${slot.slot_time_id} สำหรับ court_id ${slot.court_id}, booking_date ${bookingDate}`,
            },
            { status: 500 }
          );
        }

        bookings.push(booking);
        console.log(`จองสำเร็จสำหรับ courtId ${sel.courtId}, slot: ${slot.start_time}-${slot.end_time}`);
      }

      if (bookings.length === 0) {
        return NextResponse.json(
          { success: false, message: "ไม่มีช่องเวลาที่เลือกสำหรับการจอง" },
          { status: 400 }
        );
      }

      await manager.save(bookings);

      return NextResponse.json({ success: true, message: `จองสำเร็จ ${bookings.length} ช่วง` });
    });
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