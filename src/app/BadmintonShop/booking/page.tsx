"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CourtBooking = () => {
    const router = useRouter();
    const initialCourts = [
        { id: 1, slots: [false, false, false, false, false] },
        { id: 2, slots: [true, false, false, false, false] },
    ];

    const [courts, setCourts] = useState(initialCourts);
    const [message, setMessage] = useState(""); 
    const [isSaving, setIsSaving] = useState(false);
    const timeSlots = ["13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"];

    // ฟังก์ชันเปลี่ยนสถานะการจอง
    const toggleBooking = (courtId: number, slotIndex: number) => {
        if (!window.confirm("คุณต้องการเปลี่ยนสถานะการจองใช่หรือไม่?")) return;
        setCourts(prevCourts =>
            prevCourts.map(court =>
                court.id === courtId
                    ? { ...court, slots: court.slots.map((slot, index) => (index === slotIndex ? !slot : slot)) }
                    : court
            )
        );
    };

    // ฟังก์ชันแจ้งเตือน
    const showMessage = (text: string) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 2000);
    };

    // ฟังก์ชันเพิ่มสนาม
    const addCourt = () => {
        if (courts.length >= 5) {
            showMessage("⚠️ สนามเต็มแล้ว!");
            return;
        }
        const newCourt = {
            id: courts.length > 0 ? courts[courts.length - 1].id + 1 : 1,
            slots: Array(5).fill(false),
        };
        setCourts([...courts, newCourt]);
    };

    // ฟังก์ชันลบสนาม
    const removeCourt = (courtId: number) => {
        if (!window.confirm(`⚠️ คุณต้องการลบสนามที่ ${courtId} ใช่หรือไม่?`)) return;
        setCourts(prevCourts => prevCourts.filter(court => court.id !== courtId));
        showMessage(`❌ ลบสนามที่ ${courtId} สำเร็จ`);
    };

    // ฟังก์ชันบันทึกข้อมูล
    const saveToDatabase = async () => {
        if (courts.length === 0) {
            showMessage("⚠️ ไม่มีสนามให้บันทึก!");
            return;
        }

        setIsSaving(true);
        try {
            console.log("📥 ส่งข้อมูลไปยัง Database:", courts);
            await fetch("/api/saveCourts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courts }),
            });
            showMessage("✅ บันทึกข้อมูลสำเร็จ!");
        } catch (error) {
            console.error("❌ บันทึกไม่สำเร็จ", error);
            showMessage("❌ บันทึกข้อมูลล้มเหลว!");
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center relative">
            {message && (
                <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    {message}
                </div>
            )}
        
            <h1 className="text-2xl font-bold mb-4 text-green-700">Badminton Court Booking</h1>

            <button 
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md font-bold hover:bg-blue-600"
                onClick={addCourt}
            >
                ➕ เพิ่มสนาม
            </button>

            {courts.length === 0 ? (
                <p className="text-gray-500">⚠️ ไม่มีสนามที่เปิดให้จอง</p>
            ) : (
                courts.map((court) => (
                    <div key={court.id} className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <h2
                                className="text-lg font-semibold text-green-700 cursor-pointer hover:underline"
                                onClick={() => router.push(`/BadmintonShop/bookingSetting?courtId=${court.id}`)}
                            >
                                สนามที่ {court.id}
                            </h2>
                            <button 
                                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                onClick={() => removeCourt(court.id)}
                            >
                                ❌ ลบสนาม
                            </button>
                        </div>

                        {/* ✅ Slot จองเวลา (อยู่ภายในสนามที่ถูกต้อง) */}
                        <div className="grid grid-cols-5 gap-2 mt-2">
                            {court.slots.map((isBooked, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 rounded-md text-white font-bold ${isBooked ? 'bg-red-500' : 'bg-green-500'}`}
                                    onClick={() => toggleBooking(court.id, index)}
                                >
                                    {timeSlots[index]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}

            <button 
                className={`mt-4 px-6 py-2 rounded-md font-bold transition duration-300 ${
                    isSaving ? "bg-gray-500 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 text-white"
                }`}
                onClick={saveToDatabase}
                disabled={isSaving}
            >
                {isSaving ? "⏳ กำลังบันทึก..." : "💾 บันทึกการจอง"}
            </button>
        </div>
    );
};

export default CourtBooking;