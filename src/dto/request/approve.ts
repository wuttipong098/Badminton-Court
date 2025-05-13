import { registerB } from '@/repository/entity/registerBS';

export interface SearchAccountParams {
  StadiumName?: string;
  page?: number;
  pageSize?: number;
  sort?: { field: keyof registerB; order: 'ASC' | 'DESC' };
}

export interface CreateAccountParams {
  first_name?: string;
  last_name?: string;
  user_name?: string;
  password?: string;
  phone_number?: string;
  role_name?: string;
  stadium_name?: string;
  location?: string;
}

export interface DeleteAccountParams {
  RegisterID?: number;
}
