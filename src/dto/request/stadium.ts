import { stadium } from '@/repository/entity/stadium';

export interface SearchAccountParams {
  StadiumID?: number;
  UserID?: number;
  StadiumName?: string;
  CourtAll?: number;
  Location?: string;
  ImageStadium?: string | Buffer;
  FavoriteID?: number;
  page?: number;
  pageSize?: number;
  sort?: { field: keyof stadium; order: 'ASC' | 'DESC' };
}