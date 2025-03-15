"use client";

import styles from '@/styles/account.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import accout from "@/public/kis.jpg"; // รูปภาพเริ่มต้น
import { FaUser, FaEnvelope, FaPhone, FaEdit } from 'react-icons/fa';
import { useState } from 'react';

const AccountPage = () => {
    const [imageFile, setImageFile] = useState<string | null>(null); // State สำหรับเก็บ Base64 ของรูปภาพ

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setImageFile(reader.result.toString().split(',')[1]); // เก็บข้อมูล Base64
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.container}>
            <div className="w-full h-35 bg-[#1F9378]">
                <div className={styles.header}>
                    <h1 className={styles.h1}>Badminton</h1>
                    <h2 className={styles.h2}>CourtBooking</h2>
                    <div className={styles.ball}>
                        <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
                    </div>
                </div>
            </div>

            {/* ส่วนที่ต้องการแต่ง */}
            <div className="flex flex-col items-center mt-10 px-5">
                {/* รูปภาพโปรไฟล์และปุ่มอัปโหลด */}
                <div className="mb-6 relative">
                    <Image
                        src={imageFile ? `data:image/jpeg;base64,${imageFile}` : accout}
                        alt="Profile Picture"
                        width={120}
                        height={120}
                        className="rounded-lg border-4 border-white shadow-lg" // เปลี่ยนเป็นสี่เหลี่ยมจัตตุรัส (rounded-lg แทน rounded-full)
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>

                <div className="w-full max-w-md space-y-4">
                    {/* User ID */}
                    <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                        <FaUser className="text-gray-600 mr-3" size={24} />
                        <span className="text-gray-800 font-medium">000001</span>
                    </div>

                    {/* Name */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaUser className="text-gray-600 mr-3" size={24} />
                            <span className="text-gray-800 font-medium">นาย วุฒิพงษ์ กระชั้น</span>
                        </div>
                        <FaEdit className="text-gray-600" size={20} />
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaEnvelope className="text-gray-600 mr-3" size={24} />
                            <span className="text-gray-800 font-medium">Acenpwk@gmail.com</span>
                        </div>
                        <FaEdit className="text-gray-600" size={20} />
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaPhone className="text-gray-600 mr-3" size={24} />
                            <span className="text-gray-800 font-medium">0935466494</span>
                        </div>
                        <FaEdit className="text-gray-600" size={20} />
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="mt-6">
                    <button className="bg-[#379DD6] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-[#2980b9] transition duration-300">
                        ยืนยัน
                    </button>
                </div>
            </div>
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default AccountPage;