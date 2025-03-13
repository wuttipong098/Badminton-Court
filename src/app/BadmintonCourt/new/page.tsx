"use client";

import Image from "next/image";
import ball from "@/public/ball.png";
import court from "@/public/corut.png";

const MainPage = () => {
    return (
        <div className="relative flex flex-col items-start justify-center min-h-screen bg-white overflow-hidden">
            {/* พื้นหลังด้านบนเอียง */}
            <div className="absolute top-0 left-0 w-full h-55 bg-[#1F9378] skew-y-[-6deg] origin-top-left"></div>
            {/* Header */}
            <div className="text-left w-full max-w-lg text-white relative z-10 p-6 mt-[-50px]">
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

                {/* ข้อความ 1 (อยู่ตรงกลาง) */}
                <div className="relative z-10 p-6 self-start mt-15 max-w-lg w-full mx-auto">
                    <label className="text-xl font-bold text-[#1F9378] block">
                        ยินดีต้อนรับสู่เว็บไซต์จองสนาม
                    </label>
                    <label className="text-xl font-bold text-[#1F9378] block">
                        แบดมินตัน
                    </label>
                    <div className="relative z-10 text-left mt-6 text-lg font-medium pl-6">
                        <label className="block">วันนี้สนามแบดมินตันของเรา</label>
                        <label className="text-red-600 font-bold">
                            เปิดให้บริการแล้ว<span className="text-black font-medium"> ครับ/ค่ะ</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* พื้นหลังด้านล่างตรง */}
            <div className="absolute bottom-0 left-0 w-full h-15 bg-[#1F9378]"></div>
        </div>
    );
};

export default MainPage;

