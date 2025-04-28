"use client";

import Image from "next/image";
import ball from "@/public/ball.png";
import court from "@/public/corut.png";

const MainPage = () => {
    return (
        <div className="relative flex flex-col items-start justify-center min-h-screen bg-white overflow-hidden">
            {/* พื้นหลังด้านบนเอียง */}
            <div className="absolute top-0 left-0 w-full h-60 bg-[#1F9378] skew-y-[-6deg] origin-top-left"></div>
            {/* Header */}
            <div className="absolute top-[60px] left-0 text-left w-full max-w-lg text-white z-10 p-6">
                <h1 className="text-3xl font-bold">Badminton</h1>
                <h2 className="text-3xl font-semibold">CourtBooking</h2>
            </div>

            {/* ภาพขนไก่ */}
            <div className="absolute top-6 right-6 z-10">
                <Image src={ball} alt="Badminton shuttlecock" width={100} height={100} />
            </div>

            {/* กล่องข้อความ 1 และภาพสนาม */}
            <div className="relative z-10 flex items-center justify-between w-full px-6 mt-6">
                {/* ภาพสนาม (ชิดซ้าย) */}
                <div className="flex-shrink-0">
                    <Image src={court} alt="Badminton Court" width={250} height={100} />
                </div>

                {/* Pagination และกรอบสีเทา */}
                <div className="relative z-10 p-6 self-start mt-25 max-w-lg w-full mx-auto flex flex-col items-center">
                    {/* กรอบสี่เหลี่ยมสีเทาด้านบน */}
                    <div className="w-full h-96 bg-gray-200 rounded-lg mb-4"></div>
                    
                    {/* ปุ่มตัวเลข 1-9 */}
                    <div className="flex space-x-2">
                        {[...Array(9)].map((_, index) => (
                            <button
                                key={index}
                                className="w-10 h-10 rounded-lg bg-[#1F9378] text-white font-bold flex items-center justify-center hover:bg-[#167A63] transition"
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button className="w-10 h-10 rounded-lg bg-[#1F9378] text-white font-bold flex items-center justify-center hover:bg-[#167A63] transition">
                            ...
                        </button>
                    </div>
                </div>
            </div>

            {/* พื้นหลังด้านล่างตรง */}
            <div className="absolute bottom-[-16px] left-0 w-full h-15 bg-[#1F9378]"></div>
        </div>
    );
};

export default MainPage;