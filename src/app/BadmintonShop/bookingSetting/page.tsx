"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TimeRange {
  start: string;
  end: string;
}

const BookingSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramCourtId = searchParams.get("courtId");
  const paramStadiumId = searchParams.get("stadiumId");

  const [courtId, setCourtId] = useState<number | null>(paramCourtId ? Number(paramCourtId) : null);
  const [stadiumId, setStadiumId] = useState<number | null>(paramStadiumId ? Number(paramStadiumId) : null);
  const [userId, setUserId] = useState<number | null>(null);

  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");

  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [price, setPrice] = useState(0);
  const [paymentTime, setPaymentTime] = useState(0);
  const [active, setActive] = useState(true);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "30"];

  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    if (storedUserId) {
      setUserId(Number(storedUserId));
    } else {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchCourtSetting = async () => {
      if (!courtId || !stadiumId || !userId) return;

      try {
        const res = await fetch(`/api/BS/getCourtSetting?courtId=${courtId}&stadiumId=${stadiumId}&userId=${userId}`);
        const result = await res.json();

        if (result.success) {
          setPrice(result.data.price || 0);
          setPaymentTime(result.data.paymentTime || 0);
          setTimeRanges(result.data.timeRanges || []);
        } else {
          console.warn("⚠️ โหลดข้อมูลไม่สำเร็จ:", result.message);
        }
      } catch (err) {
        console.error("❌ Error loading court setting:", err);
      }
    };

    fetchCourtSetting();
  }, [courtId, stadiumId, userId]);

  const handleSave = async () => {

    const payload = {
      courtId,
      price,
      timeRanges,
      paymentTime,
      userId,
      stadiumId,
      active,
    };

    try {
      const res = await fetch("/api/BS/bookingSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("บันทึกสำเร็จ!");
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const addTimeRange = () => {
    if (startHour && startMinute && endHour && endMinute) {
      const startTime = `${startHour}:${startMinute}`;
      const endTime = `${endHour}:${endMinute}`;
      setTimeRanges(prev => [...prev, { start: startTime, end: endTime }]);

      setStartHour("");
      setStartMinute("");
      setEndHour("");
      setEndMinute("");
    }
  };

  const removeTimeRange = (index: number) => {
    setTimeRanges(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">
          ตั้งค่าการจองสำหรับคอร์ดที่ {courtId}
        </h2>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => router.push(`/BadmintonShop/booking`)}
        >
          ← กลับ
        </button>
      </div>

      {/* สนามที่ */}
      <fieldset className="mb-6 border border-gray-300 bg-white rounded-lg p-4">
        <legend className="text-lg font-semibold text-black px-2">การตั้งคอร์ด</legend>
        <label className="block mt-2 text-black font-medium">คอร์ดที่ :</label>
        <input
          type="number"
          className="border p-2 w-full mt-1 text-black bg-white"
          value={courtId ?? ""}
          onChange={(e) => setCourtId(Number(e.target.value))}
        />

        <label className="block mt-4 text-black font-medium">
          เปิดใช้งานคอร์ดนี้ :
        </label>
        <div className="flex items-center space-x-3 mt-1">
          <input
            type="checkbox"
            checked={active}
            onChange={() => setActive(!active)}
            className="w-5 h-5"
          />
          <span className="text-black font-medium">{active ? "เปิดอยู่ ✅" : "ปิดอยู่ ❌"}</span>
        </div>
      </fieldset>
      {/* ช่วงเวลา */}
      <fieldset className="mb-6 border border-gray-300 bg-white rounded-lg p-4">
        <legend className="text-lg font-semibold text-black px-2">🕒 ช่วงเวลาเปิดให้จอง</legend>
        <div className="grid grid-cols-4 gap-2">
          <select className="border p-2 text-black bg-white" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
            <option value="">ชั่วโมงเริ่ม</option>
            {hours.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select className="border p-2 text-black bg-white" value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
            <option value="">นาทีเริ่ม</option>
            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="border p-2 text-black bg-white" value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            <option value="">ชั่วโมงสิ้นสุด</option>
            {hours.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select className="border p-2 text-black bg-white" value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
            <option value="">นาทีสิ้นสุด</option>
            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <button
          onClick={addTimeRange}
          className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ➕ เพิ่มช่วงเวลา
        </button>

        {timeRanges.length > 0 && (
          <div className="mt-4 space-y-2">
            {timeRanges.map((range, index) => (
              <div key={index} className="flex justify-between items-center border border-gray-300 p-2 rounded">
                <span className="text-black font-medium">{range.start} - {range.end}</span>
                <button onClick={() => removeTimeRange(index)} className="text-red-500 hover:text-red-700">
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700"
      >
        💾 บันทึกการตั้งค่า
      </button>
    </div>
  );
};

export default BookingSettings;
