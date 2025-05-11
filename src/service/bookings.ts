import { CreateAccountParams } from '@/dto/request/bookings';
import { Bookings, UserResponseModel, ResponseModel } from '@/dto/response/bookings';
import { bookings } from '@/repository/entity';
import * as bookingAction from '@/repository/action/bookings';

function formatBookingResponse(bookingsData: { total: number; data: bookings[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: bookingsData.data.map((bookingData): Bookings => ({
      BookingId: bookingData.booking_id,
      UserID: bookingData.user_id,
      CourtId: bookingData.court_id,
      StartTime: bookingData.start_time ? bookingData.start_time.slice(0, 5) : '',
      EndTime: bookingData.end_time ? bookingData.end_time.slice(0, 5) : '',
      TotalPrice: bookingData.total_price,
      StatusID: bookingData.status_id,
      BookingDate: bookingData.booking_date,
    })),
    total: bookingsData.total,
  };
}

export async function createBookingService(params: CreateAccountParams): Promise<ResponseModel> {
  try {
    // ตรวจสอบว่าไม่มีค่าใดใน params เป็นค่าว่าง
    const requiredFields = {
      UserID: params.UserID || 0,
      CourtId: params.CourtId || 0,
      StartTime: params.StartTime || '',
      EndTime: params.EndTime || '',
      TotalPrice: params.TotalPrice || 0,
      StatusID: params.StatusID || 0,
      BookingDate: params.BookingDate || '',
    };

    if (Object.values(requiredFields).some(value => !value || value === 0)) {
      return {
        status_code: 400,
        status_message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
      };
    }

    // ตรวจสอบรูปแบบเวลา
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(requiredFields.StartTime) || !timeRegex.test(requiredFields.EndTime)) {
      return {
        status_code: 401,
        status_message: 'รูปแบบเวลาไม่ถูกต้อง ต้องเป็น HH:MM',
      };
    }

    // ตรวจสอบว่า EndTime ต้องมากกว่า StartTime
    const start = new Date(`1970-01-01T${requiredFields.StartTime}:00`);
    const end = new Date(`1970-01-01T${requiredFields.EndTime}:00`);
    if (end <= start) {
      return {
        status_code: 402,
        status_message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
      };
    }

    // ตรวจสอบว่า TotalPrice ต้องมากกว่า 0
    if (requiredFields.TotalPrice <= 0) {
      return {
        status_code: 403,
        status_message: 'ราคารวมต้องมากกว่า 0',
      };
    }

    // ตรวจสอบรูปแบบวันที่ (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(requiredFields.BookingDate)) {
      return {
        status_code: 404,
        status_message: 'รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น YYYY-MM-DD',
      };
    }

    // ตรวจสอบว่า BookingDate เป็นวันที่ที่ถูกต้อง
    const bookingDate = new Date(requiredFields.BookingDate);
    if (isNaN(bookingDate.getTime())) {
      return {
        status_code: 405,
        status_message: 'วันที่จองไม่ถูกต้อง',
      };
    }

    // เรียก insertBooking
    await bookingAction.insertBooking({
      ...params,
      UserID: requiredFields.UserID,
      CourtId: requiredFields.CourtId,
      StartTime: requiredFields.StartTime,
      EndTime: requiredFields.EndTime,
      TotalPrice: requiredFields.TotalPrice,
      StatusID: requiredFields.StatusID,
      BookingDate: requiredFields.BookingDate,
    });

    return {
      status_code: 200,
      status_message: 'สร้างการจองสำเร็จ',
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างการจอง:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถสร้างการจองได้',
    };
  }
}

export async function getAllBookings(params: any): Promise<UserResponseModel> {
  try {
    const bookingsData = await bookingAction.findBookings(params);
    return formatBookingResponse(bookingsData);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      status_code: 500,
      status_message: 'Failed to fetch bookings',
      data: [],
      total: 0,
    };
  }
}