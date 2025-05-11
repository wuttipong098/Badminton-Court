// repository/action/stadium.ts
import { getDbConnection } from '../db_connection';
import { stadium } from '@/repository/entity/stadium';
import { favorite } from '@/repository/entity/favorite';
import { user } from '@/repository/entity/login';
import { SearchAccountParams, CreateAccountParams, DeleteAccountParams } from '@/dto/request/stadium';
import { Like, Equal, Not, IsNull } from 'typeorm';

export const findStadiums = async (params: SearchAccountParams): Promise<{ data: stadium[]; total: number }> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 30;
  const skip = (page - 1) * pageSize;
  const order = params.sort ? { [params.sort.field]: params.sort.order } : undefined;

  return await getDbConnection(async (manager) => {
    const where: any = {
      stadium_id: params.StadiumID ? Equal(Number(params.StadiumID)) : undefined,
      court_all: params.CourtAll && !isNaN(Number(params.CourtAll)) ? Equal(Number(params.CourtAll)) : undefined,
      stadium_name: params.StadiumName ? Like(`%${params.StadiumName}%`) : undefined,
      location: params.Location ? Like(`%${params.Location}%`) : undefined,
    };

    if (params.ImageStadium) {
      where.images = { image_stadium: Not(IsNull()) };
    }

    const total = await manager.count(stadium, {
      where,
      relations: ['images', 'favorites', 'user'], 
    });

    const data = await manager.find(stadium, {
      where,
      relations: ['images', 'favorites', 'user'], 
      skip,
      take: pageSize,
      order,
    });

    if (params.UserID) {
      data.forEach((stadiumItem) => {
        stadiumItem.favorites = stadiumItem.favorites?.filter(
          (favorite) => favorite.user_id === Number(params.UserID)
        ) || [];
      });
    }

    return { data, total };
  });
};

export const insertFavorite = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newFavorite = new favorite();
    newFavorite.user_id = params.UserID!;
    newFavorite.stadium_id = params.StadiumID!;

    const savedFavorite = await manager.save(newFavorite);
    return savedFavorite.favorite_id;
  });
};

export const deleteFavoriteById = async (params: DeleteAccountParams) => {
  return await getDbConnection(async (manager) => {
    return await manager.delete(favorite, { favorite_id: params.FavoriteID });
  });
};