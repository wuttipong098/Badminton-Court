"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";

interface CourtItem {
  stadiumId: number;
  courtNumber: number;
  courtIds: number[];
  schedule: { time: string; status: number | null; courtId: number }[];
  timeSlots?: string[];
  slots?: number[];
}

const CourtBooking = () => {
  const router = useRouter();

  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<number, number | null>>({});
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const showMessage = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 2000);
  };

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

        const transformedCourts = json.data.courts.map((court: CourtItem) => ({
          ...court,
          timeSlots: court.schedule.map((s: { time: string }) => s.time),
          slots: court.schedule.map((s: { status: number | null }) => (s.status === null ? 0 : s.status)),
        }));

        const sorted = transformedCourts.sort((a: CourtItem, b: CourtItem) => a.courtNumber - b.courtNumber);
        console.log("Sorted Courts:", sorted);
        setCourts(sorted);
      } catch (err) {
        console.error("Fetch error:", err);
        showMessage("❌ โหลดข้อมูลล้มเหลว");
        setCourts([]);
      }
    })();
  }, [bookingDate, router]);

  const getSlotColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-red-500";
      case 3:
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const toggleSlot = (court: CourtItem, idx: number) => {
    if (court.slots && court.slots[idx] !== 1) return;
    const courtId = court.schedule[idx]?.courtId;
    if (courtId === undefined) {
      console.error(`No courtId found for index ${idx} in court`, court);
      return;
    }
    console.log(`Selecting courtId ${courtId} for time ${court.timeSlots[idx]}`);
    setSelectedSlots((prev) => ({
      ...prev,
      [courtId]: prev[courtId] === idx ? null : idx,
    }));
  };

  const totalSelected = Object.values(selectedSlots).filter((slot) => slot !== null).length;

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
      const payload = {
        userId: Number(userId),
        bookingDate,
        selections: Object.entries(selectedSlots)
          .filter(([_, slot]) => slot !== null)
          .map(([courtId, slot]) => ({
            stadiumId: null,
            courtId: Number(courtId),
            slots: [0], // ไม่ต้องใช้ slot index เพราะ 1 courtId = 1 slot
          })),
      };
      console.log("Payload before sending:", payload);
      const res = await fetch("/api/BS/bookMultipleCourts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        showMessage("✅ จองสำเร็จทั้งหมด");
        setCourts((cs) =>
          cs.map((c) => {
            const slotToBook = c.schedule.findIndex((s, i) => selectedSlots[s.courtId] === i);
            if (slotToBook !== -1) {
              const newSlots = [...(c.slots || [])];
              newSlots[slotToBook] = 2;
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
      {message && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <h1 className="text-2xl font-bold text-green-700 mb-4">Badminton Court Booking</h1>

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
            totalSelected > 0 && !isBooking ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isBooking ? "กำลังจอง..." : `จอง (${totalSelected})`}
        </button>
      </div>

      {courts.length === 0 ? (
        <p className="text-gray-500">⚠️ ไม่มีคอร์ทที่เปิดให้จองสำหรับวันที่เลือก</p>
      ) : (
        courts.map((court) => {
          if (!court.timeSlots || court.timeSlots.length === 0) {
            return (
              <div key={court.courtNumber} className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-lg font-semibold text-green-700 mb-2">
                  คอร์ทที่ {court.courtNumber}
                </h2>
                <p className="text-gray-500">ไม่มีช่วงเวลาที่สามารถจองได้</p>
              </div>
            );
          }

          return (
            <div key={court.courtNumber} className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-semibold text-green-700 mb-2">
                คอร์ทที่ {court.courtNumber}
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {court.slots &&
                  court.slots.map((status, idx) => {
                    const currentCourtId = court.schedule[idx]?.courtId;
                    if (currentCourtId === undefined) {
                      console.warn(`No courtId found for index ${idx} in court ${court.courtNumber}`);
                      return null;
                    }
                    const isSel = selectedSlots[currentCourtId] === idx;
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