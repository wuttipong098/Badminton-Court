import { CreateAccountParams, DeleteAccountParams, SearchAccountParams } from '@/dto/request/addmenu';
import { AddMenuResponseModel, ResponseModel, AddMenu } from '@/dto/response/addmenu';
import { addmenu } from '@/repository/entity/addmenu';
import * as bookingRepo from '@/repository/action/addmenu';

function formatBookingResponse(bookingData: { total: number; data: addmenu[] }): AddMenuResponseModel {
  return {
    status_code: 200,
    status_message: 'ดึงข้อมูลการจองสำเร็จ',
    data: bookingData.data.map((booking): AddMenu => ({
      addmenuID: booking.addmenu_id,
      UserID: booking.user_id,
      CourtId: booking.court_id,
      StartTime: booking.start_time,
      EndTime: booking.end_time,
      TotalPrice: booking.total_price,
      BookingDate: booking.booking_date,
      StatusID: booking.status_id,
    })),
    total: bookingData.total,
  };
}

export async function getAllBookings(params: SearchAccountParams): Promise<AddMenuResponseModel> {
  try {
    const bookingData = await bookingRepo.findBookings(params);
    return formatBookingResponse(bookingData);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถดึงข้อมูลการจองได้',
      data: [],
      total: 0,
    };
  }
}

export async function addBooking(params: CreateAccountParams): Promise<ResponseModel & { addmenuID?: number }> {
  try {
    const bookingId = await bookingRepo.insertBooking(params);
    return {
      status_code: 201,
      status_message: 'เพิ่มการจองสำเร็จ',
      addmenuID: bookingId,
    };
  } catch (error) {
    console.error('Error adding booking:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถเพิ่มการจองได้',
    };
  }
}

export async function removeBooking(params: DeleteAccountParams): Promise<ResponseModel> {
  try {
    const result = await bookingRepo.deleteBookingById(params);
    if (result.affected === 0) {
      return {
        status_code: 404,
        status_message: 'ไม่พบการจอง',
      };
    }
    return {
      status_code: 200,
      status_message: 'ลบการจองสำเร็จ',
    };
  } catch (error) {
    console.error('Error removing booking:', error);
    return {
      status_code: 500,
      status_message: 'ไม่สามารถลบการจองได้',
    };
  }
}