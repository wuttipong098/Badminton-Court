"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CourtItem {
  stadiumId: number;
  courtId: number;
  slots: number[]; // Reflect that slots are numbers
  timeSlots: string[];
}

const CourtBooking = () => {
  const router = useRouter();
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userID");
    if (!userId) return;

    const fetchCourtData = async () => {
      try {
        const res = await fetch(`/api/BS/getCourtData?userId=${userId}`);
        const result = await res.json();
        if (result.success) {
          setCourts(result.data.courts.sort((a: CourtItem, b: CourtItem) => a.courtId - b.courtId));
          setTimeSlots(result.data.timeSlots);
        } else {
          showMessage("⚠️ โหลดข้อมูลไม่สำเร็จ");
        }
      } catch (error) {
        console.error("❌ โหลดข้อมูลล้มเหลว", error);
        showMessage("❌ โหลดข้อมูลล้มเหลว!");
      }
    };

    fetchCourtData();
  }, []);

  const handleAddCourt = () => {
    router.push("/BadmintonShop/bookingSetting");
  };

  const removeCourt = async (stadiumId: number, courtId: number) => {
    if (!window.confirm(`⚠️ คุณต้องการลบคอร์ทที่ ${courtId} ใช่หรือไม่?`)) return;
    try {
      await fetch(`/api/BS/deleteCourt?stadiumId=${stadiumId}&courtId=${courtId}`, { method: "DELETE" });

      setCourts(prev => prev.filter(c => c.courtId !== courtId || c.stadiumId !== stadiumId));
      showMessage(`❌ ลบคอร์ทที่ ${courtId} สำเร็จ`);
    } catch (error) {
      console.error("❌ ลบคอร์ทไม่สำเร็จ", error);
      showMessage("❌ ลบคอร์ทล้มเหลว!");
    }
  };

  // Function to determine slot color based on status
  const getSlotColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500";  // Available
      case 2:
        return "bg-red-500";    // Booked
      case 3:
        return "bg-yellow-500"; // Pending
      default:
        return "bg-gray-500";   // Unknown status
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto">
      {message && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">Badminton Court Booking</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md font-bold hover:bg-blue-600"
          onClick={handleAddCourt}
        >
          ➕ เพิ่มสนาม
        </button>
      </div>

      {courts.length === 0 ? (
        <p className="text-gray-500">⚠️ ไม่มีคอร์ทที่เปิดให้จอง</p>
      ) : (
        courts.map((court) => (
          <div key={court.courtId} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <h2
                className="text-lg font-semibold text-green-700 cursor-pointer hover:underline"
                onClick={() => router.push(`/BadmintonShop/bookingSetting?courtId=${court.courtId}&stadiumId=${court.stadiumId}`)}
              >
                สนามที่ {court.courtId}
              </h2>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                onClick={() => removeCourt(court.stadiumId, court.courtId)}
              >
                ❌ ลบคอร์ท
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-2">
              {court.slots.map((status, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-md text-white font-bold ${getSlotColor(status)}`}
                >
                  {court.timeSlots[index] || `ช่วงที่ ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CourtBooking;