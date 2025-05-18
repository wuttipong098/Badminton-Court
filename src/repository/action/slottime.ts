import { getDbConnection } from '../db_connection';
import { SlotTime } from '../entity';
import { UpdateAccountParams } from '@/dto/request/slottime';
import { UpSlotTime } from '@/dto/response/slottime';

export const updateSlotTimeById = async (params: UpdateAccountParams): Promise<UpSlotTime> => {
  return await getDbConnection(async (manager) => {
    let slotTimeData: SlotTime | null;

    // ถ้ามี SlotTimeID ใช้มันในการค้นหา
    if (params.SlotTimeID) {
      slotTimeData = await manager.findOne(SlotTime, { where: { slot_time_id: params.SlotTimeID } });
      if (!slotTimeData) throw new Error(`Slot time with ID ${params.SlotTimeID} not found`);
    } else {
      // ถ้าไม่มี SlotTimeID ใช้ CourtId, BookingDate, StartTime, EndTime ในการค้นหา
      if (!params.CourtId || !params.BookingDate || !params.StartTime || !params.EndTime) {
        throw new Error('CourtId, BookingDate, StartTime, and EndTime are required when SlotTimeID is not provided');
      }

      slotTimeData = await manager.findOne(SlotTime, {
        where: {
          court_id: params.CourtId,
          booking_date: new Date(params.BookingDate),
          start_time: params.StartTime,
          end_time: params.EndTime,
        },
      });
      if (!slotTimeData) throw new Error('Slot time not found for the provided parameters');
    }

    // อัปเดตข้อมูล
    slotTimeData.court_id = params.CourtId ?? slotTimeData.court_id;
    slotTimeData.booking_date = params.BookingDate ? new Date(params.BookingDate) : slotTimeData.booking_date;
    slotTimeData.start_time = params.StartTime ?? slotTimeData.start_time;
    slotTimeData.end_time = params.EndTime ?? slotTimeData.end_time;
    slotTimeData.status_id = params.StatusID ?? slotTimeData.status_id;
    slotTimeData.update_date = new Date();

    const savedData = await manager.save(slotTimeData);

    return {
      SlotTimeID: savedData.slot_time_id,
      CourtId: savedData.court_id,
      BookingDate: savedData.booking_date.toISOString().split('T')[0],
      StartTime: savedData.start_time,
      EndTime: savedData.end_time,
      StatusID: savedData.status_id,
    };
  });
};