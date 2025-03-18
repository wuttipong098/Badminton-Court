"use client";

import styles from '@/styles/account.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import accout from "@/public/kis.jpg";
import { FaUser, FaEnvelope, FaPhone, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const AccountPage = () => {
    const [imageFile, setImageFile] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFirstName(localStorage.getItem('firstName') || "");
            setLastName(localStorage.getItem('lastName') || "");
            setPhone(localStorage.getItem('phone') || "");
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

    const handleConfirm = () => {
        setIsEditingName(false);
        setIsEditingPhone(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('firstName', firstName);
            localStorage.setItem('lastName', lastName);
            localStorage.setItem('phone', phone);
        }
        console.log("ข้อมูลที่บันทึก:", { firstName, lastName, phone });
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

            <div className="flex flex-col items-center mt-10 px-5">
                <div className="mb-6 relative">
                    <Image
                        src={imageFile ? `data:image/jpeg;base64,${imageFile}` : accout}
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
                    {/* User ID */}
                    <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                        <FaUser className="text-gray-600 mr-3" size={24} />
                        <span className="text-gray-800 font-medium">000001</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <FaEnvelope className="text-gray-600 mr-3" size={24} />
                            <span className="text-gray-800 font-medium">Acenpwk@gmail.com</span>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center w-full">
                            <FaUser className="text-gray-600 mr-3" size={24} />
                            {isEditingName ? (
                                <div className="flex items-center space-x-2 flex-1">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                        placeholder="ชื่อ"
                                    />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                        placeholder="นามสกุล"
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-800 font-medium">
                                    {firstName} {lastName}
                                </span>
                            )}
                        </div>
                        <FaEdit 
                            className="text-gray-600 cursor-pointer ml-3" 
                            size={20} 
                            onClick={() => setIsEditingName(!isEditingName)}
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                        <div className="flex items-center w-full">
                            <FaPhone className="text-gray-600 mr-3" size={24} />
                            {isEditingPhone ? (
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                    placeholder="เบอร์โทรศัพท์"
                                />
                            ) : (
                                <span className="text-gray-800 font-medium">{phone}</span>
                            )}
                        </div>
                        <FaEdit 
                            className="text-gray-600 cursor-pointer ml-3" 
                            size={20} 
                            onClick={() => setIsEditingPhone(!isEditingPhone)}
                        />
                    </div>
                </div>

                {/* Confirm Button - แสดงเฉพาะเมื่อมีการแก้ไข */}
                {(isEditingName || isEditingPhone) && (
                    <div className="mt-6">
                        <button 
                            className="bg-[#379DD6] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-[#2980b9] transition duration-300"
                            onClick={handleConfirm}
                        >
                            ยืนยัน
                        </button>
                    </div>
                )}
            </div>
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default AccountPage;