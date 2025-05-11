"use client";

import styles from "@/styles/stadium.module.css";
import Image from "next/image";
import ball from "@/public/ball.png";
import courtImage from "@/public/corut.png"; 
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { SearchAccountParams } from "@/dto/request/court";
import { court, TimeSlot } from "@/dto/response/court"; 

const StadiumPage = () => {
  const router = useRouter();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<(TimeSlot & { court: number })[]>([]); 
  const [courts, setCourts] = useState<court[]>([]); 
  const [loading, setLoading] = useState(true); 
  const MySwal = withReactContent(Swal);

  // ฟังก์ชันเรียก API เพื่อดึงข้อมูลสนามและสล็อตเวลา
  const fetchCourtDetails = async () => {
    try {
      const params: SearchAccountParams = {
        StadiumID: 1, // แทนด้วย StadiumID ที่ต้องการ
        BookingDate: new Date().toLocaleDateString("en-GB").split("/").join("/"), 
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
        setCourts(result.data); // เก็บข้อมูลสนามและสล็อตเวลา
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
    fetchCourtDetails();
  }, []);

  const handleClick = () => {
    if (selectedTimeSlots.length === 0) {
      MySwal.fire("ข้อผิดพลาด", "กรุณาเลือกสล็อตเวลาอย่างน้อยหนึ่งสล็อต", "error");
      return;
    }
    // ส่งข้อมูลสล็อตที่เลือกไปยังหน้าชำระเงิน
    router.push(
      `/BadmintonCourt/reservation/payment?slots=${encodeURIComponent(
        JSON.stringify(selectedTimeSlots)
      )}`
    );
  };

  const handleTimeSlotClick = (slot: TimeSlot, courtIndex: number) => {
    if (slot.StatusName === "booked") {
      MySwal.fire("ข้อผิดพลาด", "สล็อตนี้ถูกจองแล้ว", "warning");
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
      const time = `${slot.StartTime.slice(0, 5)} - ${slot.EndTime.slice(0, 5)}`; // ตัดวินาทีออก (เช่น "09:00:00" -> "09:00")
      const isSelected = selectedTimeSlots.some(
        (selected) =>
          selected.StartTime === slot.StartTime &&
          selected.EndTime === slot.EndTime &&
          selected.court === courtIndex
      );

      return (
        <button
          key={index}
          className={`${styles.timebox} ${
            isSelected ? styles.selected : ""
          } ${slot.StatusName === "booked" ? styles.booked : ""}`}
          onClick={() => handleTimeSlotClick(slot, courtIndex)}
          disabled={slot.StatusName === "booked"} // ปิดการใช้งานถ้าถูกจอง
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
          <div className="flex space-x-2">
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
                  src={courtImage} // เปลี่ยนจาก court เป็น courtImage
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