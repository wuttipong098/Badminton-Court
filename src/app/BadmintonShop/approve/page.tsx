'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
  id: number;
  court: string;
  name: string;
  phone: string;
  times: string[];
  status: string;
  statusId: number;
  bookingDate: string;
  createdDate: string;
  paymentStatus: string;
  slipUrl: string;
}

export default function ApproveBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchBookings = async () => {
    try {
      console.log('Fetching from /api/BS/getBookingApprovals...');
      const res = await fetch('/api/BS/getBookingApprovals', {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', res.status);
      console.log('Content-Type:', res.headers.get('content-type'));

      if (res.status === 404) {
        setError('API endpoint not found. Please check if /api/BS/getBookingApprovals exists.');
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Unexpected response:', text);
        setDebugInfo(`Received non-JSON response: ${text.substring(0, 200)}...`);
        throw new Error('Server did not return JSON');
      }

      const json = await res.json();
      console.log('API response:', json);

      if (json.success) {
        setBookings(json.data.bookings);
        setFilteredBookings(json.data.bookings);
        setError(null);
      } else {
        setError(json.message || 'Failed to fetch bookings');
        console.error('Failed to fetch bookings:', json.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching bookings');
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      console.log('Approving booking:', id);
      const res = await fetch('/api/BS/updateBookingStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      });
      const json = await res.json();
      console.log('Update status response:', json);

      if (json.success) {
        setBookings(bookings.map(b => (b.id === id ? { ...b, status: 'approved' } : b)));
        setFilteredBookings(filteredBookings.map(b => (b.id === id ? { ...b, status: 'approved' } : b)));
        toast.success('อนุมัติสำเร็จ!', { autoClose: 1000 });
        setTimeout(() => fetchBookings(), 1000); // เรียก fetchBookings แทน router.refresh()
      } else {
        setError(json.message || 'Failed to approve booking');
        toast.error(json.message || 'Failed to approve booking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while approving');
      console.error('Approve error:', err);
      toast.error(err.message || 'An error occurred while approving');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(true);
    try {
      console.log('Rejecting booking:', id);
      const res = await fetch('/api/BS/updateBookingStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      const json = await res.json();
      console.log('Update status response:', json);

      if (json.success) {
        setBookings(bookings.map(b => (b.id === id ? { ...b, status: 'rejected' } : b)));
        setFilteredBookings(filteredBookings.map(b => (b.id === id ? { ...b, status: 'rejected' } : b)));
        toast.success('ปฏิเสธสำเร็จ!', { autoClose: 1000 });
        setTimeout(() => fetchBookings(), 1000); // เรียก fetchBookings แทน router.refresh()
      } else {
        setError(json.message || 'Failed to reject booking');
        toast.error(json.message || 'Failed to reject booking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while rejecting');
      console.error('Reject error:', err);
      toast.error(err.message || 'An error occurred while rejecting');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = (slipBase64: string) => {
    if (slipBase64) {
      setSelectedSlip(slipBase64);
      setIsPopupOpen(true);
    } else {
      toast.warn('ไม่มีสลิปการโอนเงิน');
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedSlip(null);
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-black">Approve</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {debugInfo && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
          <strong>Debug Info:</strong> {debugInfo}
        </div>
      )}

      <Card>
        <CardContent>
          <table className="w-full border-collapse text-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">สนามที่</th>
                <th className="p-2 border">ชื่อคนจอง</th>
                <th className="p-2 border">เบอร์โทร</th>
                <th className="p-2 border">เวลาจอง</th>
                <th className="p-2 border">วันที่ที่ทำการจอง</th>
                <th className="p-2 border">สถานะจ่ายเงิน</th>
                <th className="p-2 border">ดูสลิป</th>
                <th className="p-2 border">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border">
                  <td className="p-2 border text-center">{booking.court}</td>
                  <td className="p-2 border">{booking.name}</td>
                  <td className="p-2 border text-center">{booking.phone}</td>
                  <td className="p-2 border">
                    {booking.times.length > 0 ? (
                      booking.times.map((time, i) => (
                        <div key={i} className="bg-red-500 text-white p-1 rounded mb-1 inline-block">
                          {time}
                        </div>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="p-2 border text-center">{booking.createdDate}</td>
                  <td className="p-2 border text-center">
                    {booking.paymentStatus === 'paid' ? (
                      <span className="text-green-600 font-semibold">จ่ายแล้ว</span>
                    ) : (
                      <span className="text-red-600 font-semibold">ยังไม่จ่าย</span>
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {booking.slipUrl ? (
                      <Button
                        onClick={() => handleViewSlip(booking.slipUrl)}
                        className="bg-purple-500"
                        disabled={loading}
                      >
                        ดูสลิป
                      </Button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <Button
                      onClick={() => handleApprove(booking.id)}
                      className="bg-blue-500"
                      disabled={loading}
                    >
                      {loading ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                    </Button>
                    <Button
                      onClick={() => handleReject(booking.id)}
                      className="bg-red-500"
                      disabled={loading}
                    >
                      {loading ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isPopupOpen && selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">สลิปการโอนเงิน</h2>
              <button onClick={closePopup} className="text-red-500 font-bold">
                X
              </button>
            </div>
            <img src={selectedSlip} alt="สลิปการโอนเงิน" className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}