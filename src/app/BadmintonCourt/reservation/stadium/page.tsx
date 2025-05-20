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
import { CreateAccountParams } from "@/dto/request/addmenu";

// อินเทอร์เฟซสำหรับ selectedTimeSlots
interface SelectedTimeSlot extends TimeSlot {
  court: number;
  bookingDate: string;
}

const StadiumPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([]);
  const [courts, setCourts] = useState<court[]>([]);
  const [stadiumName, setStadiumName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState<string[]>([]);
  const MySwal = withReactContent(Swal);

  const userId = searchParams.get("userId");
  const stadiumId = searchParams.get("stadiumId");
  const initialBookingDate = searchParams.get("bookingDate") || "2025-05-20"; // กำหนดค่าเริ่มต้นหากเป็น null

  // ตรวจสอบว่า initialBookingDate มีค่าที่ถูกต้อง (รูปแบบ YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(initialBookingDate)) {
    console.error("Invalid bookingDate format:", initialBookingDate);
    MySwal.fire("ข้อผิดพลาด", "วันที่จองไม่ถูกต้อง", "error").then(() => {
      router.push("/BadmintonCourt/reservation");
    });
  }

  const formatThaiDate = (isoDate: string | null) => {
    if (!isoDate) return "ไม่ระบุวันที่";
    const [year, month, day] = isoDate.split("-");
    const thaiYear = parseInt(year) + 543;
    return `${day}/${month}/${thaiYear}`;
  };

  const fetchStadiumName = async () => {
    try {
      if (!stadiumId) {
        setStadiumName("ไม่ระบุสนาม");
        return;
      }
      const response = await fetch("/api/stadium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ StadiumID: parseInt(stadiumId) }),
      });
      const result = await response.json();
      if (result.status_code === 200 && result.data && result.data.length > 0) {
        setStadiumName(result.data[0].StadiumName || "ไม่ระบุสนาม");
      } else {
        setStadiumName("ไม่ระบุสนาม");
      }
    } catch (error) {
      console.error("Error fetching stadium name:", error);
      setStadiumName("ไม่ระบุสนาม");
    }
  };

  const fetchCourtDetails = async (date: string) => {
    try {
      if (!userId || !stadiumId || !date) {
        MySwal.fire("ข้อผิดพลาด", "ข้อมูลที่จำเป็นไม่ครบถ้วน", "error");
        return;
      }
      const params: SearchAccountParams = { StadiumID: parseInt(stadiumId), BookingDate: date };
      const response = await fetch("/api/court", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const result = await response.json();
      if (result.status_code === 200) {
        const sortedCourts = result.data.map((court: court) => ({
          ...court,
          TimeSlots: court.TimeSlots.sort((a: TimeSlot, b: TimeSlot) => a.StartTime.localeCompare(b.StartTime)),
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

  const handleAddBooking = async () => {
    if (selectedTimeSlots.length === 0) {
      MySwal.fire("ข้อผิดพลาด", "กรุณาเลือกสล็อตเวลาอย่างน้อยหนึ่งสล็อต", "error");
      return;
    }
    try {
      for (const slot of selectedTimeSlots) {
        const court = courts.find((c) => c.CourtNumber === slot.court);
        const pricePerSlot = court ? court.PriceHour : 0;
        const bookingParams: CreateAccountParams = {
          UserID: parseInt(userId!),
          CourtId: slot.court,
          StartTime: slot.StartTime,
          EndTime: slot.EndTime,
          TotalPrice: pricePerSlot,
          BookingDate: slot.bookingDate,
        };
        const response = await fetch("/api/addmenu", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingParams),
        });
        const result = await response.json();
        if (result.status_code !== 201) {
          MySwal.fire("ข้อผิดพลาด", "ไม่สามารถเพิ่มการจองได้", "error");
          return;
        }
      }
      const existingBookings = JSON.parse(localStorage.getItem("bookingCart") || "[]");
      const newBooking = {
        userId,
        stadiumId,
        bookingDate: initialBookingDate,
        slots: selectedTimeSlots.map((slot) => {
          const court = courts.find((c) => c.CourtNumber === slot.court);
          const pricePerSlot = court ? court.PriceHour : 0;
          return {
            courtId: slot.court,
            slotTime: `${slot.StartTime.slice(0, 5)} - ${slot.EndTime.slice(0, 5)}`,
            startTime: slot.StartTime,
            endTime: slot.EndTime,
            price: pricePerSlot,
            bookingDate: slot.bookingDate,
          };
        }),
      };
      localStorage.setItem("bookingCart", JSON.stringify([...existingBookings, newBooking]));
      setSelectedTimeSlots([]);
      router.push("/BadmintonCourt/reservation");
    } catch (error) {
      console.error("Error adding booking:", error);
      MySwal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการเพิ่มการจอง", "error");
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/addmenu?UserID=${userId}`);
      const result = await response.json();
      if (result.status_code === 200) return result.data;
      MySwal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลการจองได้", "error");
      return [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      MySwal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
      return [];
    }
  };

  const handleDeleteAllBookings = async () => {
    try {
      const bookings = await fetchBookings();
      if (bookings.length === 0) return true;
      for (const booking of bookings) {
        const response = await fetch("/api/addmenu", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addmenuID: booking.addmenuID }),
        });
        const result = await response.json();
        if (result.status_code !== 200) {
          MySwal.fire("ข้อผิดพลาด", `ไม่สามารถลบการจอง ID ${booking.addmenuID} ได้`, "error");
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting all bookings:", error);
      MySwal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการลบการจองทั้งหมด", "error");
      return false;
    }
  };

  const handleDeleteBooking = async (addmenuID: number) => {
    try {
      const response = await fetch("/api/addmenu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addmenuID }),
      });
      const result = await response.json();
      if (result.status_code === 200) {
        MySwal.fire("สำเร็จ", "ลบการจองเรียบร้อยแล้ว", "success");
        handleClick();
      } else {
        MySwal.fire("ข้อผิดพลาด", result.status_message, "error");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      MySwal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการลบการจอง", "error");
    }
  };

  const handleDeleteCurrentBooking = (index: number) => {
    setSelectedTimeSlots((prev) => prev.filter((_, i) => i !== index));
    MySwal.fire("สำเร็จ", "ลบการจองปัจจุบันเรียบร้อยแล้ว", "success");
    handleClick();
  };

  const handleClick = async () => {
    if (selectedTimeSlots.length === 0) {
      MySwal.fire("ข้อผิดพลาด", "กรุณาเลือกสล็อตเวลาอย่างน้อยหนึ่งสล็อต", "error");
      return;
    }
    try {
      const bookings = await fetchBookings();
      const currentBookings = selectedTimeSlots.map((slot, index) => {
        const court = courts.find((c) => c.CourtNumber === slot.court);
        const pricePerSlot = court ? court.PriceHour : 0;
        return {
          CourtId: slot.court,
          BookingDate: slot.bookingDate,
          StartTime: slot.StartTime,
          EndTime: slot.EndTime,
          TotalPrice: pricePerSlot,
          addmenuID: null,
          currentIndex: index,
        };
      });
      const allBookings = [...bookings, ...currentBookings];
      const grandTotalPrice = allBookings.reduce((total: number, booking: any) => total + booking.TotalPrice, 0);
      const bookingDetails = allBookings
        .map((booking: any, index: number) => `
          <div style="margin-bottom: 10px;">
            <p>รายการที่ ${index + 1}</p>
            <p>สนามที่: ${booking.CourtId}</p>
            <p>วันที่: ${formatThaiDate(booking.BookingDate)}</p>
            <p>เวลา: ${booking.StartTime.slice(0, 5)} - ${booking.EndTime.slice(0, 5)}</p>
            <p>ราคา: ฿${booking.TotalPrice}</p>
            ${
              booking.addmenuID
                ? `<button onclick="window.deleteBooking(${booking.addmenuID})" class="bg-red-500 text-white px-4 py-1 rounded">ลบ</button>`
                : `<button onclick="window.deleteCurrentBooking(${booking.currentIndex})" class="bg-red-500 text-white px-4 py-1 rounded">ลบ</button>`
            }
          </div>
          ${index < allBookings.length - 1 ? "<hr>" : ""}
        `)
        .join("");

      MySwal.fire({
        title: "ตะกร้าการจอง",
        html: `
          <div style="text-align: left; font-size: 16px;">
            <p><strong>สนาม:</strong> ${stadiumName}</p>
            <p><strong>การจองทั้งหมด:</strong></p>
            ${bookingDetails || "<p>ยังไม่มีการจอง</p>"}
            <br>
            <p><strong>ราคารวมทั้งหมด:</strong> ฿${grandTotalPrice}</p>
          </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "ยืนยันการจอง",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
        customClass: {
          confirmButton: "bg-green-500 text-white px-6 py-2 rounded font-medium mx-2 cursor-pointer",
          cancelButton: "bg-red-500 text-white px-6 py-2 rounded font-medium mx-2 cursor-pointer",
        },
        buttonsStyling: false,
        didOpen: () => {
          (window as any).deleteBooking = (addmenuID: number) => handleDeleteBooking(addmenuID);
          (window as any).deleteCurrentBooking = (index: number) => handleDeleteCurrentBooking(index);
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const deleteSuccess = await handleDeleteAllBookings();
          if (!deleteSuccess) return;
          const bookingData = {
            userId,
            stadiumId,
            bookingDates: Array.from(new Set([...selectedTimeSlots.map(s => s.bookingDate), ...bookings.map((b: any) => b.BookingDate)])),
            slots: allBookings.map((booking: any) => ({
              courtId: booking.CourtId,
              slotTime: `${booking.StartTime.slice(0, 5)} - ${booking.EndTime.slice(0, 5)}`,
              startTime: booking.StartTime,
              endTime: booking.EndTime,
              price: booking.TotalPrice,
              bookingDate: booking.BookingDate,
            })),
            total_price: grandTotalPrice,
          };
          localStorage.setItem("bookingData", JSON.stringify(bookingData));
          setSelectedTimeSlots([]);
          router.push("/BadmintonCourt/reservation/payment");
        }
      });
    } catch (error) {
      console.error("Error displaying booking cart:", error);
      MySwal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการแสดงตะกร้าการจอง", "error");
    }
  };

  const handleTimeSlotClick = (slot: TimeSlot, courtIndex: number) => {
    if (slot.StatusName === "booked" || slot.StatusName === "ไม่ว่าง" || slot.StatusName === "กำลังจอง") {
      MySwal.fire("ข้อผิดพลาด", "สล็อตนี้ไม่สามารถจองได้", "warning");
      return;
    }
    const newSlot: SelectedTimeSlot = { ...slot, court: courtIndex, bookingDate: initialBookingDate };
    setSelectedTimeSlots((prev) => {
      const exists = prev.some(
        (selected) =>
          selected.StartTime === slot.StartTime &&
          selected.EndTime === slot.EndTime &&
          selected.court === courtIndex,
      );
      if (exists) {
        return prev.filter(
          (selected) =>
            !(
              selected.StartTime === slot.StartTime &&
              selected.EndTime === slot.EndTime &&
              selected.court === courtIndex
            ),
        );
      }
      return [...prev, newSlot];
    });
  };

  const renderTimeSlots = (courtIndex: number, timeSlots: TimeSlot[]) => {
    return timeSlots.map((slot, index) => {
      const isSelected = selectedTimeSlots.some(
        (selected) =>
          selected.StartTime === slot.StartTime &&
          selected.EndTime === slot.EndTime &&
          selected.court === courtIndex,
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
          className={`${styles.timebox} ${isSelected ? styles.selected : ""} ${statusClass}`}
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

  useEffect(() => {
    if (stadiumId && initialBookingDate) {
      setBookingDates([initialBookingDate]);
      fetchStadiumName();
      fetchCourtDetails(initialBookingDate);
    }
  }, [userId, stadiumId, initialBookingDate]);

  if (loading) return <div className={styles.container}>กำลังโหลด...</div>;

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
                สนาม: {stadiumName} | วันที่: {formatThaiDate(initialBookingDate)}
              </span>
            </div>
            <button className={styles.button} onClick={handleClick}>
              จอง
            </button>
            <button className={styles.aday} onClick={handleAddBooking}>
              เพิ่มวันจอง
            </button>
          </div>
        </div>
        <div className="mt-20">
          {courts.map((courtItem) => (
            <div key={courtItem.CourtNumber}>
              <div className={`${courtItem.CourtNumber === 1 ? styles["mt-25-custom"] : "mt-2"} mb-6 p-4`}>
                <Image src={courtImage} alt="BadmintonCourt" width={120} height={50} />
                <label className="mt-30 mb-6 ml-5 rounded-lg bg-[#3BBC7A] p-2 text-white">
                  สนามที่ {courtItem.CourtNumber}
                </label>
              </div>
              <div className={styles.grouptimbox}>{renderTimeSlots(courtItem.CourtNumber, courtItem.TimeSlots)}</div>
            </div>
          ))}
        </div>
        <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
      </div>
    </div>
  );
};

export default StadiumPage;