import { getDbConnection } from '../db_connection';
import { history } from '@/repository/entity/historys';
import { SearchAccountParams } from '@/dto/request/historys';
import { Like, Equal } from 'typeorm';

export const findUsers = async (params: SearchAccountParams) => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 30;
  const skip = (page - 1) * pageSize;
  const order = params.sort ? { [params.sort.field]: params.sort.order } : undefined;

  return await getDbConnection(async (manager) => {
    const where = {
      history_id: params.HistoryID ? Equal(Number(params.HistoryID)) : undefined,
      user_id: params.UserID ? Equal(Number(params.UserID)) : undefined,
      booking_date: params.BookingDate ? Equal(new Date(params.BookingDate)) : undefined, 
      start_time: params.StartTime ? Like(`%${params.StartTime}%`) : undefined,
      end_time: params.EndTime ? Like(`%${params.EndTime}%`) : undefined,
      stadium_name: params.StadiumName ? Like(`%${params.StadiumName}%`) : undefined,
      court_number: params.CourtNumber && !isNaN(Number(params.CourtNumber)) ? Equal(Number(params.CourtNumber)) : undefined,
    };

    const total = await manager.count(history, { where });
    const users = await manager.find(history, {
      where,
      skip,
      take: pageSize,
      order,
    });

    return { total, data: users };
  });
};