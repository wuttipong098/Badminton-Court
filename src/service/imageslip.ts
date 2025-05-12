import { SearchImageSlip } from '@/dto/request/imageslip';
import { UserResponseModel } from '@/dto/response/imageslip';
import * as stadiumAction from '@/repository/action/imageslip';

function formatStadiumResponse(stadiumsData: { total: number; data: { StadiumID: number; ImageSlip: string | null }[] }): UserResponseModel {
    return {
        status_code: 200,
        status_message: 'Data fetched successfully',
        data: stadiumsData.data.map((stadium) => ({
            StadiumID: stadium.StadiumID,
            ImageSlip: stadium.ImageSlip ?? undefined,
        })),
        total: stadiumsData.total,
    };
}

export async function getStadiumsWithImageSlip(params: SearchImageSlip): Promise<UserResponseModel> {
    try {
        const stadiumsData = await stadiumAction.findStadiumsWithImageSlip(params);
        return formatStadiumResponse(stadiumsData);
    } catch (error) {
        console.error('Error fetching stadiums:', error);
        return {
            status_code: 500,
            status_message: 'Failed to fetch stadiums',
            data: [],
            total: 0,
        };
    }
}