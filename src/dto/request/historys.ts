import { history } from '@/repository/entity/historys';

export interface SearchAccountParams {
  HistoryID?: number;
  UserID?: number;
  BookingDate?: string;
  StartTime?: string;
  EndTime?: string;
  StadiumName?: string;
  CourtNumber?: number;
  page?: number;
  pageSize?: number;
  sort?: { field: keyof history; order: 'ASC' | 'DESC' };
}