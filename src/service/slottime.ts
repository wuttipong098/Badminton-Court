import { UpdateAccountParams } from '@/dto/request/slottime';
import { SlotTimeResponseModel } from '@/dto/response/slottime';
import * as slotTimeAction from '@/repository/action/slottime';

export async function updateSlotTime(params: UpdateAccountParams): Promise<SlotTimeResponseModel> {
  try {
    // ตรวจสอบว่ามีพารามิเตอร์ที่จำเป็น
    if (!params.SlotTimeID && (!params.CourtId || !params.BookingDate || !params.StartTime || !params.EndTime)) {
      return {
        status_code: 400,
        status_message: 'SlotTimeID or (CourtId, BookingDate, StartTime, EndTime) are required',
        data: [],
        total: 0,
      };
    }

    const updatedSlotTime = await slotTimeAction.updateSlotTimeById(params);

    return {
      status_code: 200,
      status_message: 'Slot time updated successfully',
      data: [updatedSlotTime],
      total: 1,
    };
  } catch (error) {
    console.error('Error updating slot time:', error);
    return {
      status_code: 500,
      status_message: 'Failed to update slot time',
      data: [],
      total: 0,
    };
  }
}