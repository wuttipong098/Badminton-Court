import { SaveBookingSettingRequest } from '@/dto/request/savebs';
import { SaveBookingSettingResponse } from '@/dto/response/savebs';
import { saveOrUpdateBookingSettingsRepo } from '@/repository/action/savebs';

export async function saveOrUpdateBookingSettingsService(
  data: SaveBookingSettingRequest
): Promise<SaveBookingSettingResponse> {
  try {
    return await saveOrUpdateBookingSettingsRepo(data);
  } catch (error) {
    console.error('❌ Booking settings service error:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า',
    };
  }
}
