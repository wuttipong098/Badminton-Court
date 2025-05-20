import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { bookings } from '@/repository/entity/bookings';
import { Court } from '@/repository/entity/Court';
import { user } from '@/repository/entity/login';
import { stadium } from '@/repository/entity/stadium';

export async function POST(request: Request) {
  try {
    const { startDate, endDate, court: courtFilter, userId } = await request.json();
    console.log('Fetching booking history with filters:', { startDate, endDate, court: courtFilter, userId });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId' },
        { status: 400 }
      );
    }

    return await getDbConnection(async (manager) => {
      const bookingRepo = manager.getRepository(bookings);
      const stadiumRepo = manager.getRepository(stadium);

      // ดึง stadiumId จากตาราง stadium โดยใช้ userId
      const stadiumData = await stadiumRepo.findOne({
        where: { user_id: userId as number },
        select: ['stadium_id'],
      });
      if (!stadiumData) {
        return NextResponse.json(
          { success: false, message: 'No stadium found for user' },
          { status: 404 }
        );
      }
      const stadiumId = stadiumData.stadium_id;

      const query = bookingRepo
        .createQueryBuilder('booking')
        .leftJoin('booking.court', 'court')
        .leftJoin('booking.user', 'user')
        .select([
          'booking.booking_id AS booking_id',
          'booking.booking_date AS booking_date',
          'court.court_number AS court_number',
          'booking.start_time AS start_time',
          'booking.end_time AS end_time',
          "CONCAT(user.first_name, ' ', user.last_name) AS user_name",
          'booking.total_price AS price_hour',
        ])
        .where('booking.status_id = :statusId', { statusId: 2 })
        .andWhere('court.stadiumId = :stadiumId', { stadiumId }); // กรองตาม stadiumId

      if (startDate) {
        query.andWhere('booking.booking_date >= :startDate', { startDate });
      }
      if (endDate) {
        query.andWhere('booking.booking_date <= :endDate', { endDate });
      }
      if (courtFilter && courtFilter !== "all") {
        query.andWhere("court.court_number = :courtNumber", { courtNumber: parseInt(courtFilter) });
      }

      query.orderBy('booking.booking_date', 'DESC');

      const sqlQuery = query.getSql();
      console.log('Generated SQL:', sqlQuery);

      const bookingData = await query.getRawMany();
      console.log('Raw booking data:', bookingData);

      const formattedBookings = bookingData.map((b: any) => ({
        id: b.booking_id,
        date: b.booking_date
          ? new Date(b.booking_date).toLocaleDateString('th-TH', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : 'ไม่ระบุ',
        court: b.court_number ? `คอร์ดที่ ${b.court_number}` : 'ไม่ระบุ',
        time: b.start_time && b.end_time ? `${b.start_time} - ${b.end_time}` : 'ไม่ระบุ',
        name: b.user_name || 'ไม่ระบุ',
        price: b.price_hour ? parseFloat(b.price_hour) : 0,
      }));

      const totalRevenue = formattedBookings.reduce((sum: number, b: any) => sum + b.price, 0);

      return NextResponse.json(
        {
          success: true,
          message: 'Fetched booking history successfully',
          data: {
            bookings: formattedBookings,
            totalRevenue,
          },
        },
        { status: 200 }
      );
    });
  } catch (err: any) {
    console.error('❌ /api/BS/getBookingHistory error:', err.message, err.stack);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}