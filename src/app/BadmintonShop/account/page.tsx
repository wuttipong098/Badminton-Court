"use client";

import styles from '@/styles/account.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import accout from "@/public/kis.jpg";
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const AccountPage = () => {
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
    const [isSubmitted, setIsSubmitted] = useState(false); // เช็คว่ากด "ยืนยัน" แล้วหรือยัง

    const [userData, setUserData] = useState({
        name: "นาย วุฒิพงษ์ กระชั้น",
        email: "Acenpwk@gmail.com",
        phone: "0935466494",
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setImageFile(reader.result.toString());
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateInput = () => {
        let newErrors = { name: "", email: "", phone: "" };

        if (userData.name.trim() === "") {
            newErrors.name = "ชื่อห้ามเว้นว่าง";
        }
        if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
            newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        if (!/^\d{10}$/.test(userData.phone)) {
            newErrors.phone = "เบอร์โทรต้องมี 10 หลัก";
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === ""); // คืนค่า true ถ้าผ่าน validation
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: "name" | "email" | "phone") => {
        setUserData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    useEffect(() => {
        if (userData.phone.length > 10) {
            setErrors((prev) => ({ ...prev, phone: "เบอร์โทรต้องมีไม่เกิน 10 หลัก" }));
        } else if (!/^\d{10}$/.test(userData.phone) && userData.phone.length === 10) {
            setErrors((prev) => ({ ...prev, phone: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก" }));
        } else {
            setErrors((prev) => ({ ...prev, phone: "" })); // เคลียร์ error ถ้าถูกต้อง
        }
    }, [userData.phone]);

    const handleSubmit = () => {
        setIsSubmitted(true); // ทำให้ error message ปรากฏเมื่อกดปุ่ม
        if (validateInput()) {
            alert("บันทึกข้อมูลสำเร็จ! ✅"); // หรือเปลี่ยนเป็นส่งข้อมูลไป backend
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

            {/* รูปภาพโปรไฟล์และปุ่มอัปโหลด */}
            <div className="flex flex-col items-center mt-10 px-5">
                <div className="mb-6 relative">
                    <Image
                        src={imageFile || accout}
                        alt="Profile Picture"
                        width={120}
                        height={120}
                        className="rounded-lg border-4 border-white shadow-lg"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>

                <div className="w-full max-w-md space-y-4">
                    {/* User ID (สีเทา ห้ามแก้ไข) */}
                    <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                        <FaUser className="text-gray-400 mr-3" size={24} />
                        <span className="text-gray-400 font-medium cursor-not-allowed select-none">
                            000001
                        </span>
                    </div>

                    {/* Name */}
                    <div className="bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaUser className="text-gray-600 mr-3" size={24} />
                            <input
                                type="text"
                                value={userData.name}
                                onChange={(e) => handleChange(e, "name")}
                                className="border-none focus:outline-none w-full bg-transparent text-gray-800 font-medium"
                            />
                        </div>
                        {isSubmitted && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaEnvelope className="text-gray-600 mr-3" size={24} />
                            <input
                                type="email"
                                value={userData.email}
                                onChange={(e) => handleChange(e, "email")}
                                className="border-none focus:outline-none w-full bg-transparent text-gray-800 font-medium"
                            />
                        </div>
                        {isSubmitted && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaPhone className="text-gray-600 mr-3" size={24} />
                            <input
                                type="number"
                                value={userData.phone}
                                onChange={(e) => handleChange(e, "phone")}
                                className="border-none focus:outline-none w-full bg-transparent text-gray-800 font-medium"
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Confirm Button */}
                    <div className="mt-6">
                        <button
                            className="bg-[#379DD6] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-[#2980b9] transition duration-300"
                            onClick={handleSubmit}
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default AccountPage;
