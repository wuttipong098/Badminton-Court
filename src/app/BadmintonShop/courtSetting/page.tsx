'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/card';
import { fetchStadiumId } from '@/lib/stadiumId';

type SettingResponse = {
  status_code: number;
  status_message: string;
  data: {
    locationMessages: string[];
    bookingRules: string[];
    courtImages: string[];
    slipImages: string[];
    payment_time: number[];
    price: number[];
    closeDates: string[]; // เปลี่ยนเป็น array
  };
};

type ImgSrc = string | File;

export default function BadmintonBooking() {
  const [location, setLocation] = useState('');
  const [courtImages, setCourtImages] = useState<File[]>([]);
  const [slipImages, setSlipImages] = useState<File[]>([]);
  const [paymentTime, setPaymentTime] = useState(0);
  const [price, setPrice] = useState(0);
  const [closeDates, setCloseDates] = useState<string[]>([]); // เปลี่ยนเป็น array
  const [newCloseDate, setNewCloseDate] = useState(''); // สำหรับ input วันที่ใหม่

  const handleImageUploadCourt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setCourtImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleImageUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (slipImages.length >= 1) {
      alert('สามารถอัปโหลดสลิปได้เพียง 1 รูป');
      return;
    }
    const file = e.target.files[0];
    setSlipImages([file]);
  };

  const removeCourtImage = (index: number) => {
    setCourtImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSlipImage = (index: number) => {
    setSlipImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addCloseDate = () => {
    if (!newCloseDate) return;
    const date = new Date(newCloseDate);
    if (date < new Date()) {
      alert('วันที่หยุดต้องไม่เป็นวันในอดีต');
      return;
    }
    if (!closeDates.includes(newCloseDate)) {
      setCloseDates((prev) => [...prev, newCloseDate]);
      setNewCloseDate('');
    }
  };

  const removeCloseDate = (index: number) => {
    setCloseDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('userID');
    if (!userId) {
      alert('ไม่พบข้อมูลผู้ใช้');
      return;
    }
    let stadiumId: number;
    try {
      stadiumId = await fetchStadiumId(userId);
    } catch (e) {
      console.error(e);
      return alert('โหลดสนามไม่สำเร็จ');
    }

    const courtImagesBase64 = await Promise.all(courtImages.map((img) => convertToBase64(img)));
    const slipImagesBase64 = await Promise.all(slipImages.map((img) => convertToBase64(img)));

    const formData = {
      stadiumId,
      userId: parseInt(userId),
      location,
      price,
      payment_time: paymentTime,
      courtImages: courtImagesBase64,
      slipImages: slipImagesBase64,
      closeDates, // ส่งเป็น array
    };

    console.log('PAYLOAD:', formData);

    const res = await fetch('/api/BS/saveSetting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    alert(result.status_message);
  };

  const convertToBase64 = (img: ImgSrc): Promise<string> => {
    if (typeof img === 'string') {
      return Promise.resolve(img);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(img);
    });
  };

  async function loadSetting() {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) throw new Error('Missing userID in localStorage');
      const stadiumId = await fetchStadiumId(userId);
      const res = await fetch('/api/BS/getSetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), stadiumId }),
      });
      const json: SettingResponse = await res.json();
      if (json.status_code !== 200) {
        console.error('loadSetting error', json.status_message);
        return;
      }
      setLocation(json.data.locationMessages[0] || '');
      setPaymentTime(json.data.payment_time[0] || 0);
      setPrice(json.data.price[0] || 0);
      setCourtImages(json.data.courtImages);
      setSlipImages(json.data.slipImages);
      setCloseDates(json.data.closeDates || []);
    } catch (err) {
      console.error('fetch setting failed:', err);
    }
  }

  useEffect(() => {
    loadSetting();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-700">Badminton Court Booking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-black">📢 สถานที่</h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder="กรุณาใส่สถานที่"
            />
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-black">📌 กติกาในการจอง</h2>
            <fieldset className="mb-6 border border-gray-300 bg-white rounded-lg p-4">
              <legend className="text-lg font-semibold text-black px-2">📅 วันที่หยุดสนาม</legend>
              <label className="block text-black font-medium">วันที่สนามหยุด (ไม่เปิดให้จอง):</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="date"
                  className="border p-2 flex-1 text-black bg-white"
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                />
                <button
                  onClick={addCloseDate}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  เพิ่ม
                </button>
              </div>
              {closeDates.length > 0 && (
                <ul className="mt-2">
                  {closeDates.map((date, index) => (
                    <li key={index} className="flex justify-between items-center text-black">
                      <span>{date}</span>
                      <button
                        onClick={() => removeCloseDate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ลบ
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
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
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white border">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">🏸 รูปภาพสนามแบดมินตัน</h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUploadCourt}
              className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded"
            />
            <span className="text-sm text-gray-500">เลือกรูปได้หลายไฟล์</span>
          </div>
          {courtImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courtImages.map((img, i) => {
                const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                return (
                  <div key={i} className="relative rounded overflow-hidden shadow">
                    <img src={src} alt={`Court ${i + 1}`} className="w-full h-48 object-cover" />
                    <button
                      onClick={() => removeCourtImage(i)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                    >
                      ลบ
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">ยังไม่มีการเลือกรูป</p>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white border">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">🧾 รูปภาพสลิป</h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUploadSlip}
              className="file:bg-green-500 file:text-white file:px-4 file:py-2 file:rounded"
            />
            <span className="text-sm text-gray-500">เลือกรูปได้หลายไฟล์</span>
          </div>
          {slipImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slipImages.map((img, i) => {
                const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                return (
                  <div key={i} className="relative rounded overflow-hidden shadow">
                    <img src={src} alt={`Slip ${i + 1}`} className="w-full h-48 object-cover" />
                    <button
                      onClick={() => removeSlipImage(i)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                    >
                      ลบ
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">ยังไม่มีการเลือกรูปสลิป</p>
          )}
        </CardContent>
      </Card>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 mt-6"
      >
        💾 บันทึกการตั้งค่า
      </button>
    </div>
  );
}