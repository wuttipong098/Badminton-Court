'use client';

import { useState } from 'react';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { Input } from '../components/input';

const initialBookings = [
  { id: 1, court: '1', name: 'นาย Test Test', times: ['08:00 - 09:00', '09:00 - 10:00'], status: '' },
  { id: 2, court: '3', name: 'นาย C', times: [], status: '' },
  { id: 3, court: '4', name: 'นาย D', times: [], status: '' },
  { id: 4, court: '4', name: 'นาย E', times: [], status: '' },
  { id: 5, court: '3', name: 'นาย F', times: [], status: '' },
];

export default function ApproveBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState(initialBookings);

  const handleApprove = (id:number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'approved' } : b));
  };

  const handleReject = (id:number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
  };

  const handleSearch = () => {
    setFilteredBookings(
      bookings.filter(b =>
        b.court.includes(searchTerm) || b.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Approve</h1>
      
      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="สนามที่,ชื่อคนจองสนาม"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 text-black"
        />
        <Button onClick={handleSearch} className="bg-green-500">ค้นหา</Button>
      </div>
      
      {/* Booking List */}
      <Card>
        <CardContent>
          <table className="w-full border-collapse text-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">สนามที่</th>
                <th className="p-2 border">ชื่อคนจองสนาม</th>
                <th className="p-2 border">เวลาจอง</th>
                <th className="p-2 border">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border">
                  <td className="p-2 border text-center">{booking.court}</td>
                  <td className="p-2 border">{booking.name}</td>
                  <td className="p-2 border">
                    {booking.times.length > 0 ? (
                      booking.times.map((time, i) => (
                        <div key={i} className="bg-red-500 text-white p-1 rounded mb-1 inline-block">{time}</div>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <Button onClick={() => handleReject(booking.id)} className="bg-red-500">ปฏิเสธ</Button>
                    <Button onClick={() => handleApprove(booking.id)} className="bg-blue-500">อนุมัติ</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}