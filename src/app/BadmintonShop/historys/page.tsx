'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
  id: number;
  date: string;
  court: string;
  time: string;
  name: string;
  price: number;
}

const BadmintonCourtBooking = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [court, setCourt] = useState('all');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const userId = localStorage.getItem('userID');
    if (!userId) {
      toast.error('User not logged in or stadiumId not set');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/BS/getBookingHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, court, userId }),
      });

      const json = await res.json();
      console.log('API response:', json);

      if (json.success) {
        setBookings(json.data.bookings);
        setTotalRevenue(json.data.totalRevenue);
        toast.success('ดึงข้อมูลการจองสำเร็จ!', { autoClose: 1000 });
      } else {
        toast.error(json.message || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error(err.message || 'An error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filterBookings = () => {
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto text-black">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-black">Badminton Court Booking</h2>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <input
          type="date"
          className="p-2 border rounded text-black"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
        />
        <input
          type="date"
          className="p-2 border rounded text-black"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={loading}
        />
        <select
          className="p-2 border rounded text-black"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          disabled={loading}
        >
          <option value="all">ทุกสนาม</option>
          <option value="1">สนามที่ 1</option>
          <option value="2">สนามที่ 2</option>
          <option value="3">สนามที่ 3</option>
        </select>
        <button
          onClick={filterBookings}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>
      </div>

      <h3 className="text-lg font-semibold">
        สรุปรายได้ที่ได้รับ: <span className="text-green-600">{totalRevenue.toLocaleString()}</span> บาท
      </h3>

      <ul className="mt-4 space-y-3">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="p-3 border-b border-gray-300 cursor-pointer"
            onClick={() => setSelectedBookingId(booking.id === selectedBookingId ? null : booking.id)}
          >
            <p>
              <strong>วันที่:</strong> {booking.date} | <strong>สนาม:</strong> {booking.court} |{' '}
              <strong>เวลา:</strong> {booking.time} | <strong>ชื่อผู้จอง:</strong> {booking.name}
            </p>
            {selectedBookingId === booking.id && (
              <div className="mt-2 p-4 bg-gray-200 rounded">
                <h3 className="text-lg font-bold">รายละเอียดการจอง</h3>
                <p><strong>วันที่:</strong> {booking.date}</p>
                <p><strong>คอร์ด:</strong> {booking.court}</p>
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