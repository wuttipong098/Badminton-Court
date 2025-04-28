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
  const courtId = searchParams.get("courtId");

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
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));


  const addTimeRange = () => {
    if (startHour && startMinute && endHour && endMinute) {
      const startTime = `${startHour}:${startMinute}`;
      const endTime = `${endHour}:${endMinute}`;
      setTimeRanges(prev => [...prev, { start: startTime, end: endTime }]);
      
      // reset หลังเพิ่ม
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">
          ตั้งค่าการจองสำหรับสนามที่ {courtId}
        </h2>
        <button 
          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          onClick={() => router.push(`/BadmintonShop/booking`)}
        >
          กลับไป
        </button>
      </div>

      {/* วันเริ่มต้น / วันสิ้นสุด */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium text-black">วันเริ่มโปรโมชัน :</label>
          <input type="date" className="border p-2 w-full text-black" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium text-black">วันสิ้นสุดโปรโมชัน :</label>
          <input type="date" className="border p-2 w-full text-black" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* ราคา / ราคาโปรโมชัน */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium text-black">ราคาจอง :</label>
          <input type="number" className="border p-2 w-full text-black" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="block font-medium text-black">ราคาโปรโมชัน :</label>
          <input type="number" className="border p-2 w-full text-black" value={promoPrice} onChange={(e) => setPromoPrice(Number(e.target.value))} />
        </div>
      </div>

      {/* เลือกช่วงเวลาแบบแยก ชั่วโมง/นาที */}
      <div className="mb-4">
        <label className="block font-medium text-black mb-2">เลือกช่วงเวลาเปิดให้จอง :</label>
        <div className="grid grid-cols-4 gap-2">
          <select
            className="border p-2 text-black"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          >
            <option value="">ชั่วโมงเริ่มต้น</option>
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <select
            className="border p-2 text-black"
            value={startMinute}
            onChange={(e) => setStartMinute(e.target.value)}
          >
            <option value="">นาทีเริ่มต้น</option>
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="border p-2 text-black"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          >
            <option value="">ชั่วโมงสิ้นสุด</option>
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <select
            className="border p-2 text-black"
            value={endMinute}
            onChange={(e) => setEndMinute(e.target.value)}
          >
            <option value="">นาทีสิ้นสุด</option>
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={addTimeRange}
          className="mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          เพิ่มช่วงเวลา
        </button>

        {/* แสดงช่วงเวลาที่เลือก */}
        <div className="mt-4">
          {timeRanges.map((range, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
              <span className="text-black">{range.start} - {range.end}</span>
              <button 
                onClick={() => removeTimeRange(index)}
                className="text-red-500 hover:text-red-700"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ชำระเงินภายใน */}
      <div className="mb-4">
        <label className="block font-medium text-black">ชำระเงินภายใน (นาที) :</label>
        <input type="number" className="border p-2 w-full text-black" value={paymentTime} onChange={(e) => setPaymentTime(Number(e.target.value))} />
      </div>

      {/* ปุ่มบันทึก */}
      <button className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4 hover:bg-blue-600">
        บันทึกการตั้งค่า
      </button>
    </div>
  );
};

export default BookingSettings;
