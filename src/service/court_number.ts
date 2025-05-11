import { SearchAccountParams } from '@/dto/request/court';
import { court as CourtResponse, UserResponseModel } from '@/dto/response/court';
import { CourtNumber } from '@/repository/entity/court_number';
import { SlotTime } from '@/repository/entity/slot_time';
import { Status } from '@/repository/entity/status';
import * as courtRepo from '@/repository/action/court_number';

function formatCourtResponse(courtData: { data: CourtNumber[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: courtData.data.map((courtItem): CourtResponse => {
      return {
        CourtID: courtItem.court_id,
        StadiumID: courtItem.stadium_id,
        CourtNumber: courtItem.court_number,
        PriceHour: courtItem.price_hour,
        Active: courtItem.active,
        BookingDate: courtItem.slots.length > 0
          ? courtItem.slots[0].booking_date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')
          : '', // "DD/MM/YYYY" in Gregorian calendar
        TimeSlots: courtItem.slots.map((slot: SlotTime) => ({
          StartTime: slot.start_time,
          EndTime: slot.end_time,
          StatusName: slot.status instanceof Status ? slot.status.status_name : '',
        })),
      };
    }),
    total: courtData.data.length,
  };
}

export async function getCourtDetails(params: SearchAccountParams): Promise<UserResponseModel> {
  try {
    const courtData = await courtRepo.findCourtDetails(params);
    console.log('Court Data:', courtData);
    return formatCourtResponse(courtData);
  } catch (error) {
    console.error('Error fetching court details:', error);
    return {
      status_code: 500,
      status_message: `Failed to fetch court details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: [],
      total: 0,
    };
  }
}