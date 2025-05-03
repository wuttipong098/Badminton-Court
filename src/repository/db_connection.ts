import { AppDataSource } from './database';
import { EntityManager } from 'typeorm';

export const getDbConnection = async <T>(task: (manager: EntityManager) => Promise<T>): Promise<T> => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('Database connection initialized');
    } catch (error) {
      console.error('Error initializing database connection:', error);
      throw error;
    }
  }

  const manager = AppDataSource.manager;

  try {
    const result = await task(manager);
    return result;
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
};
