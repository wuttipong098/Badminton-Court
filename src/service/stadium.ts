import { SearchAccountParams } from '@/dto/request/stadium';
import { stadiums, UserResponseModel } from '@/dto/response/stadium';
import { stadium } from '@/repository/entity/stadium';
import * as stadiumRepo from '@/repository/action/stadium';

function formatStadiumResponse(stadiumsData: { total: number; data: stadium[] }): UserResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: stadiumsData.data.map((stadium): stadiums => ({
      StadiumID: stadium.stadium_id,
      UserID: stadium.user_id,
      StadiumName: stadium.stadium_name,
      CourtAll: stadium.court_all,
      Location: stadium.location,
      ImageStadium: stadium.images?.map((img) => img.image_stadium).filter((img): img is string => !!img) ?? [],
      FavoriteID: stadium.favorites && stadium.favorites.length > 0 ? stadium.favorites[0].favorite_id : undefined,
    })),
    total: stadiumsData.total,
  };
}

export async function getAllStadiums(params: SearchAccountParams): Promise<UserResponseModel> {
  try {
    const stadiumsData = await stadiumRepo.findStadiums(params);
    console.log('Stadiums Data:', stadiumsData);
    return formatStadiumResponse(stadiumsData);
  } catch (error) {
    console.error('Error fetching stadiums:', error);
    return {
      status_code: 500,
      status_message: 'Failed to fetch stadiums',
      data: [],
      total: 0,
    };
  }
}