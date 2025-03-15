"use client";

import styles from '@/styles/stadium.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import calendar from "@/public/calendar.png";
import court from "@/public/corut.png";
import { useRouter } from "next/navigation";
import { useState } from 'react';

type TimeSlot = {
    time: string;
    court: number;
};

const StadiumPage = () => {
    const router = useRouter();
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const handleClick = () => {
        router.push("/BadmintonCourt/reservation/stadium");
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

    // ฟังก์ชันแปลงวันที่จาก "YYYY-MM-DD" เป็น "DD/MM/YYYY" (พ.ศ.)
    const formatThaiDate = (dateString: string) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        const thaiYear = parseInt(year) + 543;
        return `${day}/${month}/${thaiYear}`;
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
                    <div className={styles.day}>
                        <input
                            type="text"
                            className={styles.inputday}
                            value={selectedDate}
                            placeholder="วัน/เดือน/ปี"
                            readOnly
                            onClick={() => {
                                const dateInput = document.getElementById("hiddenDatePicker") as HTMLInputElement;
                                dateInput?.showPicker();
                            }}
                        />
                        <input
                            type="date"
                            id="hiddenDatePicker"
                            className={styles.hiddenDatePicker}
                            onChange={(e) => setSelectedDate(formatThaiDate(e.target.value))}
                        />
                        <Image
                            src={calendar}
                            alt="Calendar Icon"
                            width={24}
                            height={24}
                            className={styles.calendarIcon}
                            onClick={() => {
                                const dateInput = document.getElementById("hiddenDatePicker") as HTMLInputElement;
                                dateInput?.showPicker();
                            }}
                        />
                    </div>
                    <div className={styles.time}>
                        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                            <option value="" disabled>เวลา</option>
                            <option>08:00</option>
                            <option>09:00</option>
                            <option>10:00</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button className={styles.button}>จอง</button>
                        <button className={styles.buttons}>ค้นหา</button>
                    </div>
                </div>
                <div className="mt-20"> {/* ระยะห่างจาก controlContainer เป็น 80px */}
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