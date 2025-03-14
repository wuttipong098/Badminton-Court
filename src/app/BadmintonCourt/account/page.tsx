"use client";

import styles from '@/styles/stadium.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";

const AccountPage = () => {
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
       </div>
    );
};

export default AccountPage;