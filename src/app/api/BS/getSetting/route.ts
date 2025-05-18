import { NextResponse } from 'next/server';
import { getDbConnection } from '@/repository/db_connection';
import { stadium } from '@/repository/entity/stadium';
import { imageow } from '@/repository/entity/imageow';
import { Court } from '@/repository/entity/Court';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, stadiumId } = body;

    if (!userId || !stadiumId) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Missing userId or stadiumId' },
        { status: 400 }
      );
    }

    type BookingSettingData = {
      locationMessages: string[];
      slipImages: string[];
      courtImages: string[];
      bookingRules: string[];
      payment_time: string[];
      price: string[];
      closeDates: string[];
    };

    let result: BookingSettingData = {
      locationMessages: [],
      slipImages: [],
      courtImages: [],
      bookingRules: [],
      payment_time: [],
      price: [],
      closeDates: [],
    };

    await getDbConnection(async (manager) => {
      // 1) ดึงข้อมูลจาก stadium
      const stadRepo = manager.getRepository(stadium);
      const stad = await stadRepo.findOne({
        where: { user_id: userId, stadium_id: stadiumId },
      });

      if (stad) {
        // location
        if (Array.isArray(stad.location)) {
          result.locationMessages = stad.location;
        } else if (typeof stad.location === 'string') {
          result.locationMessages = [stad.location];
        }

        // image_slip
        if (stad.image_slip instanceof Buffer) {
          result.slipImages = [
            `data:image/jpeg;base64,${stad.image_slip.toString('base64')}`,
          ];
        }

        // payment_time
        result.payment_time = Array.isArray(stad.paymentTime)
          ? stad.paymentTime
          : typeof stad.paymentTime === 'string'
            ? [stad.paymentTime]
            : [];

        // closeDates
        if (stad.closeDates) {
          try {
            const parsedDates = JSON.parse(stad.closeDates);
            if (Array.isArray(parsedDates)) {
              result.closeDates = parsedDates;
            }
          } catch (e) {
            console.warn(`Failed to parse closeDates for stadium ${stadiumId}:`, e);
            result.closeDates = [];
          }
        }
      }

      // 2) ดึง court images
      const imgRepo = manager.getRepository(imageow);
      const images = await imgRepo.find({
        where: { user_id: userId, stadium_id: stadiumId },
      });
      result.courtImages = images.map((img) =>
        `data:image/jpeg;base64,${img.image_stadium.toString('base64')}`
      );

      // 3) ดึง price จาก Court
      const courtRepo = manager.getRepository(Court);
      const courts = await courtRepo.find({
        where: { stadiumId },
        select: ['price'], // ดึงแค่ price
      });

      // รวม price จากทุก court เป็น array
      result.price = courts
        .map((court) => (court.price !== null && court.price !== undefined ? court.price.toString() : ''))
        .filter((price) => price !== ''); // ลบค่า null/undefined
    });

    return NextResponse.json(
      {
        status_code: 200,
        status_message: 'Success',
        data: result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('❌ /api/BS/getSetting error:', err);
    return NextResponse.json(
      { status_code: 500, status_message: 'Internal server error' },
      { status: 500 }
    );
  }
}