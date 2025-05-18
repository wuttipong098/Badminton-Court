import { UpdateAccountParams } from '@/dto/request/slottime';
import { SlotTimeResponseModel } from '@/dto/response/slottime';
import * as slotTimeAction from '@/repository/action/slottime';

export async function updateSlotTime(params: UpdateAccountParams): Promise<SlotTimeResponseModel> {
    try {
        // ตรวจสอบว่า SlotTimeID ไม่เป็นค่าว่าง
        if (!params.SlotTimeID) {
            return {
                status_code: 400,
                status_message: 'SlotTimeID is required',
                data: [],
                total: 0,
            };
        }

        const updatedSlotTime = await slotTimeAction.updateSlotTimeById(params);
        
        return {
            status_code: 200,
            status_message: 'Slot time updated successfully',
            data: [updatedSlotTime],
            total: 1,
        };
    } catch (error) {
        console.error('Error updating slot time:', error);
        return {
            status_code: 500,
            status_message: 'Failed to update slot time',
            data: [],
            total: 0,
        };
    }
}