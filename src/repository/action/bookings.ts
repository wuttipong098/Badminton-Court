import { getDbConnection } from '../db_connection';
import { bookings, CourtNumber } from '../entity';
import { CreateAccountParams, Slot } from '@/dto/request/bookings';

export const insertBooking = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const bookingsToInsert: bookings[] = [];
    const results: any[] = [];

    // สร้างสล็อตจาก params.Slots หรือสล็อตเดียว
    const slots: Slot[] = params.Slots
      ? params.Slots
      : params.CourtId && params.StartTime && params.EndTime
      ? [{ CourtId: params.CourtId, StartTime: params.StartTime, EndTime: params.EndTime }]
      : [];

    if (slots.length === 0) {
      throw new Error('At least one slot is required');
    }

    // ตรวจสอบสล็อตทับซ้อนภายใน slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      for (let j = i + 1; j < slots.length; j++) {
        const otherSlot = slots[j];
        if (slot.CourtId === otherSlot.CourtId) {
          const slotStart = new Date(`1970-01-01T${slot.StartTime}:00`);
          const slotEnd = new Date(`1970-01-01T${slot.EndTime}:00`);
          const otherStart = new Date(`1970-01-01T${otherSlot.StartTime}:00`);
          const otherEnd = new Date(`1970-01-01T${otherSlot.EndTime}:00`);

          if (
            (slotStart < otherEnd && slotEnd > otherStart) ||
            (otherStart < slotEnd && otherEnd > slotStart)
          ) {
            throw new Error(
              `Overlapping slots detected for CourtId ${slot.CourtId}: ${slot.StartTime}-${slot.EndTime} and ${otherSlot.StartTime}-${otherSlot.EndTime}`
            );
          }
        }
      }
    }

    // ตรวจสอบสล็อตทับซ้อนกับการจองที่มีอยู่ในฐานข้อมูล
    for (const slot of slots) {
      const existingBookings = await manager.find(bookings, {
        where: {
          court_id: slot.CourtId,
          booking_date: params.BookingDate,
        },
      });

      for (const existing of existingBookings) {
        const existingStart = new Date(`1970-01-01T${existing.start_time}:00`);
        const existingEnd = new Date(`1970-01-01T${existing.end_time}:00`);
        const slotStart = new Date(`1970-01-01T${slot.StartTime}:00`);
        const slotEnd = new Date(`1970-01-01T${slot.EndTime}:00`);

        if (
          (slotStart < existingEnd && slotEnd > existingStart) ||
          (existingStart < slotEnd && existingEnd > slotStart)
        ) {
          throw new Error(
            `Slot ${slot.StartTime}-${slot.EndTime} for CourtId ${slot.CourtId} overlaps with existing booking ${existing.start_time}-${existing.end_time}`
          );
        }
      }
    }

    // ประมวลผลแต่ละสล็อต
    for (const slot of slots) {
      // ตรวจสอบ CourtId
      if (!slot.CourtId) {
        throw new Error('CourtId is required');
      }

      // ดึง price_hour จากตาราง court
      const court = await manager.findOne(CourtNumber, { where: { court_id: slot.CourtId } });
      if (!court || !court.price_hour) {
        throw new Error(`Court with ID ${slot.CourtId} not found or price_hour is invalid`);
      }

      // ตรวจสอบและคำนวณจำนวนชั่วโมง
      if (!slot.StartTime || !slot.EndTime) {
        throw new Error('StartTime and EndTime are required');
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.StartTime) || !timeRegex.test(slot.EndTime)) {
        throw new Error('Invalid time format. Use HH:MM');
      }

      const start = new Date(`1970-01-01T${slot.StartTime}:00`);
      const end = new Date(`1970-01-01T${slot.EndTime}:00`);
      if (end <= start) {
        throw new Error('EndTime must be greater than StartTime');
      }

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // คำนวณชั่วโมง
      const totalPrice = hours * court.price_hour; // คำนวณ total_price

      // สร้าง booking ใหม่
      const newBooking = new bookings();
      newBooking.user_id = params.UserID || 0;
      newBooking.court_id = slot.CourtId;
      newBooking.start_time = slot.StartTime.slice(0, 5);
      newBooking.end_time = slot.EndTime.slice(0, 5);
      newBooking.total_price = totalPrice;
      newBooking.status_id = params.StatusID || 0;
      newBooking.booking_date = params.BookingDate || '';
      newBooking.created_date = new Date();
      newBooking.update_date = null;

      bookingsToInsert.push(newBooking);
    }

    // บันทึก bookings
    const savedBookings = await manager.save(bookingsToInsert);

    // ส่งคืน response
    results.push(
      ...savedBookings.map((savedBooking) => ({
        BookingId: savedBooking.booking_id,
        UserID: savedBooking.user_id,
        CourtId: savedBooking.court_id,
        StartTime: savedBooking.start_time ? savedBooking.start_time.slice(0, 5) : '',
        EndTime: savedBooking.end_time ? savedBooking.end_time.slice(0, 5) : '',
        TotalPrice: savedBooking.total_price,
        StatusID: savedBooking.status_id,
        BookingDate: savedBooking.booking_date,
      }))
    );

    return results;
  });
};

export const findBookingById = async (bookingId: number) => {
  return await getDbConnection(async (manager) => {
    const booking = await manager.findOne(bookings, { where: { booking_id: bookingId } });
    if (booking) {
      return {
        ...booking,
        start_time: booking.start_time ? booking.start_time.slice(0, 5) : '',
        end_time: booking.end_time ? booking.end_time.slice(0, 5) : '',
      };
    }
    return null;
  });
};

export const findBookings = async (params: any) => {
  return await getDbConnection(async (manager) => {
    const [data, total] = await manager.findAndCount(bookings, { where: params });
    const formattedData = data.map((booking) => ({
      ...booking,
      start_time: booking.start_time ? booking.start_time.slice(0, 5) : '',
      end_time: booking.end_time ? booking.end_time.slice(0, 5) : '',
    }));
    return { total, data: formattedData };
  });
};