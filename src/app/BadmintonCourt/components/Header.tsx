"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
    const router = useRouter();

    return (
        <header className="bg-[#1F9378] p-4 flex justify-between items-center">
            <nav className="flex space-x-6 text-white text-lg">
                <Link href="/BadmintonCourt" className="hover:underline">หน้าหลัก</Link>
                <Link href="/BadmintonCourt" className="hover:underline">การจอง</Link>
                <Link href="/BadmintonCourt" className="hover:underline">ประวัติการจอง</Link>
                <Link href="/BadmintonCourt" className="hover:underline">ข้อมูลของฉัน</Link>
                <Link href="/BadmintonShop" className="hover:underline">Shop</Link>
            </nav>
            <button 
                className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-gray-300 border-2 border-black cursor-pointer" 
                onClick={() => router.push("/BadmintonCourt/login")}
            >
                ออกจากระบบ
            </button>
        </header>
    );
};

export default Header;