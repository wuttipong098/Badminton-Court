"use client";

import styles from '@/styles/stadium.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import calendar from "@/public/calendar.png";
import court from "@/public/corut.png";
import { useRouter } from "next/navigation";
import { useState } from 'react';

const StadiumPage = () => {
    const router = useRouter();
    const [selectedTime, setSelectedTime] = useState("");

    const handleClick = () => {
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
                <div className={styles.controlContainer}>
                    <div className={styles.day}>
                        <input type="date" className={styles.inputday} id="datePicker" />
                        <Image
                            src={calendar}
                            alt="Calendar Icon"
                            width={24}
                            height={24}
                            className={styles.calendarIcon}
                            onClick={() => {
                                const dateInput = document.getElementById("datePicker") as HTMLInputElement;
                                dateInput?.showPicker();
                            }}
                        />
                    </div>
                    <div className={styles.time}>
                        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                            <option value="" disabled >เวลา</option>
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
                <div className="mt-25 mb-6 p-4">
                    <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                    <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">สนามที่ 1</label>
                </div>
                <div className={styles.grouptimbox}>
                    {["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"].map((time, index) => {
                        const [start, end] = time.split(" - ");
                        return (
                            <button key={index} className={styles.timebox}>
                                <span className={styles.boldText}>{start}</span>
                                <span>-</span>
                                <span className={styles.boldText}>{end}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-5 mb-6 p-4">
                    <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                    <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">สนามที่ 2</label>
                </div>
                <div className={styles.grouptimbox}>
                    {["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"].map((time, index) => {
                        const [start, end] = time.split(" - ");
                        return (
                            <button key={index} className={styles.timebox}>
                                <span className={styles.boldText}>{start}</span>
                                <span>-</span>
                                <span className={styles.boldText}>{end}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-5 mb-6 p-4">
                    <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                    <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">สนามที่ 3</label>
                </div>
                <div className={styles.grouptimbox}>
                    {["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"].map((time, index) => {
                        const [start, end] = time.split(" - ");
                        return (
                            <button key={index} className={styles.timebox}>
                                <span className={styles.boldText}>{start}</span>
                                <span>-</span>
                                <span className={styles.boldText}>{end}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-5 mb-6 p-4">
                    <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                    <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">สนามที่ 4</label>
                </div>
                <div className={styles.grouptimbox}>
                    {["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"].map((time, index) => {
                        const [start, end] = time.split(" - ");
                        return (
                            <button key={index} className={styles.timebox}>
                                <span className={styles.boldText}>{start}</span>
                                <span>-</span>
                                <span className={styles.boldText}>{end}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-5 mb-6 p-4">
                    <Image src={court} alt="BadmintonCourt" width={120} height={50} />
                    <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">สนามที่ 5</label>
                </div>
                <div className={styles.grouptimbox}>
                    {["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"].map((time, index) => {
                        const [start, end] = time.split(" - ");
                        return (
                            <button key={index} className={styles.timebox}>
                                <span className={styles.boldText}>{start}</span>
                                <span>-</span>
                                <span className={styles.boldText}>{end}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
            </div>
        </div>
    );
};

export default StadiumPage;