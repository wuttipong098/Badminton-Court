'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { fetchStadiumId } from '@/lib/stadiumId';

type SettingResponse = {
  status_code: number;
  status_message: string;
  data: {
    locationMessages: string[];
    bookingRules:     string[];
    courtImages:      string[]; // base64 strings
    slipImages:       string[]; // base64 strings
  };
};

type ImgSrc = string | File

export default function BadmintonBooking() {
  const [rules, setRules] = useState(Array(5).fill(''));
  const [location, setLocation] = useState('');
  const [itemsPerPageRules, setItemsPerPageRules] = useState(5);

  const [currentPageRules, setCurrentPageRules] = useState(0);

  const totalPagesRules = Math.ceil(rules.length / itemsPerPageRules);

  const [courtImages, setCourtImages] = useState<File[]>([]);
  const [slipImages, setSlipImages] = useState<File[]>([]);

  const handleImageUploadCourt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setCourtImages(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleImageUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // ถ้ามีสลิปอยู่แล้ว หยุดและแจ้งเตือน
    if (slipImages.length >= 1) {
      alert('สามารถอัปโหลดสลิปได้เพียง 1 รูป')
      return;
    }

    // เอาแค่ไฟล์แรก
    const file = files[0];
    setSlipImages([file]);
  };
  
  const removeCourtImage = (index: number) => {
    setCourtImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeSlipImage = (index: number) => {
    setSlipImages(prev => prev.filter((_, i) => i !== index));
  };

  const addRule = () => setRules([...rules, '']);
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
  const userId = localStorage.getItem("userID");
  if (!userId) {
    alert("ไม่พบข้อมูลผู้ใช้");
    return;
  }
  let stadiumId: number;
  try {
    stadiumId = await fetchStadiumId(userId);
  } catch (e) {
    console.error(e);
    return alert('โหลดสนามไม่สำเร็จ');
  }

  const courtImagesBase64 = await Promise.all(
    courtImages.map((img) => convertToBase64(img))
  )
  const slipImagesBase64 = await Promise.all(
    slipImages.map((img) => convertToBase64(img))
  )

  const formData = {
    stadiumId,
    userId: parseInt(userId),
    location,
    bookingRules: rules,
    courtImages: courtImagesBase64,
    slipImages: slipImagesBase64,
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
    return Promise.resolve(img)
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(img)   // img ที่นี่ รับประกันแล้วว่าเป็น File
  })
}
async function loadSetting() {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) throw new Error('Missing userID in localStorage');

      // ต้องรู้ stadiumId ก่อน (เรียก fetchStadiumId)
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

      // ได้ data มาแล้ว กำหนดลง state
      setLocation(json.data.locationMessages[0] || '');
      setRules(json.data.bookingRules);
      setCourtImages(json.data.courtImages);
      setSlipImages(json.data.slipImages);
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
        {/* ข้อความแสดงหน้าเว็บ */}
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
        {/* กติกาในการจอง */}
        <Card className="bg-white border">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-black">📌 กติกาในการจอง</h2>

            {/* ตัวเลือกจำนวนรายการต่อหน้า */}
            <div className="mb-4 flex gap-2 text-black">
              <span>แสดง:</span>
              {[5, 10].map((num) => (
                <Button
                  key={num}
                  onClick={() => setItemsPerPageRules(num)}
                  className={`px-3 py-1 ${itemsPerPageRules === num ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {num}
                </Button>
              ))}
            </div>

            {rules
              .slice(currentPageRules * itemsPerPageRules, (currentPageRules + 1) * itemsPerPageRules)
              .map((rule, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[currentPageRules * itemsPerPageRules + index] = e.target.value;
                      setRules(newRules);
                    }}
                    className="flex-1 p-2 border rounded text-black"
                    placeholder="กรุณาใส่ข้อความ"
                  />
                  <Button variant="destructive" onClick={() => removeRule(currentPageRules * itemsPerPageRules + index)}>
                    ลบ
                  </Button>
                </div>
              ))}
            <Button onClick={addRule} className="mt-2">เพิ่ม</Button>

            <div className="mt-4 flex justify-center gap-2 text-black">
              <Button onClick={() => setCurrentPageRules((prev) => Math.max(prev - 1, 0))} disabled={currentPageRules === 0}>
                ก่อนหน้า
              </Button>
              <span>หน้า {currentPageRules + 1} / {totalPagesRules}</span>
              <Button onClick={() => setCurrentPageRules((prev) => Math.min(prev + 1, totalPagesRules - 1))} disabled={currentPageRules === totalPagesRules - 1}>
                ถัดไป
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* รูปภาพสนามแบดมินตัน */}
      <Card className="bg-white border">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">🏸 รูปภาพสนามแบดมินตัน</h2>

          {/* ปุ่มอัปโหลด */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file" accept="image/*" multiple
              onChange={handleImageUploadCourt}
              className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded"
            />
            <span className="text-sm text-gray-500">เลือกรูปได้หลายไฟล์</span>
          </div>

          {/* แสดงรูป */}
          {courtImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courtImages.map((img, i) => {
                // ถ้าเป็น string (base64) ก็ใช้ตรงๆ, ถ้าเป็น File ก็สร้าง URL
                const src = typeof img === 'string'
                  ? img
                  : URL.createObjectURL(img)
                return (
                  <div key={i} className="relative rounded overflow-hidden shadow">
                    <img
                      src={src}
                      alt={`Court ${i+1}`}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeCourtImage(i)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                    >
                      ลบ
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">ยังไม่มีการเลือกรูป</p>
          )}
        </CardContent>
      </Card>

      {/* รูปภาพสลิป */}
      <Card className="bg-white border">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">🧾 รูปภาพสลิป</h2>

          <div className="flex items-center gap-4 mb-4">
            <input
              type="file" accept="image/*" multiple
              onChange={handleImageUploadSlip}
              className="file:bg-green-500 file:text-white file:px-4 file:py-2 file:rounded"
            />
            <span className="text-sm text-gray-500">เลือกรูปได้หลายไฟล์</span>
          </div>

          {slipImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slipImages.map((img, i) => {
                const src = typeof img === 'string'
                  ? img
                  : URL.createObjectURL(img)
                return (
                  <div key={i} className="relative rounded overflow-hidden shadow">
                    <img
                      src={src}
                      alt={`Slip ${i+1}`}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeSlipImage(i)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                    >
                      ลบ
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">ยังไม่มีการเลือกรูปสลิป</p>
          )}
        </CardContent>
      </Card>
      {/* ปุ่มบันทึก */}
      <button 
      onClick={handleSave}
      className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 mt-6">
        💾 บันทึกการตั้งค่า
      </button>
    </div>
  );
}