import { getDbConnection } from '../db_connection';
import { stadium } from '../entity';
import { SearchTimeParams } from '@/dto/request/timestop';

export const findTimeStops = async (params: SearchTimeParams) => {
    return await getDbConnection(async (manager) => {
        const total = await manager.count(stadium, {
            where: {
                stadium_id: params.StadiumID ? params.StadiumID : undefined,
            },
        });

        const data = await manager.find(stadium, {
            where: {
                stadium_id: params.StadiumID ? params.StadiumID : undefined,
            },
        });

        const transformedData = data.map((item) => ({
            paymentTime: item.paymentTime,
        }));

        return {
            total,
            data: transformedData,
        };
    });
};