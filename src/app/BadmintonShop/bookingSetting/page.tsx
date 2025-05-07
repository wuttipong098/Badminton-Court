"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TimeRange {
  start: string;
  end: string;
}

const BookingSettings = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCourtId = searchParams.get("courtId");
  const [courtId, setCourtId] = useState<number | null>(paramCourtId ? Number(paramCourtId) : null);
  const [stadiumId, setStadiumId] = useState("");
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [price, setPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentTime, setPaymentTime] = useState(0);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "30"];

  const handleSave = async () => {
    const payload = { courtId, stadiumId, price, timeRanges, paymentTime };
  
    const res = await fetch("/api/BS/bookingSettings", {
      method: "POST", // ใช้ POST สำหรับการเพิ่ม
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    const data = await res.json();
    if (res.ok) {
      alert("บันทึกสำเร็จ!");
    } else {
      alert("เกิดข้อผิดพลาด: " + data.message);
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
          ตั้งค่าการจองสำหรับสนามที่ {courtId}
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
        <legend className="text-lg font-semibold text-black px-2">การตั้งสนาม</legend>
        <label className="block mt-2 text-black font-medium">สนามที่ :</label>
        <input
          type="number"
          className="border p-2 w-full mt-1 text-black bg-white"
          value={courtId ?? ""}
          onChange={(e) => setCourtId(Number(e.target.value))}
        />
      </fieldset>

      {/* ราคา */}
      <fieldset className="mb-6 border border-gray-300 bg-white rounded-lg p-4">
        <legend className="text-lg font-semibold text-black px-2">💰 การตั้งค่าราคา</legend>
        <label className="block mt-2 text-black font-medium">ราคาจอง (บาท):</label>
        <input
          type="number"
          className="border p-2 w-full mt-1 text-black bg-white"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
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

      {/* ชำระเงินภายใน */}
      <fieldset className="mb-6 border border-gray-300 bg-white rounded-lg p-4">
        <legend className="text-lg font-semibold text-black px-2">💳 การชำระเงิน</legend>
        <label className="block text-black font-medium">ชำระเงินภายใน (นาที):</label>
        <input
          type="number"
          className="border p-2 w-full mt-1 text-black bg-white"
          value={paymentTime}
          onChange={(e) => setPaymentTime(Number(e.target.value))}
        />
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
