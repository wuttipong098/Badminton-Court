"use client";

import styles from '@/styles/payment.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import moneyslip from "@/public/moneyslip.jpg";
import { FaCamera } from 'react-icons/fa';
import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface BookingSlot {
  courtId: number;
  slotTime: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface BookingData {
  userId: string;
  stadiumId: string;
  bookingDate: string;
  slots: BookingSlot[];
  total_price: number;
}

const PaymentPage = () => {
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [stadiumName, setStadiumName] = useState<string>("ไม่ระบุสนาม");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MySwal = withReactContent(Swal);

    // ฟังก์ชันแปลงวันที่จาก ISO (YYYY-MM-DD) เป็นรูปแบบไทย (วัน/เดือน/ปี)
    const formatThaiDate = (isoDate: string) => {
        const [year, month, day] = isoDate.split("-");
        const thaiYear = parseInt(year) + 543;
        return `${day}/${month}/${thaiYear}`;
    };

    // ฟังก์ชันดึงชื่อสนาม
    const fetchStadiumName = async (stadiumId: string) => {
        try {
            const response = await fetch('/api/stadium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    StadiumID: parseInt(stadiumId),
                }),
            });

            const result = await response.json();
            if (result.status_code === 200 && result.data && result.data.length > 0) {
                setStadiumName(result.data[0].StadiumName || "ไม่ระบุสนาม");
            } else {
                setStadiumName("ไม่ระบุสนาม");
            }
        } catch (error) {
            console.error('Error fetching stadium name:', error);
            setStadiumName("ไม่ระบุสนาม");
        }
    };

    // ดึงข้อมูลจาก localStorage และชื่อสนามเมื่อ component โหลด
    useEffect(() => {
        const data = localStorage.getItem('bookingData');
        if (data) {
            const parsedData: BookingData = JSON.parse(data);
            setBookingData(parsedData);
            fetchStadiumName(parsedData.stadiumId);
        } else {
            MySwal.fire("ข้อผิดพลาด", "ไม่พบข้อมูลการจอง", "error");
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setImageFile(reader.result.toString().split(',')[1]);
                    // ไม่เรียก handleSubmit เพื่อให้ผู้ใช้กด "ตกลง" เอง
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAttachSlip = () => {
        // เรียก click บน input file เพื่อเปิด dialog เลือกไฟล์
        fileInputRef.current?.click();
    };

    const handleSubmit = () => {
        // ตรวจสอบว่ามีการอัปโหลดสลิปหรือไม่
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

        MySwal.fire({
            title: 'ยินดีด้วย!',
            text: 'คุณได้ทำการจองสำเร็จแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#379DD6',
        }).then(() => {
            // ล้าง localStorage หลังจองสำเร็จ
            localStorage.removeItem('bookingData');
        });
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
                MySwal.fire(
                    'ยกเลิกสำเร็จ!',
                    'การจองของคุณถูกยกเลิกแล้ว',
                    'success'
                );
                // ล้าง localStorage หลังยกเลิก
                localStorage.removeItem('bookingData');
            }
        });
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
            <div className="flex flex-col md:flex-row justify-center items-start p-6 space-y-6 md:space-y-0 md:space-x-6">
                <div className="bg-white p-4 rounded-lg shadow-xl w-full md:w-1/3 min-h-[600px]">
                    <div className={styles.QR}>
                        <label>QR แสกนชำระเงิน</label>
                    </div>
                    <div className="flex justify-center">
                        <Image src={moneyslip} alt="QR Code for Payment" width={300} height={400} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-1/2 min-h-[600px]">
                    <div className={styles.information1}>
                        <label>รายละเอียดการจอง</label>
                    </div>
                    <div className="mt-6 space-y-3 text-gray-800">
                        <p className="text-lg font-semibold mt-4">ชื่อสนาม</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            {stadiumName}
                        </p>
                        <p className="text-lg font-semibold mt-4">วันที่จอง</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            {bookingData ? formatThaiDate(bookingData.bookingDate) : "ไม่ระบุวันที่"}
                        </p>
                        <p className="text-lg font-semibold mt-4">สนาม&เวลา</p>
                        <div className="flex flex-wrap gap-4 text-lg">
                            {bookingData && bookingData.slots.length > 0 ? (
                                bookingData.slots.map((slot, index) => (
                                    <p key={index} style={{ color: '#1F9378' }}>
                                        สนามที่ {slot.courtId}: {slot.slotTime}
                                    </p>
                                ))
                            ) : (
                                <p style={{ color: '#1F9378' }}>ไม่มีสล็อตที่เลือก</p>
                            )}
                        </div>
                        <p className="text-lg font-semibold mt-4">จำนวนเงิน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            {bookingData ? `${bookingData.total_price} บาท` : "0 บาท"}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-start p-6 space-y-6 md:space-y-0 md:space-x-6">
                <div className="bg-white p-4 rounded-lg shadow-xl w-full md:w-1/3 flex flex-col items-center min-h-[600px]">
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
                    <button
                        className="mt-4 bg-[#1F9378] text-white px-6 py-2 rounded-lg hover:bg-[#18755f] transition-colors"
                        onClick={handleAttachSlip}
                    >
                        แนบสลิปโอนเงิน
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-1/2 min-h-[600px]">
                    <div className={styles.information1}>
                        <label className="text-lg font-semibold text-white bg-[#1F9378] px-4 py-2 rounded-t-lg">
                            ข้อมูลการโอนเงิน
                        </label>
                    </div>
                    <div className="mt-6 space-y-3 text-gray-800">
                        <p className="text-lg font-semibold mt-4">ชื่อบัญชีผู้โอน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            วุฒิพงษ์ กระชั้น
                        </p>
                        <p className="text-lg font-semibold mt-4">เวลาที่โอน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>16:30</p>
                        <p className="text-lg font-semibold mt-4">วันที่โอน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            7 มีนาคม 2545
                        </p>
                        <p className="text-lg font-semibold mt-4">จำนวนเงิน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            {bookingData ? `${bookingData.total_price} บาท` : "0 บาท"}
                        </p>
                        <p className="text-lg font-semibold mt-4">โอนไปบัญชี</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            วุฒิพงษ์ กระชั้น
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-start space-x-4 p-6 pl-136">
                <button 
                    className="bg-[#1F9378] text-white px-6 py-2 rounded-lg hover:bg-[#18755f] transition-colors"
                    onClick={handleSubmit}
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
    );
};

export default PaymentPage;