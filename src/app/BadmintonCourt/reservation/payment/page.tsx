"use client";

import styles from '@/styles/payment.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import moneyslip from "@/public/moneyslip.jpg";
import { FaCamera } from 'react-icons/fa';
import { useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const PaymentPage = () => {
    const [imageFile, setImageFile] = useState<string | null>(null);

    // ใช้เวอร์ชัน 1: เก็บเฉพาะ Base64
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

    // ฟังก์ชันสำหรับจัดการการกดปุ่ม "แนบสลิป"
    const handleSubmit = () => {
        Swal.fire({
            title: 'ยินดีด้วย!',
            text: 'คุณได้ทำการจองสำเร็จแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#379DD6', // ใช้สีปุ่มที่คุณกำหนดไว้
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
                        <p className="text-lg font-semibold mt-4">พรนิมิต</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>7 มีนาคม 2545</p>
                        <p className="text-lg font-semibold mt-4">สนาม&เวลา</p>
                        <div className="flex space-x-4 text-lg">
                            <p style={{ color: '#1F9378' }}>สนามที่ 1</p>
                            <p style={{ color: '#1F9378' }}>08:00-09:00</p>
                            <p style={{ color: '#1F9378' }}>09:00-10:00</p>
                        </div>
                        <p className="text-lg font-semibold mt-4">จำนวนเงิน</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>200 บาท</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-start p-6 space-y-6 md:space-y-0 md:space-x-6">
                <div className="bg-white p-4 rounded-lg shadow-xl w-full md:w-1/3 flex flex-col items-center min-h-[600px]">
                    <div className="flex justify-center mt-4">
                        <div className="relative w-[300px] h-[400px] border-2 border-dashed border-gray-300 flex items-center justify-center">
                            {imageFile ? (
                                <Image
                                    src={`data:image/jpeg;base64,${imageFile}`} // เพิ่มส่วน Data URL กลับเข้าไป
                                    alt="Uploaded Slip"
                                    layout="fill"
                                    objectFit="contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <FaCamera className="text-gray-500" size={50} />
                                    <p className="text-gray-500 mt-2">อัปโหลดสลิป</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    {imageFile && (
                        <div className="flex justify-center mt-6">
                            <button className={styles.button} onClick={handleSubmit}>
                                แนบสลิป
                            </button>
                        </div>
                    )}
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
                        <p className="text-lg" style={{ color: '#1F9378' }}>200 บาท</p>
                        <p className="text-lg font-semibold mt-4">โอนไปบัญชี</p>
                        <p className="text-lg" style={{ color: '#1F9378' }}>
                            วุฒิพงษ์ กระชั้น
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;