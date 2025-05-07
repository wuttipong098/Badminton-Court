'use client';

import { useState } from 'react';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';

export default function BadmintonBooking() {
  const [messages, setMessages] = useState(Array(5).fill('ข้อความแสดงหน้าเว็บ'));
  const [rules, setRules] = useState(Array(5).fill('กรุณาใส่ข้อความ'));

  const [itemsPerPageMessages, setItemsPerPageMessages] = useState(5);
  const [itemsPerPageRules, setItemsPerPageRules] = useState(5);

  const [currentPageMessages, setCurrentPageMessages] = useState(0);
  const [currentPageRules, setCurrentPageRules] = useState(0);

  const totalPagesMessages = Math.ceil(messages.length / itemsPerPageMessages);
  const totalPagesRules = Math.ceil(rules.length / itemsPerPageRules);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const addMessage = () => setMessages([...messages, 'ข้อความแสดงหน้าเว็บ']);
  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const addRule = () => setRules([...rules, '']);
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-700">Badminton Court Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ข้อความแสดงหน้าเว็บ */}
        <Card className="bg-white border">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-black">📢 ข้อความหน้าเว็บ</h2>

            {/* ตัวเลือกจำนวนรายการต่อหน้า */}
            <div className="mb-4 flex gap-2 text-black">
              <span>แสดง:</span>
              {[5, 10].map((num) => (
                <Button
                  key={num}
                  onClick={() => setItemsPerPageMessages(num)}
                  className={`px-3 py-1 ${itemsPerPageMessages === num ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {num}
                </Button>
              ))}
            </div>

            {messages
              .slice(currentPageMessages * itemsPerPageMessages, (currentPageMessages + 1) * itemsPerPageMessages)
              .map((msg, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => {
                      const newMessages = [...messages];
                      newMessages[currentPageMessages * itemsPerPageMessages + index] = e.target.value;
                      setMessages(newMessages);
                    }}
                    className="flex-1 p-2 border rounded text-black"
                  />
                  <Button variant="destructive" onClick={() => removeMessage(currentPageMessages * itemsPerPageMessages + index)}>
                    ลบ
                  </Button>
                </div>
              ))}
            <Button onClick={addMessage} className="mt-2">เพิ่ม</Button>

            <div className="mt-4 flex justify-center gap-2 text-black">
              <Button onClick={() => setCurrentPageMessages((prev) => Math.max(prev - 1, 0))} disabled={currentPageMessages === 0}>
                ก่อนหน้า
              </Button>
              <span>หน้า {currentPageMessages + 1} / {totalPagesMessages}</span>
              <Button onClick={() => setCurrentPageMessages((prev) => Math.min(prev + 1, totalPagesMessages - 1))} disabled={currentPageMessages === totalPagesMessages - 1}>
                ถัดไป
              </Button>
            </div>
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
      <Card className="bg-white border mt-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-black">🏸 รูปภาพสนามแบดมินตัน</h2>

          {/* ปุ่มอัปโหลดรูป */}
          <div className="flex items-center gap-4 mb-6">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded file:border-0 text-black"
            />
            <span className="text-sm text-gray-500">เลือกรูปได้หลายไฟล์</span>
          </div>

          {/* แสดงรูปภาพที่เลือก */}
          {images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group overflow-hidden rounded shadow hover:shadow-lg transition-shadow duration-200">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`รูปที่ ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded shadow"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">ยังไม่มีการเลือกรูป</p>
          )}
        </CardContent>
      </Card>
      {/* ปุ่มบันทึก */}
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 mt-6">
          💾 บันทึกการตั้งค่า
      </button>
    </div>
  );
}
