import { getDbConnection } from '../db_connection';
import { image_owner } from '../entity';
import { UpdateAccountParams } from '@/dto/request/test';


export const updateUserById = async (params: UpdateAccountParams) => {
    return await getDbConnection(async (manager) => {
        const userData = await manager.findOne(image_owner, { where: { imowner_id: params.ImownerID } });
        if (!userData) throw new Error(`User with ID ${params.ImownerID} not found`);

        userData.user_id = params.UserID ?? userData.user_id;
        userData.stadium_id = params.StadiumID ?? userData.stadium_id;

        if (params.ImageStadium) {
            if (typeof params.ImageStadium === 'string') {
                try {
                    userData.image_stadium = Buffer.from(params.ImageStadium, 'base64');
                } catch (e) {
                    throw new Error('Invalid base64 string for ImageStadium');
                }
            } else {
                userData.image_stadium = params.ImageStadium;
            }
        }

        return manager.save(userData);
    });
};