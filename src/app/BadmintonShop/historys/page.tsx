"use client";

import React, { useState } from "react";

const BadmintonCourtBooking = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [court, setCourt] = useState("all");
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [bookings, setBookings] = useState([
        { id: 1, date: "07/03/2545", court: "สนามที่ 1", time: "17.20 น.", name: "สมชาย นามสมมติ", price: 100 },
        { id: 2, date: "08/03/2545", court: "สนามที่ 2", time: "18.00 น.", name: "วิทยา ใจดี", price: 120 },
        // เพิ่มข้อมูลการจองเพิ่มเติมที่นี่
    ]);

    const filterBookings = () => {
        // ฟังก์ชันกรองข้อมูลที่นี่
    };

    return (
        <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto text-black">
            <h2 className="text-2xl font-bold mb-4 text-black">Badminton Court Booking</h2>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <input type="date" className="p-2 border rounded text-black" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="p-2 border rounded text-black" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <select className="p-2 border rounded text-black" value={court} onChange={(e) => setCourt(e.target.value)}>
                    <option value="all">ทุกสนาม</option>
                    <option value="1">สนามที่ 1</option>
                    <option value="2">สนามที่ 2</option>
                    <option value="3">สนามที่ 3</option>
                </select>
                <button onClick={filterBookings} className="p-2 bg-blue-500 text-white rounded">ค้นหา</button>
            </div>
            
            <h3 className="text-lg font-semibold">สรุปรายได้ที่ได้รับ: <span className="text-green-600">00000</span> บาท</h3>
            
            <ul className="mt-4 space-y-3">
                {bookings.map((booking) => (
                    <li key={booking.id} className="p-3 border-b border-gray-300 cursor-pointer" onClick={() => setSelectedBookingId(booking.id === selectedBookingId ? null : booking.id)}>
                        <p><strong>วันที่:</strong> {booking.date} | <strong>สนาม:</strong> {booking.court} | <strong>เวลา:</strong> {booking.time}</p>
                        {selectedBookingId === booking.id && (
                            <div className="mt-2 p-4 bg-gray-200 rounded">
                                <h3 className="text-lg font-bold">รายละเอียดการจอง</h3>
                                <p><strong>วันที่:</strong> {booking.date}</p>
                                <p><strong>สนาม:</strong> {booking.court}</p>
                                <p><strong>เวลา:</strong> {booking.time}</p>
                                <p><strong>ชื่อผู้จอง:</strong> {booking.name}</p>
                                <p><strong>ราคา:</strong> {booking.price} บาท</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BadmintonCourtBooking;
