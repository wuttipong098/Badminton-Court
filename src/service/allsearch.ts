// src/service/check_stadium.ts
import { SearchAccountParams } from '@/dto/request/allsearch';
import { UserResponseModel, allsearch } from '@/dto/response/allsearch';
import { CourtNumber } from '@/repository/entity/court_number';
import * as stadiumRepo from '@/repository/action/allsearch';

function formatStadiumResponse(courtData: { data: CourtNumber[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Stadium ID fetched successfully',
    data: courtData.data.map((courtItem): allsearch => ({
      StadiumID: courtItem.stadium_id,
    })),
    total: courtData.data.length,
  };
}

export async function getStadiumBySlot(params: SearchAccountParams): Promise<UserResponseModel> {
  try {
    // ตรวจสอบว่ามีการส่ง BookingDate และ StartTime หรือไม่
    if (!params.BookingDate || !params.StartTime) {
      return {
        status_code: 400,
        status_message: 'BookingDate and StartTime are required',
        data: [],
        total: 0,
      };
    }

    const courtData = await stadiumRepo.findStadiumBySlot(params);
    console.log('Court Data:', courtData);

    if (courtData.data.length === 0) {
      return {
        status_code: 404,
        status_message: 'No available stadium found for the given date and time',
        data: [],
        total: 0,
      };
    }

    return formatStadiumResponse(courtData);
  } catch (error) {
    console.error('Error fetching stadium details:', error);
    return {
      status_code: 500,
      status_message: `Failed to fetch stadium details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: [],
      total: 0,
    };
  }
}