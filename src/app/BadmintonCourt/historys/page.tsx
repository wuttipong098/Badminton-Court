"use client";

import styles from '@/styles/historys.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { useState, useEffect } from "react";
import { SearchAccountParams } from "@/dto/request/historys";
import { historys } from "@/dto/response/historys";

const HistoryPage = () => {
    const [data, setData] = useState<historys[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/historys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({} as SearchAccountParams),
                });
                const result = await response.json();
                if (result.status_code === 200) {
                    setData(result.data);
                } else {
                    console.error('Failed to fetch data:', result.status_message);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
            <div className={styles.headertable}>
                <label className={styles.headtable}>วันที่จอง</label>
                <label className={styles.headtable}>เวลาที่จอง</label>
                <label className={styles.headtable}>ชื่อสถานที่</label>
                <label className={styles.headtable}>สนามที่จอง</label>
            </div>
            {data.map((booking, index) => (
                <div key={index} className={styles.rowtable}>
                    <label className={styles.celltable}>{booking.BookingDate}</label>
                    <label className={styles.celltable}>{`${booking.StartTime} - ${booking.EndTime}`}</label>
                    <label className={styles.celltable}>{booking.StadiumName}</label>
                    <label className={styles.celltable}>{`สนามที่ ${booking.CourtNumber}`}</label>
                </div>
            ))}
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default HistoryPage;