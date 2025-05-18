import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { bookings } from '@/repository/entity/bookings';
import { SlotTime } from '@/repository/entity/slot_time'; // นำเข้า Entity SlotTime

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json(); // รับ id และ status จาก request body
    console.log('Updating booking status:', { id, status });

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing id or status' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map status string ไปยัง status_id
    let statusId: number;
    switch (status.toLowerCase()) {
      case 'approved':
        statusId = 2;
        break;
      case 'rejected':
        statusId = 1;
        break;
      case 'pending':
        statusId = 3;
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return await getDbConnection(async (manager) => {
      console.log('Connected to database successfully');
      const bookingRepo = manager.getRepository(bookings);
      const slotTimeRepo = manager.getRepository(SlotTime); // สร้าง repository สำหรับ slot_time

      // ค้นหา booking
      const booking = await bookingRepo.findOneBy({ booking_id: id as number });
      if (!booking) {
        return NextResponse.json(
          { success: false, message: 'Booking not found' },
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // อัปเดต status_id ใน bookings
      booking.status_id = statusId;
      booking.update_date = new Date(); // อัปเดตวันที่แก้ไข
      await bookingRepo.save(booking);

      // ค้นหาและอัปเดต slot_time
      const slotTime = await slotTimeRepo.findOneBy({
        court_id: booking.court_id,
        booking_date: new Date(booking.booking_date), // แปลง string เป็น Date
        start_time: booking.start_time,
        end_time: booking.end_time,
        });

      if (slotTime) {
        slotTime.status_id = statusId;
        slotTime.update_date = new Date(); // อัปเดตวันที่แก้ไข
        await slotTimeRepo.save(slotTime);
        console.log('SlotTime status updated:', {
          slot_time_id: slotTime.slot_time_id,
          statusId,
        });
      } else {
        console.warn('No matching slot_time found for:', {
          court_id: booking.court_id,
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
        });
      }

      console.log('Booking status updated:', { id, statusId });
      return NextResponse.json(
        {
          success: true,
          message: 'Booking and slot time status updated successfully',
          data: { id, status },
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });
  } catch (err: any) {
    console.error('❌ /api/BS/updateBookingStatus error:', err.message, err.stack);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}