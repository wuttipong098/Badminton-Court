"use client";

import styles from '@/styles/reservation.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import พรนิมิต1 from "@/public/พรนิมิต1.jpg";
import พรนิมิต2 from "@/public/พรนิมิต2.jpg";
import พรนิมิต3 from "@/public/พรนิมิต3.jpg";
import พรนิมิต4 from "@/public/พรนิมิต4.jpg";
import { useRouter } from "next/navigation";
import { FaSearch, FaHeart, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface Court {
    id: number;
    name: string;
    phone: string;
    province: string;
    favorite: boolean;
}

const badmintonCourts: Court[] = [
    { id: 1, name: "Pronimit Badminton Court", phone: "081-992-5780", province: "พะเยา", favorite: true },
    { id: 2, name: "stadium B", phone: "093-xxx-xxxx", province: "พะเยา", favorite: false },
    { id: 3, name: "stadium C", phone: "093-xxx-xxxx", province: "สุโขทัย", favorite: false },
    { id: 4, name: "stadium D", phone: "093-xxx-xxxx", province: "สุโขทัย", favorite: false },
    { id: 5, name: "stadium E", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
    { id: 6, name: "stadium F", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
    { id: 7, name: "stadium G", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
];

const ReservationPage = () => {
    const router = useRouter();

    const [courts, setCourts] = useState<Court[]>(badmintonCourts);
    const [showFavorites, setShowFavorites] = useState(false);

    const loadFavoritesFromStorage = () => {
        if (typeof window !== 'undefined') {
            const savedCourts = localStorage.getItem('favoriteCourts');
            if (savedCourts) {
                try {
                    const parsedCourts = JSON.parse(savedCourts);
                    if (Array.isArray(parsedCourts)) {
                        console.log("Loaded from localStorage:", parsedCourts);
                        return parsedCourts;
                    }
                } catch (error) {
                    console.error("Failed to parse favoriteCourts:", error);
                }
            }
        }
        return badmintonCourts;
    };

    useEffect(() => {
        setCourts(loadFavoritesFromStorage());
    }, []);

    const toggleFavorite = (id: number) => {
        setCourts((prevCourts) => {
            const updatedCourts = prevCourts.map((court) =>
                court.id === id ? { ...court, favorite: !court.favorite } : court
            );
            if (typeof window !== 'undefined') {
                localStorage.setItem('favoriteCourts', JSON.stringify(updatedCourts));
                console.log("Saved to localStorage:", updatedCourts);
            }
            return updatedCourts;
        });
    };

    const [selectedProvince, setSelectedProvince] = useState('');

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);
    };

    const handleStadiumClick = () => {
        router.push("/BadmintonCourt/reservation/stadium");
    };

    const handleShowFavorites = () => {
        setShowFavorites((prev) => !prev);
    };

    const displayedCourts = showFavorites ? courts.filter((court) => court.favorite) : courts;

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
            <div className={styles.headernav}>
                <div className={styles.search}>
                    <FaSearch className={styles.searchIcon} size={20} />
                    <input type="text" className={styles.insearch} placeholder="ชื่อสนามแบดมินตัน" id="stadium" name="stadium" />
                </div>
                <button className={styles.buttons}>ค้นหา</button>
                <select
                    className={styles.province}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                >
                    <option value="" disabled>จังหวัด</option>
                    <option value="bangkok">กรุงเทพมหานคร</option>
                    <option value="chiangmai">เชียงใหม่</option>
                    <option value="chonburi">ชลบุรี</option>
                    <option value="phayao">พะเยา</option>
                </select>
                <FaHeart
                    className={showFavorites ? styles.favorite : styles.heartIcon}
                    size={30}
                    onClick={handleShowFavorites}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                />
            </div>
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <div className={styles.container}>
                        <div className={styles.courtList}>
                            {displayedCourts.map((court) => (
                                <div key={court.id} className={`${styles.courtItem} bg-[#1F9378] p-4 rounded-lg shadow-md flex flex-row relative mb-5`}>
                                    {/* รูปหัวใจมุมขวาบน */}
                                    <FaHeart
                                        className={court.favorite ? styles.favorite : styles.notFavorite}
                                        size={30}
                                        onClick={() => toggleFavorite(court.id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                                    />
                                    {/* ฝั่งซ้าย: รูปภาพหลักและรูปภาพย่อย */}
                                    <div className="flex flex-col flex-shrink-0 mr-4">
                                        <Image
                                            src={court.id === 1 ? พรนิมิต1 : พรนิมิต1}
                                            alt="Court Image"
                                            width={300}
                                            height={200}
                                            className="rounded-lg"
                                        />
                                        {/* รูปภาพย่อย 3 รูป (ปรับขอบซ้ายให้ตรงกับรูปใหญ่) */}
                                        <div className="flex space-x-2 mt-2 ml-0">
                                            <Image
                                                src={court.id === 1 ? พรนิมิต2 : พรนิมิต2}
                                                alt="Court Image 1"
                                                width={90}
                                                height={60}
                                                className="rounded-lg"
                                            />
                                            <Image
                                                src={court.id === 1 ? พรนิมิต3 : พรนิมิต3}
                                                alt="Court Image 2"
                                                width={90}
                                                height={60}
                                                className="rounded-lg"
                                            />
                                            <Image
                                                src={court.id === 1 ? พรนิมิต4 : พรนิมิต4}
                                                alt="Court Image 3"
                                                width={90}
                                                height={60}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    {/* ฝั่งขวา: ข้อมูลสนาม */}
                                    <div className="flex flex-col flex-grow">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mt-0">สนามแบดมินตัน พรนิมิต</h3>
                                            <h4 className="text-xl font-semibold text-white mt-1">{court.name}</h4>
                                            <p className="text-white flex items-center mt-1">
                                                <FaMapMarkerAlt className="mr-2 text-red-500" />
                                                หมู่ที่ 3 ตำบล ท่าตาล อำเภอ เมือง พะเยา, Phayao, Thailand, Phayao
                                            </p>
                                            <p className="text-white mt-1">รหัสไปรษณีย์: 56000</p>
                                            <p className="text-white flex items-center mt-1">
                                                <FaPhone className="mr-2 text-red-500" />
                                                {court.phone}
                                            </p>
                                            <p className="text-white mt-1">จำนวนคอร์ด: คอร์ดมาตรฐาน 4 คอร์ด</p>
                                        </div>
                                        {/* ปุ่มเลือก */}
                                        <button
                                            className={`${styles.selectButton} bg-white text-[#1F9378] px-4 py-2 rounded-lg mt-4 self-start`}
                                            onClick={handleStadiumClick}
                                        >
                                            เลือก
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-35 bg-[#1F9378]"></div>
        </div>
    );
};

export default ReservationPage;