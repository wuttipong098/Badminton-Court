// app/api/BS/getSetting/route.ts
import { NextResponse } from 'next/server'
import { getDbConnection } from '@/repository/db_connection'
import { stadium } from '@/repository/entity/stadium'
import { bookingRule } from '@/repository/entity/bookingRule'
import { imageow } from '@/repository/entity/imageow'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, stadiumId } = body

    if (!userId || !stadiumId) {
      return NextResponse.json(
        { status_code: 400, status_message: 'Missing userId or stadiumId' },
        { status: 400 }
      )
    }

    type BookingSettingData = {
      locationMessages: string[]
      slipImages:       string[]
      courtImages:      string[]
      bookingRules:     string[]
    }

    let result: BookingSettingData = {
      locationMessages: [],
      slipImages:       [],
      courtImages:      [],
      bookingRules:     [],
    }

    await getDbConnection(async (manager) => {
      //
      // 1) ดึง location + image_slip
      //
      const stadRepo = manager.getRepository(stadium)
      const stad = await stadRepo.findOne({
        where: { user_id: userId, stadium_id: stadiumId },
      })

      if (stad) {
        // ถ้า location เป็น string ก็แปลงเป็น array
        if (Array.isArray(stad.location)) {
          result.locationMessages = stad.location
        } else if (typeof stad.location === 'string') {
          result.locationMessages = [stad.location]
        }

        // ถ้า image_slip เป็น Buffer เดี่ยว
        if (stad.image_slip instanceof Buffer) {
          result.slipImages = [
            `data:image/jpeg;base64,${stad.image_slip.toString('base64')}`
          ]
        }
      }

      //
      // 2) ดึง booking rules
      //
      const ruleRepo = manager.getRepository(bookingRule)
      const rules = await ruleRepo.find({
        where: { user_id: userId }, // ไม่ต้องกรอง stadium_id ถ้า schema ไม่มี field นี้
      })
      result.bookingRules = rules.map((r) => r.rule_name)

      //
      // 3) ดึง court images
      //
      const imgRepo = manager.getRepository(imageow)
      const images = await imgRepo.find({
        where: { user_id: userId, stadium_id: stadiumId },
      })
      result.courtImages = images.map((img) =>
        `data:image/jpeg;base64,${img.image_stadium.toString('base64')}`
      )
    })

    return NextResponse.json(
      {
        status_code:    200,
        status_message: 'Success',
        data:           result,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ /api/BS/getSetting error:', err)
    return NextResponse.json(
      { status_code: 500, status_message: 'Internal server error' },
      { status: 500 }
    )
  }
}
