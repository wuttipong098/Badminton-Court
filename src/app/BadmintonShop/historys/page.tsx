"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import "react-toastify/dist/ReactToastify.css";

interface Booking {
  id: number;
  date: string;
  court: string;
  time: string;
  name: string;
  price: number;
}

interface Court {
  court_number: number;
}

interface MonthlySummary {
  month: number;
  year: number;
  monthName: string;
  revenue: number;
}

const BadmintonCourtBooking = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [court, setCourt] = useState("all");
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(true); // เพิ่ม state สำหรับควบคุมการซ่อน/แสดง

  // ดึงข้อมูลสนามจาก API พร้อม userId
  const fetchCourts = async () => {
    const userId = localStorage.getItem("userID");
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      const res = await fetch(`/api/BS/getCourts?userId=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      console.log("Courts API response:", json);

      if (json.success) {
        setCourts(json.data.courts);
      } else {
        toast.error(json.message || "Failed to fetch courts");
      }
    } catch (err: any) {
      console.error("Fetch courts error:", err);
      toast.error(err.message || "An error occurred while fetching courts");
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userID");
    if (!userId) {
      toast.error("User not logged in or stadiumId not set");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/BS/getBookingHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, court, userId }),
      });

      const json = await res.json();
      console.log("API response:", json);

      if (json.success) {
        setBookings(json.data.bookings);
        setTotalRevenue(json.data.totalRevenue);
        setMonthlySummary(json.data.monthlySummary || []);
        toast.success("ดึงข้อมูลการจองสำเร็จ!", { autoClose: 1000 });
      } else {
        toast.error(json.message || "Failed to fetch bookings");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(err.message || "An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
    fetchBookings();
  }, []);

  const filterBookings = () => {
    fetchBookings();
  };

  // ฟังก์ชันสำหรับ toggle การซ่อน/แสดงสรุป
  const toggleSummaryVisibility = () => {
    setIsSummaryVisible(!isSummaryVisible);
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto text-black">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-black">Badminton Court Booking</h2>

      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <div className="flex flex-col min-w-[150px]">
          <label className="text-black font-semibold mb-1">วันที่เริ่มต้น</label>
          <input
            type="date"
            className="w-full h-10 p-2 border rounded text-black"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col min-w-[150px]">
          <label className="text-black font-semibold mb-1">วันที่สิ้นสุด</label>
          <input
            type="date"
            className="w-full h-10 p-2 border rounded text-black"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col min-w-[150px]">
          <label className="text-black font-semibold mb-1">เลือกคอร์ด</label>
          <select
            className="w-full h-10 p-2 border rounded text-black"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            disabled={loading}
          >
            <option value="all">ทุกคอร์ด</option>
            {courts.map((courtItem) => (
              <option key={courtItem.court_number} value={courtItem.court_number}>
                คอร์ด {courtItem.court_number}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col min-w-[150px]">
          <label className="text-black font-semibold mb-1 invisible">ค้นหา</label>
          <button
            onClick={filterBookings}
            className="w-full h-10 p-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>
      </div>

      {/* สรุปภาพรวมรายรับ */}
      <h3 className="text-lg font-semibold mb-4">
        สรุปรายได้ที่ได้รับ: <span className="text-green-600">{totalRevenue.toLocaleString()}</span> บาท
      </h3>

      {/* สรุปรายรับตามเดือนและปี */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold mb-2">สรุปรายรับตามเดือนและปี</h3>
          <button onClick={toggleSummaryVisibility} className="text-blue-500 hover:underline focus:outline-none flex items-center">
          {isSummaryVisible ? (
            <>
              ซ่อน <FaChevronUp className="ml-1" />
            </>
          ) : (
            <>
              แสดง <FaChevronDown className="ml-1" />
            </>
          )}
        </button>
        </div>
        {isSummaryVisible && (
          <div>
            {monthlySummary.length > 0 ? (
              <div className="grid gap-4">
                {monthlySummary.map((summary, index) => (
                  <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                    <p className="text-black">
                      <strong>เดือน:</strong> {summary.monthName} {summary.year}
                    </p>
                    <p className="text-green-600">
                      <strong>รายรับ:</strong> {summary.revenue.toLocaleString()} บาท
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">ไม่มีข้อมูลรายรับในช่วงเวลาที่เลือก</p>
            )}
          </div>
        )}
      </div>

      {/* รายการจอง */}
      <h3 className="text-lg font-semibold mb-2">รายการจอง</h3>
      <ul className="mt-4 space-y-3">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="p-3 border-b border-gray-300 cursor-pointer"
            onClick={() => setSelectedBookingId(booking.id === selectedBookingId ? null : booking.id)}
          >
            <p>
              <strong>วันที่:</strong> {booking.date} | <strong>คอร์ด:</strong> {booking.court} |{" "}
              <strong>เวลา:</strong> {booking.time} | <strong>ชื่อผู้จอง:</strong> {booking.name}
            </p>
            {selectedBookingId === booking.id && (
              <div className="mt-2 p-4 bg-gray-200 rounded">
                <h3 className="text-lg font-bold">รายละเอียดการจอง</h3>
                <p>
                  <strong>วันที่:</strong> {booking.date}
                </p>
                <p>
                  <strong>คอร์ด:</strong> {booking.court}
                </p>
                <p>
                  <strong>เวลา:</strong> {booking.time}
                </p>
                <p>
                  <strong>ชื่อผู้จอง:</strong> {booking.name}
                </p>
                <p>
                  <strong>ราคา:</strong> {booking.price} บาท
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BadmintonCourtBooking;