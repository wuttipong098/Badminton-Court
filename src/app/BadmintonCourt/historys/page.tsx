"use client"; 

import styles from '@/styles/historys.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";

const HistoryPage = () => {
    const bookingData = [
        { date: "15/03/2025", time: "08:00 - 09:00", location: "สนามกีฬากรุงเทพ", court: "สนามที่ 1" },
        { date: "16/03/2025", time: "09:00 - 10:00", location: "สนามกีฬาเชียงใหม่", court: "สนามที่ 2" },
        { date: "17/03/2025", time: "10:00 - 11:00", location: "สนามกีฬาพัทยา", court: "สนามที่ 3" },
        { date: "18/03/2025", time: "13:00 - 14:00", location: "สนามกีฬาหัวหิน", court: "สนามที่ 4" },
        { date: "19/03/2025", time: "15:00 - 16:00", location: "สนามกีฬาภูเก็ต", court: "สนามที่ 5" },
    ];

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
            {bookingData.map((booking, index) => (
                <div key={index} className={styles.rowtable}>
                    <label className={styles.celltable}>{booking.date}</label>
                    <label className={styles.celltable}>{booking.time}</label>
                    <label className={styles.celltable}>{booking.location}</label>
                    <label className={styles.celltable}>{booking.court}</label>
                </div>
            ))}
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default HistoryPage;