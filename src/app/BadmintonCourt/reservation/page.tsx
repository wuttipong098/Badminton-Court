"use client";

import styles from '@/styles/reservation.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { useRouter } from "next/navigation";
import { FaSearch } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { useState } from 'react';

const badmintonCourts = [
    { id: 1, name: "stadium A", phone: "093-xxx-xxxx", province: "นครปฐม", favorite: true },
    { id: 2, name: "stadium B", phone: "093-xxx-xxxx", province: "พะเยา", favorite: false },
    { id: 3, name: "stadium C", phone: "093-xxx-xxxx", province: "สุโขทัย", favorite: false },
    { id: 4, name: "stadium D", phone: "093-xxx-xxxx", province: "สุโขทัย", favorite: false },
    { id: 5, name: "stadium E", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
    { id: 6, name: "stadium F", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
    { id: 7, name: "stadium G", phone: "093-xxx-xxxx", province: "เชียงใหม่", favorite: false },
];

const ReservationPage = () => {
    const router = useRouter();
    const [courts, setCourts] = useState(badmintonCourts);  // ใช้สถานะ courts สำหรับจัดการการเปลี่ยนแปลง

    const toggleFavorite = (id: number) => {
        setCourts((prevCourts) =>
            prevCourts.map((court) =>
                court.id === id ? { ...court, favorite: !court.favorite } : court
            )
        );
    };

    const [selectedProvince, setSelectedProvince] = useState('');  // สถานะจังหวัดที่เลือก

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);  // อัปเดตสถานะจังหวัดเมื่อเลือก
    };

    const handleStadiumClick = () => {
        router.push("/BadmintonCourt/reservation/stadium");
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
                </select>
                <FaHeart
                    className={styles.heartIcon}
                    size={30}
                />
            </div>
            {/* ตารางสนามแบดมินตัน */}
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <div className={styles.container}>
                        <div className={styles.courtList}>
                            {courts.map((court) => (
                                <div key={court.id} className={styles.courtItem}>
                                    <span>{court.id}</span>
                                    <span>{court.name}</span>
                                    <span>{court.phone}</span>
                                    <span>{court.province}</span>
                                    <button className={styles.selectButton} onClick={handleStadiumClick}>เลือก</button>
                                    <FaHeart
                                        className={court.favorite ? styles.favorite : styles.notFavorite}
                                        size={30}
                                        onClick={() => toggleFavorite(court.id)} // เปลี่ยนสถานะเมื่อคลิก
                                    />
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
