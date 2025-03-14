export default function BadmintonShopPage() {
  return (
      <div className="p-6">
          <h1 className="text-2xl font-bold">🏸 ยินดีต้อนรับสู่ร้านแบดมินตัน</h1>
          <p className="mt-2 text-lg">เลือกซื้ออุปกรณ์แบดมินตันคุณภาพสูงในราคาพิเศษ</p>

          {/* ลิงก์ไปยังหน้าต่างๆ */}
          <div className="mt-4 space-y-2">
              <a href="/BadmintonShop/booking" className="block text-blue-500 hover:underline">
                  🔹 จองสนามแบดมินตัน
              </a>
              <a href="/BadmintonShop/history" className="block text-blue-500 hover:underline">
                  🔹 ดูประวัติการจอง
              </a>
              <a href="/BadmintonShop/profile" className="block text-blue-500 hover:underline">
                  🔹 แก้ไขข้อมูลส่วนตัว
              </a>
          </div>
      </div>
  );
}
