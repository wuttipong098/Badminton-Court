import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { bookings } from '@/repository/entity/bookings';
import { Court } from '@/repository/entity/Court';
import { user } from '@/repository/entity/login';
import { stadium } from '@/repository/entity/stadium';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const userId = searchParams.get('userId'); // รับ userId จาก query params
    console.log('Fetching bookings with searchTerm and userId:', { searchTerm, userId });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return await getDbConnection(async (manager) => {
      console.log('Connected to database successfully');
      const bookingRepo = manager.getRepository(bookings);
      const stadiumRepo = manager.getRepository(stadium);

      if (!bookingRepo) {
        console.error('Booking repository is not available');
        throw new Error('Booking repository is not available');
      }

      // ดึง stadiumId จากตาราง stadium โดยใช้ userId
      const stadiumData = await stadiumRepo.findOne({
        where: { user_id: parseInt(userId) },
        select: ['stadium_id'],
      });
      if (!stadiumData) {
        return NextResponse.json(
          { success: false, message: 'No stadium found for user' },
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const stadiumId = stadiumData.stadium_id;

      const query = bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.court', 'court')
        .leftJoinAndSelect('booking.user', 'user')
        .select([
          'booking.booking_id AS id',
          'court.court_number AS court',
          'user.first_name AS firstname',
          'user.last_name AS lastname',
          'user.phone_number AS phone',
          'booking.start_time AS start',
          'booking.end_time AS end',
          'booking.booking_date AS bookingdate',
          'booking.created_date AS createddate',
          'booking.money_slip AS money_slip',
          'booking.status_id AS status_id',
        ])
        .where('booking.status_id = :statusId', { statusId: 3 })
        .andWhere('court.stadiumId = :stadiumId', { stadiumId }); // กรองตาม stadiumId

      if (searchTerm) {
        query.andWhere(
          'court.court_number::text LIKE :searchTerm OR LOWER(user.first_name) LIKE LOWER(:searchTerm) OR LOWER(user.last_name) LIKE LOWER(:searchTerm)',
          { searchTerm: `%${searchTerm}%` }
        );
      }

      console.log('Executing query...');
      const rawBookings = await query.getRawMany();
      console.log('Raw bookings fetched:', rawBookings);

      if (!rawBookings || rawBookings.length === 0) {
        console.log('No bookings found');
        return NextResponse.json(
          { success: true, data: { bookings: [] }, message: 'No bookings found' },
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const formattedBookings = rawBookings.map((booking) => {
        const slipBase64 = booking.money_slip
          ? `data:image/jpeg;base64,${Buffer.from(booking.money_slip).toString('base64')}`
          : '';

        return {
          id: booking.id,
          court: booking.court ? booking.court.toString() : 'N/A',
          name: `${booking.firstname || ''} ${booking.lastname || ''}`.trim() || 'N/A',
          phone: booking.phone || '-',
          times: booking.start && booking.end ? [`${booking.start} - ${booking.end}`] : [],
          status: booking.status_id === 2 ? 'approved' : booking.status_id === 1 ? 'rejected' : 'pending',
          statusId: booking.status_id,
          bookingDate: booking.bookingdate ? booking.bookingdate.toISOString().split('T')[0] : 'N/A',
          createdDate: booking.createddate ? booking.createddate.toISOString().split('T')[0] : 'N/A',
          paymentStatus: booking.money_slip ? 'paid' : 'unpaid',
          slipUrl: slipBase64,
        };
      });

      console.log('Formatted bookings:', formattedBookings);
      return NextResponse.json(
        { success: true, data: { bookings: formattedBookings } },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });
  } catch (err: any) {
    console.error('❌ /api/BS/getBookingApprovals error:', err.message, err.stack);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}