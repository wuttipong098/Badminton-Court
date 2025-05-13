"use client";

import styles from '@/styles/historys.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchAccountParams } from "@/dto/request/historys";
import { historys } from "@/dto/response/historys";
import { FaSearch } from "react-icons/fa";

const HistoryPage = () => {
    const router = useRouter();
    const [data, setData] = useState<historys[]>([]);
    const [filteredData, setFilteredData] = useState<historys[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userID = localStorage.getItem("userID");
            if (!userID) {
                setErrorMessage("กรุณาเข้าสู่ระบบก่อน");
                router.push("/login");
                return;
            }

            try {
                const response = await fetch('/api/historys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ UserID: parseInt(userID) } as SearchAccountParams),
                });
                const result = await response.json();
                if (result.status_code === 200) {
                    setData(result.data);
                    setFilteredData(result.data);
                } else {
                    setErrorMessage(result.status_message || "ไม่สามารถดึงข้อมูลประวัติการจองได้");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            setFilteredData(data);
        } else {
            const filtered = data.filter((booking) =>
                booking.StadiumName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <div className="w-full h-35 bg-[#1F9378]">
                <div className={styles.header}>
                    <h1 className={styles.h1}>Badminton</h1>
                    <h2 className={styles.h2}>CourtBooking</h2>
                    <div className={styles.ball}>
                        <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 mb-10">
                <div className={styles.searchContainer}>
                    <div className={styles.search}>
                        <FaSearch className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            className={styles.insearch}
                            placeholder="ชื่อสนามแบดมินตัน"
                            id="stadium"
                            name="stadium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className={styles.buttons} onClick={handleSearch}>
                            ค้นหา
                        </button>
                    </div>
                </div>
                {loading && <div className="text-gray-500 text-center mt-4">กำลังโหลด...</div>}
                {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
                {!loading && !errorMessage && (
                    <>
                        <div className={styles.headertable}>
                            <label className={styles.headtable}>วันที่จอง</label>
                            <label className={styles.headtable}>เวลาที่จอง</label>
                            <label className={styles.headtable}>ชื่อสถานที่</label>
                            <label className={styles.headtable}>สนามที่จอง</label>
                        </div>
                        {filteredData.length > 0 ? (
                            filteredData.map((booking, index) => (
                                <div key={index} className={styles.rowtable}>
                                    <label className={styles.celltable}>{booking.BookingDate}</label>
                                    <label className={styles.celltable}>{`${booking.StartTime.slice(0, 5)} - ${booking.EndTime.slice(0, 5)}`}</label>
                                    <label className={styles.celltable}>{booking.StadiumName}</label>
                                    <label className={styles.celltable}>{`สนามที่ ${booking.CourtNumber}`}</label>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center mt-4">ไม่มีประวัติการจอง</div>
                        )}
                    </>
                )}
            </div>
            <div className="w-full h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default HistoryPage;