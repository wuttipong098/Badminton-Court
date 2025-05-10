import { getDbConnection } from '../db_connection';
import { stadium } from '@/repository/entity/stadium';
import { favorite } from '@/repository/entity/favorite';
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
      user_id: params.UserID ? Equal(Number(params.UserID)) : undefined,
      court_all: params.CourtAll && !isNaN(Number(params.CourtAll)) ? Equal(Number(params.CourtAll)) : undefined,
      stadium_name: params.StadiumName ? Like(`%${params.StadiumName}%`) : undefined,
      location: params.Location ? Like(`%${params.Location}%`) : undefined,
    };

    if (params.ImageStadium) {
      where.images = { image_stadium: Not(IsNull()) };
    }

    if (params.FavoriteID) {
      where.favorites = { favorite_id: Equal(Number(params.FavoriteID)) };
    }

    const total = await manager.count(stadium, {
      where,
      relations: ['images', 'favorites'],
    });

    const data = await manager.find(stadium, {
      where,
      relations: ['images', 'favorites'],
      skip,
      take: pageSize,
      order,
    });

    return { data, total };
  });
};

export const insertFavorite = async (params: CreateAccountParams) => {
  return await getDbConnection(async (manager) => {
    const newFavorite = new favorite();
    newFavorite.user_id = params.UserID!;
    newFavorite.stadium_id = params.StadiumID!;

    return await manager.save(newFavorite);
  });
};

export const deleteFavoriteById = async (params: DeleteAccountParams) => {
  return await getDbConnection(async (manager) => {
    return await manager.delete(favorite, { favorite_id: params.FavoriteID });
  });
};