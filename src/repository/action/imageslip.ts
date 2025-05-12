import { getDbConnection } from '../db_connection';
import { stadium } from '../entity';
import { SearchImageSlip } from '@/dto/request/imageslip';

export const findStadiumsWithImageSlip = async (params: SearchImageSlip) => {
    return await getDbConnection(async (manager) => {
        const where: any = {
            stadium_id: params.StadiumID ? params.StadiumID : undefined,
        };

        if (params.ImageSlip === null || params.ImageSlip === undefined) {
            where.image_slip = null;
        }

        const total = await manager.count(stadium, { where });

        const data = await manager.find(stadium, { where });

        const transformedData = data.map((item) => ({
            StadiumID: item.stadium_id,
            ImageSlip: item.image_slip ? item.image_slip.toString('base64') : null,
        }));

        return {
            total,
            data: transformedData,
        };
    });
};