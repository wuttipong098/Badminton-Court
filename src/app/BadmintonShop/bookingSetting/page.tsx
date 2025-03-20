"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const BookingSettings = () => {
    const router = useRouter();

    const [selectedDuration, setSelectedDuration] = useState(60);
    const [price, setPrice] = useState(0);
    const [promoPrice, setPromoPrice] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [promoStart, setPromoStart] = useState("");
    const [promoEnd, setPromoEnd] = useState("");
    const [paymentTime, setPaymentTime] = useState(0);
    const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);
    const searchParams = useSearchParams();
    const courtId = searchParams.get("courtId");
    
    const durations = [30, 60, 90, 120, 150];
    const availableTimes = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00", "22:00"
    ];
    
    const toggleTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        setSelectedTimes(prev =>
            prev.some(t => t.getHours() === date.getHours() && t.getMinutes() === date.getMinutes())
                ? prev.filter(t => !(t.getHours() === date.getHours() && t.getMinutes() === date.getMinutes()))
                : [...prev, date]
        );
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

            {/* ระยะห่างเวลา */}
            <div className="mb-4">
                <label className="block font-medium text-black">ระยะห่างเวลา :</label>
                <div className="flex gap-2 mt-2">
                    {durations.map((time) => (
                        <button
                            key={time}
                            className={`px-3 py-2 rounded-lg ${selectedDuration === time ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                            onClick={() => setSelectedDuration(time)}
                        >
                            {time} นาที
                        </button>
                    ))}
                </div>
            </div>

            {/* วันเริ่มต้น / วันสิ้นสุด */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block font-medium text-black">วันเริ่มต้น :</label>
                    <input type="date" className="border p-2 w-full text-black" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className="block font-medium text-black">วันสิ้นสุด :</label>
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

             {/* เลือกช่วงเวลาที่เปิดให้จอง */}
             <div className="mb-4">
                <label className="block font-medium text-black">เลือกเวลาที่เปิดให้จอง :</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {availableTimes.map((time) => (
                        <button
                            key={time}
                            className={`px-3 py-2 rounded-lg ${selectedTimes.some(t => t.getHours() === parseInt(time.split(":")[0]) && t.getMinutes() === parseInt(time.split(":")[1])) ? 'bg-blue-500 text-white' : 'bg-green-400 text-white'}`}
                            onClick={() => toggleTime(time)}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            {/* วันเริ่มโปรโมชัน / วันสิ้นสุดโปรโมชัน */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block font-medium text-black">วันเริ่มโปรโมชัน :</label>
                    <input type="date" className="border p-2 w-full text-black" value={promoStart} onChange={(e) => setPromoStart(e.target.value)} />
                </div>
                <div>
                    <label className="block font-medium text-black">วันสิ้นสุดโปรโมชัน :</label>
                    <input type="date" className="border p-2 w-full text-black" value={promoEnd} onChange={(e) => setPromoEnd(e.target.value)} />
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
