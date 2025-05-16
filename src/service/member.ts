import { SearchMemberParams } from '@/dto/request/member';
import { MemberList, MemberResponseModel } from '@/dto/response/member';
import { findMemberStadiums } from '@/repository/action/member';
import { stadium } from '@/repository/entity/stadium';
import { imageow } from '@/repository/entity/imageow';

// ฟังก์ชันแปลงข้อมูล stadium เป็น MemberList
function formatMemberResponse(stadiumsData: { total: number; data: stadium[] }): MemberResponseModel {
  return {
    status_code: 200,
    status_message: 'Data fetched successfully',
    data: stadiumsData.data.map((stadium): MemberList => ({
      StadiumID: stadium.stadium_id,
      StadiumName: stadium.stadium_name,
      PhoneNumber: stadium.user.phone_number,
      Location: stadium.location,
      ImageStadium: stadium.images?.map((img: imageow) =>
        img.image_stadium ? Buffer.from(img.image_stadium).toString('base64') : ''
      )?.filter((img): img is string => !!img) ?? [],
      Situation: 'เปิดให้บริการ', 
      UserID: stadium.user.user_id,
      FirstName: stadium.user.first_name,
      LastName: stadium.user.last_name,
    })),
    total: stadiumsData.total,
  };
}

// ดึงข้อมูล stadiums
export async function getAllMemberStadiums(params: SearchMemberParams): Promise<MemberResponseModel> {
  try {
    const stadiumsData = await findMemberStadiums(params);
    console.log('Member Stadiums Data:', stadiumsData);
    return formatMemberResponse(stadiumsData);
  } catch (error: unknown) {
    console.error('Error fetching member stadiums:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      status_code: 500,
      status_message: `Failed to fetch stadiums: ${errorMessage}`,
      data: [],
      total: 0,
    };
  }
}