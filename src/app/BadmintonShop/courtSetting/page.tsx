'use client';

import { useState } from 'react';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';

export default function BadmintonBooking() {
  const [messages, setMessages] = useState(Array(15).fill('ข้อความแสดงหน้าเว็บ'));
  const [rules, setRules] = useState(Array(15).fill('กรุณาใส่ข้อความ'));

  const [itemsPerPageMessages, setItemsPerPageMessages] = useState(5);
  const [itemsPerPageRules, setItemsPerPageRules] = useState(5);

  const [currentPageMessages, setCurrentPageMessages] = useState(0);
  const [currentPageRules, setCurrentPageRules] = useState(0);

  const totalPagesMessages = Math.ceil(messages.length / itemsPerPageMessages);
  const totalPagesRules = Math.ceil(rules.length / itemsPerPageRules);

  const addMessage = () => setMessages([...messages, 'ข้อความแสดงหน้าเว็บ']);
  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const addRule = () => setRules([...rules, '']);
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-lg shadow-md mx-auto text-black">
      <h1 className="text-2xl font-bold mb-4 text-black">Badminton Court Booking</h1>

      {/* ข้อความแสดงหน้าเว็บ */}
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-lg font-semibold mb-2 text-black">ข้อความหน้าเว็บ</h2>

          {/* ตัวเลือกจำนวนรายการต่อหน้า (สำหรับ ข้อความหน้าเว็บ) */}
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

          {messages.slice(currentPageMessages * itemsPerPageMessages, (currentPageMessages + 1) * itemsPerPageMessages).map((msg, index) => (
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
              <Button variant="destructive" onClick={() => removeMessage(currentPageMessages * itemsPerPageMessages + index)}>ลบ</Button>
            </div>
          ))}
          <Button onClick={addMessage} className="mt-2">เพิ่ม</Button>

          {/* ปุ่มเปลี่ยนหน้า (สำหรับ ข้อความหน้าเว็บ) */}
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
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2 text-black">กติกาในการจอง</h2>

          {/* ตัวเลือกจำนวนรายการต่อหน้า (สำหรับ กติกาการจอง) */}
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

          {rules.slice(currentPageRules * itemsPerPageRules, (currentPageRules + 1) * itemsPerPageRules).map((rule, index) => (
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
              <Button variant="destructive" onClick={() => removeRule(currentPageRules * itemsPerPageRules + index)}>ลบ</Button>
            </div>
          ))}
          <Button onClick={addRule} className="mt-2">เพิ่ม</Button>

          {/* ปุ่มเปลี่ยนหน้า (สำหรับ กติกาการจอง) */}
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
  );
}