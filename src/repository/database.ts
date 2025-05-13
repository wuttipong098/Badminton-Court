import { DataSource } from 'typeorm';
import { history, Court, user, stadium, stadiumBS,imageow, favorite, image_owner, CourtNumber, SlotTime, Status, bookings, registerB, bookingRule} from '@/repository/entity'; // นำเข้าโมเดลที่ต้องการ
import {
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_TYPE,
  DATABASE_NAME,
} from '@/settings/configs';

// ถอดรหัสรหัสผ่านที่ถูกเข้ารหัส
const decodedPassword = decodeURIComponent(DATABASE_PASSWORD);

export const AppDataSource = new DataSource({
  type: DATABASE_TYPE as 'postgres',
  host: DATABASE_HOST,
  port: DATABASE_PORT ? parseInt(DATABASE_PORT, 10) : 5432,
  username: DATABASE_USERNAME,
  password: decodedPassword,
  database: DATABASE_NAME,
  synchronize: false,
  entities: [history, user, Court, stadium, stadiumBS, imageow, favorite, image_owner, CourtNumber, SlotTime, Status, bookings, registerB, bookingRule],
  logging: true,
  extra: {
    ssl: false,
  },
});

// การเชื่อมต่อกับฐานข้อมูล
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => console.log('Database connection error:', error));
