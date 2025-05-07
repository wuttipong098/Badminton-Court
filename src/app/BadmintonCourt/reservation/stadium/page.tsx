"use client";

import styles from '@/styles/stadium.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import court from "@/public/corut.png";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

type TimeSlot = {
    time: string;
    court: number;
};

const StadiumPage = () => {
    const router = useRouter();
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
    const MySwal = withReactContent(Swal);

    const handleClick = () => {
        router.push("/BadmintonCourt/reservation/payment");
    };

    const handleTimeSlotClick = (time: string, courtIndex: number) => {
        const newSlot = { time, court: courtIndex };
        setSelectedTimeSlots((prev) => {
            const exists = prev.some(
                (slot) => slot.time === time && slot.court === courtIndex
            );
            if (exists) {
                return prev.filter(
                    (slot) => !(slot.time === time && slot.court === courtIndex)
                );
            } else {
                return [...prev, newSlot];
            }
        });
    };
    const renderTimeSlots = (courtIndex: number) => {
        const timeSlots = [
            "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
            "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
        ];

        return timeSlots.map((time, index) => {
            const [start, end] = time.split(" - ");
            const isSelected = selectedTimeSlots.some(
                (slot) => slot.time === time && slot.court === courtIndex
            );

            return (
                <button
                    key={index}
                    className={`${styles.timebox} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleTimeSlotClick(time, courtIndex)}
                >
                    <span className={styles.boldText}>{start}</span>
                    <span>-</span>
                    <span className={styles.boldText}>{end}</span>
                </button>
            );
        });
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
                <div className={styles.controlContainer}>
                    <div className="flex space-x-2">
                        <button className={styles.button} onClick={handleClick}>จอง</button>
                    </div>
                </div>
                <div className="mt-20">
                    {[1, 2, 3, 4, 5].map((courtIndex) => (
                        <div key={courtIndex}>
                            <div className={`${courtIndex === 1 ? styles['mt-25-custom'] : 'mt-2'} mb-6 p-4`}>
                                <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                                <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">
                                    สนามที่ {courtIndex}
                                </label>
                            </div>
                            <div className={styles.grouptimbox}>
                                {renderTimeSlots(courtIndex)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
            </div>
        </div>
    );
};

export default StadiumPage;