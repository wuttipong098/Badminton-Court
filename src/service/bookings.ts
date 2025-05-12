import { CreateAccountParams, Slot } from '@/dto/request/bookings';
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
      MoneySlip: bookingData.money_slip ? bookingData.money_slip.toString('base64') : undefined, // แปลง Buffer เป็น base64
    })),
    total: bookingsData.total,
  };
}

export async function createBookingService(params: CreateAccountParams): Promise<ResponseModel> {
  try {
    // ตรวจสอบฟิลด์ที่จำเป็น
    const requiredFields = {
      UserID: params.UserID || 0,
      BookingDate: params.BookingDate || '',
    };

    if (Object.values(requiredFields).some(value => !value || value === 0)) {
      return {
        status_code: 400,
        status_message: 'กรุณากรอก UserID และ BookingDate ให้ครบ',
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

    // ตรวจสอบ Slots หรือสล็อตเดียว
    const slots: Slot[] = params.Slots
      ? params.Slots
      : params.CourtId && params.StartTime && params.EndTime
      ? [{ CourtId: params.CourtId, StartTime: params.StartTime, EndTime: params.EndTime }]
      : [];

    if (slots.length === 0) {
      return {
        status_code: 400,
        status_message: 'ต้องระบุอย่างน้อยหนึ่งสล็อต',
      };
    }

    // ตรวจสอบรูปแบบและความถูกต้องของเวลาในแต่ละสล็อต
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const slot of slots) {
      if (!slot.CourtId || !slot.StartTime || !slot.EndTime) {
        return {
          status_code: 400,
          status_message: 'CourtId, StartTime, และ EndTime ต้องไม่ว่างในทุกสล็อต',
        };
      }

      if (!timeRegex.test(slot.StartTime) || !timeRegex.test(slot.EndTime)) {
        return {
          status_code: 401,
          status_message: `รูปแบบเวลาไม่ถูกต้องในสล็อต ${slot.StartTime}-${slot.EndTime} ต้องเป็น HH:MM`,
        };
      }

      const start = new Date(`1970-01-01T${slot.StartTime}:00`);
      const end = new Date(`1970-01-01T${slot.EndTime}:00`);
      if (end <= start) {
        return {
          status_code: 402,
          status_message: `เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้นในสล็อต ${slot.StartTime}-${slot.EndTime}`,
        };
      }
    }

    // ตรวจสอบ MoneySlip ถ้ามี
    if (params.MoneySlip !== undefined && params.MoneySlip !== null && params.MoneySlip !== '') {
      if (typeof params.MoneySlip === 'string') {
        try {
          Buffer.from(params.MoneySlip, 'base64'); // ตรวจสอบว่า base64 ถูกต้อง
        } catch (e) {
          return {
            status_code: 400,
            status_message: 'รูปแบบ base64 ของ MoneySlip ไม่ถูกต้อง',
          };
        }
      }
    }

    // เรียก insertBooking
    await bookingAction.insertBooking({
      ...params,
      UserID: requiredFields.UserID,
      BookingDate: requiredFields.BookingDate,
      Slots: slots,
    });

    return {
      status_code: 200,
      status_message: 'สร้างการจองสำเร็จ',
    };
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการสร้างการจอง:', error.message);
    if (error.message.includes('CourtId is required') || error.message.includes('not found')) {
      return {
        status_code: 404,
        status_message: error.message,
      };
    }
    if (
      error.message.includes('Invalid time format') ||
      error.message.includes('StartTime and EndTime are required') ||
      error.message.includes('EndTime must be greater than StartTime') ||
      error.message.includes('Invalid base64 string for MoneySlip')
    ) {
      return {
        status_code: 401,
        status_message: error.message,
      };
    }
    if (error.message.includes('Overlapping slots detected') || error.message.includes('overlaps with existing booking')) {
      return {
        status_code: 409,
        status_message: error.message,
      };
    }
    return {
      status_code: 500,
      status_message: 'ไม่สามารถสร้างการจองได้: ' + error.message,
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