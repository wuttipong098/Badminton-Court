import { SearchTimeParams } from '@/dto/request/timestop';
import { TimeStopResponseModel, TimeStop } from '@/dto/response/timestop';
import * as timeStopAction from '@/repository/action/timestop';

function formatTimeStopResponse(timeStopsData: { total: number; data: { paymentTime?: string }[] }): TimeStopResponseModel {
    return {
        status_code: 200,
        status_message: 'Data fetched successfully',
        data: timeStopsData.data.map((timeStop): TimeStop => ({
            paymentTime: timeStop.paymentTime ?? undefined,
        })),
        total: timeStopsData.total,
    };
}

export async function getAllTimeStops(params: SearchTimeParams): Promise<TimeStopResponseModel> {
    try {
        const timeStopsData = await timeStopAction.findTimeStops(params);
        return formatTimeStopResponse(timeStopsData);
    } catch (error) {
        console.error('Error fetching time stops:', error);
        return {
            status_code: 500,
            status_message: 'Failed to fetch time stops',
            data: [],
            total: 0,
        };
    }
}