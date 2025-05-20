"use client";

import styles from '@/styles/payment.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { FaCamera } from 'react-icons/fa';
import { useState, useEffect, useRef } from "react";
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { CreateAccountParams } from '@/dto/request/bookings';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface BookingSlot {
  courtId: number;
  slotTime: string;
  startTime: string;
  endTime: string;
  price: number;
  bookingDate: string;
}

interface BookingData {
  userId: string;
  stadiumId: string;
  bookingDates: string[];
  slots: BookingSlot[];
  total_price: number;
}

const PaymentPage = () => {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [apiImageSlip, setApiImageSlip] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [stadiumName, setStadiumName] = useState<string>("ลูกขนไก่");
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(900);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MySwal = withReactContent(Swal);

  const formatThaiDate = (isoDate: string | null | undefined): string => {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      console.warn('Invalid date format or missing date:', isoDate);
      return "ไม่ระบุวันที่";
    }
    try {
      const [year, month, day] = isoDate.split("-");
      const thaiYear = parseInt(year) + 543;
      return `${day}/${month}/${thaiYear}`;
    } catch (error: unknown) {
      console.error('Error formatting date:', error);
      return "ไม่ระบุวันที่";
    }
  };

  const fetchStadiumName = async (stadiumId: string) => {
    setStadiumName("ลูกขนไก่");
  };

  const fetchImageSlip = async (stadiumId: string) => {
    try {
      const response = await fetch('/api/imageslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ StadiumID: parseInt(stadiumId) }),
      });
      const result = await response.json();
      if (result.status_code === 200 && result.data?.length > 0 && result.data[0].ImageSlip) {
        setApiImageSlip(result.data[0].ImageSlip);
      } else {
        setApiImageSlip(null);
      }
    } catch (error: unknown) {
      console.error('Error fetching ImageSlip:', error);
      setApiImageSlip(null);
    }
  };

  const fetchPaymentTime = async (stadiumId: string) => {
    try {
      const response = await fetch('/api/timestop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ StadiumID: parseInt(stadiumId) }),
      });
      const result = await response.json();
      if (result.status_code === 200 && result.data?.length > 0 && result.data[0].paymentTime) {
        const paymentTimeInMinutes = parseInt(result.data[0].paymentTime);
        if (!isNaN(paymentTimeInMinutes)) {
          setTimerDuration(paymentTimeInMinutes * 60);
        } else {
          console.warn('Invalid paymentTime, using default 15 minutes');
          setTimerDuration(900);
        }
      } else {
        console.warn('No paymentTime found, using default 15 minutes');
        setTimerDuration(900);
      }
    } catch (error: unknown) {
      console.error('Error fetching paymentTime:', error);
      setTimerDuration(900);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('bookingData');
    console.log('Raw data from localStorage:', data);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log('Parsed bookingData:', parsedData);

        const adjustedData: BookingData = {
          userId: parsedData.userId,
          stadiumId: parsedData.stadiumId,
          bookingDates: parsedData.bookingDates || [parsedData.bookingDate],
          slots: parsedData.slots.map((slot: any) => ({
            ...slot,
            startTime: slot.startTime.slice(0, 5),
            endTime: slot.endTime.slice(0, 5),
            bookingDate: slot.bookingDate || parsedData.bookingDate,
          })),
          total_price: parsedData.total_price,
        };

        if (!adjustedData.stadiumId || !adjustedData.userId || !adjustedData.slots || adjustedData.slots.length === 0) {
          throw new Error("Incomplete booking data");
        }

        setBookingData(adjustedData);
        fetchStadiumName(adjustedData.stadiumId);
        fetchImageSlip(adjustedData.stadiumId);
        fetchPaymentTime(adjustedData.stadiumId);
      } catch (error: unknown) {
        console.error('Error parsing booking data:', error);
        let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        MySwal.fire("ข้อผิดพลาด", "ข้อมูลการจองไม่สมบูรณ์: " + errorMessage, "error").then(() => {
          window.location.href = '/BadmintonCourt/reservation';
        });
      }
    } else {
      console.warn('No bookingData found in localStorage');
      MySwal.fire("ข้อผิดพลาด", "ไม่พบข้อมูลการจอง", "error").then(() => {
        window.location.href = '/BadmintonCourt/reservation';
      });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImageFile(reader.result.toString().split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachSlip = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (isTimerExpired) {
      MySwal.fire({
        title: 'หมดเวลา',
        text: 'เวลาสำหรับการชำระเงินหมดลง กรุณาเริ่มการจองใหม่',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#379DD6',
      }).then(() => {
        localStorage.removeItem('bookingData');
        window.location.href = '/';
      });
      return;
    }

    if (!imageFile) {
      MySwal.fire({
        title: 'ข้อผิดพลาด',
        text: 'กรุณาอัปโหลดสลิปการชำระเงินก่อนยืนยันการจอง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#379DD6',
      });
      return;
    }

    if (!bookingData) {
      MySwal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่พบข้อมูลการจอง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#379DD6',
      });
      return;
    }

    const requestBody: CreateAccountParams = {
      UserID: parseInt(bookingData.userId),
      BookingDate: bookingData.bookingDates[0],
      Slots: bookingData.slots.map(slot => ({
        CourtId: slot.courtId,
        StartTime: slot.startTime,
        EndTime: slot.endTime,
      })),
      MoneySlip: imageFile,
    };

    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();

      if (result.status_code === 200) {
        MySwal.fire({
          title: 'ยินดีด้วย!',
          text: 'คุณได้ทำการจองสำเร็จแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#379DD6',
        }).then(() => {
          localStorage.removeItem('bookingData');
          window.location.href = '/BadmintonCourt/historys';
        });
      } else {
        MySwal.fire({
          title: 'ข้อผิดพลาด',
          text: result.status_message || 'เกิดข้อผิดพลาดในการจอง',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#379DD6',
        });
      }
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      let errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      MySwal.fire({
        title: 'ข้อผิดพลาด',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#379DD6',
      });
    }
  };

  const handleCancel = () => {
    MySwal.fire({
      title: 'ยกเลิกการจอง',
      text: 'คุณต้องการยกเลิกการจองนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#379DD6',
      confirmButtonText: 'ใช่, ยกเลิก',
      cancelButtonText: 'ไม่'
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire('ยกเลิกสำเร็จ!', 'การจองของคุณถูกยกเลิกแล้ว', 'success');
        localStorage.removeItem('bookingData');
        window.location.href = '/BadmintonCourt/reservation';
      }
    });
  };

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>
        <div className="text-sm">นาที:วินาที</div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className="w-full h-32 bg-[#1F9378]">
        <div className={styles.header}>
          <h1 className={styles.h1}>Badminton</h1>
          <h2 className={styles.h2}>CourtBooking</h2>
          <div className={styles.ball}>
            <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-start p-6 space-x-0 md:space-x-6 space-y-6 md:space-y-0">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-1/3 min-h-[600px]">
          <div className={styles.QR}>
            <label>QR แสกนชำระเงิน</label>
          </div>
          {apiImageSlip && (
            <div className="flex justify-center mt-4">
              <Image
                src={`data:image/jpeg;base64,${apiImageSlip}`}
                alt="QR Code for Payment"
                width={300}
                height={400}
                objectFit="contain"
              />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-1/3 min-h-[600px]">
          <div className={styles.information1}>
            <label>รายละเอียดการจอง</label>
          </div>
          <div className="mt-6 space-y-3 text-gray-800">
            <p className="text-lg font-semibold mt-4">ชื่อสนาม</p>
            <p className="text-lg" style={{ color: '#1F9378' }}>{stadiumName}</p>
            {bookingData && bookingData.slots.length > 0 ? (
              Object.entries(
                bookingData.slots.reduce((acc, slot) => {
                  const date = slot.bookingDate;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(slot);
                  return acc;
                }, {} as Record<string, BookingSlot[]>)
              ).map(([date, slots]) => (
                <div key={date}>
                  <p className="text-lg font-semibold" style={{ color: '#000000' }}>
                    สนาม&เวลาของวันที่ {formatThaiDate(date)}
                  </p>
                  <div className="flex flex-wrap gap-4 text-lg">
                    {slots.map((slot, index) => (
                      <p key={index}>
                        <span style={{ color: '#1F9378' }}>สนามที่ {slot.courtId}</span>
                        <span style={{ color: '#379DD6' }}>: {slot.startTime} - {slot.endTime}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#1F9378' }}>ไม่มีสล็อตที่เลือก</p>
            )}
            <p className="text-lg font-semibold mt-4">จำนวนเงิน</p>
            <p className="text-lg" style={{ color: '#1F9378' }}>
              {bookingData ? `${bookingData.total_price} บาท` : "0 บาท"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xl w-full md:w-1/3 min-h-[600px] flex flex-col items-center">
          <div className="flex justify-center mt-4">
            <div
              className="relative w-[300px] h-[400px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={handleAttachSlip}
            >
              {imageFile ? (
                <Image
                  src={`data:image/jpeg;base64,${imageFile}`}
                  alt="Uploaded Slip"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <FaCamera className="text-gray-500" size={50} />
                  <p className="text-gray-500 mt-2">อัปโหลดสลิปโอนเงิน</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          </div>
          <div className="mt-4">
            <CountdownCircleTimer
              isPlaying
              duration={timerDuration}
              colors={['#1F9378', '#F7B801', '#A30000']}
              colorsTime={[timerDuration, timerDuration / 3, 0]}
              size={120}
              strokeWidth={10}
              onComplete={() => {
                setIsTimerExpired(true);
                if (bookingData?.userId) {
                  localStorage.setItem('userId', bookingData.userId);
                }
                window.location.href = '/BadmintonCourt/reservation';
                return { shouldRepeat: false };
              }}
            >
              {renderTime}
            </CountdownCircleTimer>
          </div>
          <div className="flex flex-col items-center space-y-4 mt-4">
            <button
              className="bg-[#1F9378] text-white px-6 py-2 rounded-lg hover:bg-[#18755f] transition-colors"
              onClick={handleAttachSlip}
            >
              แนบสลิปโอนเงิน
            </button>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-[#1F9378] text-white px-6 py-2 rounded-lg hover:bg-[#18755f] transition-colors"
                onClick={handleSubmit}
                disabled={isTimerExpired}
              >
                ตกลง
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={handleCancel}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;