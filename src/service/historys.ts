import { SearchAccountParams } from '@/dto/request/historys';
import { historys, UserResponseModel } from '@/dto/response/historys';
import { history } from '@/repository/entity/historys';
import * as user from '@/repository/action/historys';

function formatUserResponse(usersData: { total: number; data: history[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: usersData.data.map((user): historys => ({
      HistoryID: user.history_id,
      UserID: user.user_id,
      BookingDate: user.booking_date instanceof Date ? user.booking_date.toISOString().split('T')[0] : user.booking_date,
      StartTime: user.start_time,
      EndTime: user.end_time,
      StadiumName: user.stadium_name,
      CourtNumber: user.court_number,
    })),
    total: usersData.total,
  };
}

export async function getAllUsers(params: SearchAccountParams): Promise<UserResponseModel> {
  try {
    const usersData = await user.findUsers(params);
    console.log('Users Data:', usersData);
    return formatUserResponse(usersData);
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      status_code: 500,
      status_message: 'Failed to fetch users',
      data: [],
      total: 0,
    };
  }
}