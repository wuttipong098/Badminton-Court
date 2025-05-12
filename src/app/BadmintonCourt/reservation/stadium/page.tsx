"use client";

import styles from "@/styles/stadium.module.css";
import Image from "next/image";
import ball from "@/public/ball.png";
import courtImage from "@/public/corut.png";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { SearchAccountParams } from "@/dto/request/court";
import { court, TimeSlot } from "@/dto/response/court";

const StadiumPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<(TimeSlot & { court: number })[]>([]);
    const [courts, setCourts] = useState<court[]>([]);
    const [stadiumName, setStadiumName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const MySwal = withReactContent(Swal);

    // ดึง userId, stadiumId, และ bookingDate จาก query parameters
    const userId = searchParams.get('userId');
    const stadiumId = searchParams.get('stadiumId');
    const bookingDate = searchParams.get('bookingDate');

    // ฟังก์ชันแปลงวันที่จาก ISO (YYYY-MM-DD) เป็นรูปแบบไทย (วัน/เดือน/ปี)
    const formatThaiDate = (isoDate: string | null) => {
        if (!isoDate) return "ไม่ระบุวันที่";
        const [year, month, day] = isoDate.split("-");
        const thaiYear = parseInt(year) + 543;
        return `${day}/${month}/${thaiYear}`;
    };

    // ฟังก์ชันดึงชื่อสนาม
    const fetchStadiumName = async () => {
        try {
            if (!stadiumId) {
                setStadiumName("ไม่ระบุสนาม");
                return;
            }

            const response = await fetch('/api/stadium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    StadiumID: parseInt(stadiumId),
                }),
            });

            const result = await response.json();
            if (result.status_code === 200 && result.data && result.data.length > 0) {
                setStadiumName(result.data[0].StadiumName || "ไม่ระบุสนาม");
            } else {
                setStadiumName("ไม่ระบุสนาม");
            }
        } catch (error) {
            console.error('Error fetching stadium name:', error);
            setStadiumName("ไม่ระบุสนาม");
        }
    };

    // ฟังก์ชันดึงข้อมูลสนาม
    const fetchCourtDetails = async () => {
        try {
            if (!userId || !stadiumId || !bookingDate) {
                MySwal.fire("ข้อผิดพลาด", "ข้อมูลที่จำเป็นไม่ครบถ้วน", "error");
                return;
            }

            const params: SearchAccountParams = {
                StadiumID: parseInt(stadiumId),
                BookingDate: bookingDate,
            };

            const response = await fetch("/api/court", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            const result = await response.json();
            if (result.status_code === 200) {
                // เรียง TimeSlots ตาม StartTime
                const sortedCourts = result.data.map((court: court) => ({
                    ...court,
                    TimeSlots: court.TimeSlots.sort((a: TimeSlot, b: TimeSlot) => {
                        return a.StartTime.localeCompare(b.StartTime);
                    }),
                }));
                setCourts(sortedCourts);
            } else {
                MySwal.fire("ข้อผิดพลาด", result.status_message, "error");
            }
        } catch (error) {
            MySwal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลสนามได้", "error");
        } finally {
            setLoading(false);
        }
    };

    // เรียก API เมื่อ component โหลด
    useEffect(() => {
        if (stadiumId) {
            fetchStadiumName();
            fetchCourtDetails();
        }
    }, [userId, stadiumId, bookingDate]);

    const handleClick = () => {
        if (selectedTimeSlots.length === 0) {
            MySwal.fire("ข้อผิดพลาด", "กรุณาเลือกสล็อตเวลาอย่างน้อยหนึ่งสล็อต", "error");
            return;
        }

        // กำหนดราคาคงที่ต่อสล็อต (สมมติ 200 บาทต่อชั่วโมง)
        const pricePerSlot = 200;
        const totalPrice = selectedTimeSlots.length * pricePerSlot;

        // เตรียมข้อมูลสำหรับบันทึกลง localStorage
        const bookingData = {
            userId,
            stadiumId,
            bookingDate,
            slots: selectedTimeSlots.map(slot => ({
                courtId: slot.court,
                slotTime: `${slot.StartTime.slice(0, 5)} - ${slot.EndTime.slice(0, 5)}`,
                startTime: slot.StartTime,
                endTime: slot.EndTime,
                price: pricePerSlot,
            })),
            total_price: totalPrice,
        };

        // บันทึกข้อมูลลง localStorage
        localStorage.setItem('bookingData', JSON.stringify(bookingData));

        // เปลี่ยนเส้นทางไปยังหน้าชำระเงิน
        router.push('/BadmintonCourt/reservation/payment');
    };

    const handleTimeSlotClick = (slot: TimeSlot, courtIndex: number) => {
        if (slot.StatusName === "booked" || slot.StatusName === "ไม่ว่าง" || slot.StatusName === "กำลังจอง") {
            MySwal.fire("ข้อผิดพลาด", "สล็อตนี้ไม่สามารถจองได้", "warning");
            return;
        }

        const newSlot = { ...slot, court: courtIndex };
        setSelectedTimeSlots((prev) => {
            const exists = prev.some(
                (selected) =>
                    selected.StartTime === slot.StartTime &&
                    selected.EndTime === slot.EndTime &&
                    selected.court === courtIndex
            );
            if (exists) {
                return prev.filter(
                    (selected) =>
                        !(
                            selected.StartTime === slot.StartTime &&
                            selected.EndTime === slot.EndTime &&
                            selected.court === courtIndex
                        )
                );
            } else {
                return [...prev, newSlot];
            }
        });
    };

    const renderTimeSlots = (courtIndex: number, timeSlots: TimeSlot[]) => {
        return timeSlots.map((slot, index) => {
            const time = `${slot.StartTime.slice(0, 5)} - ${slot.EndTime.slice(0, 5)}`;
            const isSelected = selectedTimeSlots.some(
                (selected) =>
                    selected.StartTime === slot.StartTime &&
                    selected.EndTime === slot.EndTime &&
                    selected.court === courtIndex
            );
            let statusClass = "";

            switch (slot.StatusName) {
                case "ไม่ว่าง":
                    statusClass = styles.booked;
                    break;
                case "กำลังจอง":
                    statusClass = styles.inProgress;
                    break;
                case "ว่าง":
                default:
                    statusClass = "";
                    break;
            }

            return (
                <button
                    key={index}
                    className={`${styles.timebox} ${
                        isSelected ? styles.selected : ""
                    } ${statusClass}`}
                    onClick={() => handleTimeSlotClick(slot, courtIndex)}
                    disabled={slot.StatusName === "ไม่ว่าง" || slot.StatusName === "กำลังจอง"}
                >
                    <span className={styles.boldText}>{slot.StartTime.slice(0, 5)}</span>
                    <span>-</span>
                    <span className={styles.boldText}>{slot.EndTime.slice(0, 5)}</span>
                </button>
            );
        });
    };

    if (loading) {
        return <div className={styles.container}>กำลังโหลด...</div>;
    }

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
                    <div className="flex items-center justify-between w-full">
                        <div className="flex-1 text-center">
                            <span className="text-white text-lg">
                                สนาม: {stadiumName} | วันที่: {formatThaiDate(bookingDate)}
                            </span>
                        </div>
                        <button className={styles.button} onClick={handleClick}>
                            จอง
                        </button>
                    </div>
                </div>
                <div className="mt-20">
                    {courts.map((courtItem) => (
                        <div key={courtItem.CourtNumber}>
                            <div
                                className={`${
                                    courtItem.CourtNumber === 1 ? styles["mt-25-custom"] : "mt-2"
                                } mb-6 p-4`}
                            >
                                <Image
                                    src={courtImage}
                                    alt="BadmintonCourt"
                                    width={120}
                                    height={50}
                                />
                                <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">
                                    สนามที่ {courtItem.CourtNumber}
                                </label>
                            </div>
                            <div className={styles.grouptimbox}>
                                {renderTimeSlots(courtItem.CourtNumber, courtItem.TimeSlots)}
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