"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";

interface CourtItem {
  stadiumId: number;
  courtId: number;
  slots: number[]; // 1=available, 2=booked, 3=pending
  timeSlots: string[]; // label per slot
}

const CourtBooking = () => {
  const router = useRouter();

  // state
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, number[]>>({});
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // helper: toast message
  const showMessage = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 2000);
  };

  // fetch courts when bookingDate changes
  useEffect(() => {
    const userId = localStorage.getItem("userID");
    console.log("Fetching with: userId =", userId, "bookingDate =", bookingDate);

    if (!userId) {
      showMessage("⚠️ กรุณาล็อกอิน");
      router.push("/login");
      return;
    }

    if (!bookingDate) {
      showMessage("⚠️ กรุณาเลือกวันที่");
      setCourts([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/BS/getDataReservation?userId=${encodeURIComponent(userId)}&bookingDate=${encodeURIComponent(bookingDate)}`
        );
        const json = await res.json();
        console.log("API Response:", json);
        if (!json.success) {
          showMessage(json.message || "⚠️ โหลดข้อมูลไม่สำเร็จ");
          setCourts([]);
          return;
        }
        const sorted = json.data.courts.sort(
          (a: CourtItem, b: CourtItem) => a.courtId - b.courtId
        );
        console.log("Sorted Courts:", sorted); // Debug log
        setCourts(sorted);
      } catch (err) {
        console.error("Fetch error:", err);
        showMessage("❌ โหลดข้อมูลล้มเหลว");
        setCourts([]);
      }
    })();
  }, [bookingDate, router]);

  // สีพื้นหลังของ slot ตามสถานะ
  const getSlotColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500"; // available
      case 2:
        return "bg-red-500"; // booked
      case 3:
        return "bg-yellow-500"; // pending
      default:
        return "bg-gray-500";
    }
  };

  // toggle เลือก slot
  const toggleSlot = (court: CourtItem, idx: number) => {
    if (court.slots[idx] !== 1) return; // เฉพาะ available
    const key = `${court.stadiumId}-${court.courtId}`;
    const prev = selectedSlots[key] || [];
    const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];

    setSelectedSlots({
      ...selectedSlots,
      [key]: next,
    });
  };

  // นับรวมจำนวน slot ที่เลือกได้ทั้งหมด
  const totalSelected = Object.values(selectedSlots).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // กดปุ่ม จอง (รวมทุกสนาม)
  const bookAll = async () => {
    if (totalSelected === 0) {
      showMessage("⚠️ กรุณาเลือกช่วงเวลาอย่างน้อย 1 ช่วง");
      return;
    }

    if (isBooking) {
      showMessage("⏳ กำลังดำเนินการจอง...");
      return;
    }

    const userId = localStorage.getItem("userID");
    if (!userId) {
      showMessage("⚠️ กรุณาล็อกอิน");
      router.push("/login");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch("/api/BS/bookMultipleCourts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          bookingDate,
          selections: Object.entries(selectedSlots).map(([key, slots]) => {
            const [stadiumId, courtId] = key.split("-").map(Number);
            return { stadiumId, courtId, slots };
          }),
        }),
      });
      const json = await res.json();

      if (json.success) {
        showMessage("✅ จองสำเร็จทั้งหมด");
        setCourts((cs) =>
          cs.map((c) => {
            const key = `${c.stadiumId}-${c.courtId}`;
            const slotsToBook = selectedSlots[key] || [];
            if (slotsToBook.length > 0) {
              const newSlots = [...c.slots];
              slotsToBook.forEach((i) => (newSlots[i] = 2));
              return { ...c, slots: newSlots };
            }
            return c;
          })
        );
        setSelectedSlots({});
      } else {
        showMessage(json.message || "❌ จองไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Book error:", err);
      showMessage("❌ เกิดข้อผิดพลาด");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto">
      {/* toast */}
      {message && (
        <div
          className="fixed top-5 left-1/2 transform -translate-x-1/2
                     bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          {message}
        </div>
      )}

      {/* header */}
      <h1 className="text-2xl font-bold text-green-700 mb-4">Badminton Court Booking</h1>

      {/* เลือกวันที่ + ปุ่มจอง */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <label className="block font-medium text-black mb-1 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            วันที่ต้องการจอง :
          </label>
          <input
            type="date"
            className="border p-2 rounded-lg text-black"
            value={bookingDate}
            min={new Date().toISOString().split("T")[0]}
            required
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </div>
        <button
          onClick={bookAll}
          disabled={totalSelected === 0 || isBooking}
          className={`px-6 py-3 rounded-md text-white font-bold ${
            totalSelected > 0 && !isBooking
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isBooking ? "กำลังจอง..." : `จอง (${totalSelected})`}
        </button>
      </div>

      {/* รายการสนาม */}
      {courts.length === 0 ? (
        <p className="text-gray-500">⚠️ ไม่มีคอร์ทที่เปิดให้จองสำหรับวันที่เลือก</p>
      ) : (
        courts.map((court) => {
          const key = `${court.stadiumId}-${court.courtId}`;
          const sel = selectedSlots[key] || [];

          // ตรวจสอบว่า court มี timeSlots หรือไม่
          if (!court.timeSlots || court.timeSlots.length === 0) {
            return (
              <div key={key} className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-lg font-semibold text-green-700 mb-2">
                  สนามที่ {court.courtId}
                </h2>
                <p className="text-gray-500">ไม่มีช่วงเวลาที่สามารถจองได้</p>
              </div>
            );
          }

          return (
            <div key={key} className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-semibold text-green-700 mb-2">
                สนามที่ {court.courtId}
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {court.slots.map((status, idx) => {
                  const isSel = sel.includes(idx);
                  const baseColor = getSlotColor(status);
                  const bgColor = isSel ? "bg-blue-500" : baseColor;

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleSlot(court, idx)}
                      disabled={status !== 1}
                      className={`
                        px-4 py-2 rounded-md text-white font-bold
                        ${bgColor}
                        ${status !== 1 ? "cursor-not-allowed opacity-60" : "hover:opacity-80"}
                      `}
                    >
                      {court.timeSlots[idx] ?? `ช่วงที่ ${idx + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CourtBooking;