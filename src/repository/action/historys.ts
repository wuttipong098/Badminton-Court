import { getDbConnection } from '../db_connection';
import { bookings } from '@/repository/entity/bookings';
import { CourtNumber } from '@/repository/entity/court_number';
import { stadium } from '@/repository/entity/stadium';
import { SearchHistoryParams } from '@/dto/request/historys';
import { UserResponseModel, historys } from '@/dto/response/historys';
import { Like } from 'typeorm';

export const findBookingHistory = async (params: SearchHistoryParams): Promise<UserResponseModel> => {
  return await getDbConnection(async (manager) => {
    try {
      const page = params.page && params.page > 0 ? params.page : 1;
      const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 5;
      const skip = (page - 1) * pageSize;
      console.log('Pagination params:', { page, pageSize, skip });

      const queryBuilder = manager
        .createQueryBuilder(bookings, 'booking')
        .leftJoinAndSelect(CourtNumber, 'court', 'court.court_id = booking.court_id')
        .leftJoinAndSelect(stadium, 'stadium', 'stadium.stadium_id = court.stadium_id')
        .select([
          'booking.user_id AS "UserID"',
          'booking.booking_date AS "BookingDate"',
          'booking.start_time AS "StartTime"',
          'booking.end_time AS "EndTime"',
          'stadium.stadium_name AS "StadiumName"',
          'court.court_number AS "CourtNumber"',
          'booking.status_id AS "StatusID"',
        ]);

      // เพิ่มเงื่อนไขการค้นหา StadiumName
      if (params.StadiumName) {
        queryBuilder.andWhere('stadium.stadium_name LIKE :stadiumName', {
          stadiumName: `%${params.StadiumName.trim()}%`,
        });
      }

      // เพิ่มการเรียงลำดับตาม booking_date จากมากไปน้อย
      queryBuilder.orderBy('booking.booking_date', 'DESC');

      // เพิ่มการแบ่งหน้า (วางก่อน getCount และ getRawMany)
      queryBuilder.skip(skip).take(pageSize);

      // คำนวณจำนวนรายการทั้งหมด
      const total = await queryBuilder.getCount();
      console.log('Total count:', total);

      // Log SQL query เพื่อ debug
      console.log('Generated SQL:', queryBuilder.getSql());

      // ดึงข้อมูล
      const results = await queryBuilder.getRawMany();
      console.log('Raw query results:', results);

      // ตรวจสอบผลลัพธ์
      if (!results || results.length === 0) {
        console.log('No booking history found for query:', params);
        return {
          status_code: 200,
          status_message: 'No data found',
          data: [],
          total,
        };
      }

      // ตรวจสอบจำนวนผลลัพธ์ (เผื่อ TypeORM คืนเกิน)
      if (results.length > pageSize) {
        console.warn('Results exceed pageSize, trimming to pageSize:', pageSize);
        results.splice(pageSize);
      }

      // แปลงผลลัพธ์ให้ตรงกับ interface historys
      const data: historys[] = results.map((item: any) => {
        console.log('Result item:', item);
        return {
          UserID: item.UserID || item.userid || 0,
          BookingDate: item.BookingDate || item.bookingdate || '',
          StartTime: item.StartTime || item.starttime || '',
          EndTime: item.EndTime || item.endtime || '',
          StadiumName: item.StadiumName || item.stadiumname || '',
          CourtNumber: item.CourtNumber || item.courtnumber || 0,
          StatusID: item.StatusID || item.statusid || 0,
        };
      });

      return {
        status_code: 200,
        status_message: 'Success',
        data,
        total,
      };
    } catch (error) {
      console.error('Error fetching booking history:', error);
      return {
        status_code: 500,
        status_message: 'Internal Server Error',
        data: [],
        total: 0,
      };
    }
  });
};