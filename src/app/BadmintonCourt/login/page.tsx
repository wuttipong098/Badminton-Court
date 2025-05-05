"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import logo from "@/public/logo.png";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErrorMessage(""); 

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserName: username, Password: password }),
      });

      const result = await response.json();

      if (result.status_code === 200) {

        router.push(result.redirectPath);
      } else {

        setErrorMessage(result.status_message);
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  const handleRegisterClick = () => {
    router.push("/BadmintonCourt/register");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-300">
      <div className="flex w-[700px] h-[400px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Panel */}
        <div className="w-2/5 flex items-center justify-center bg-white">
          <Image src={logo} alt="Badminton Court Logo" width={150} height={150} />
        </div>
        {/* Right Panel */}
        <div className="w-3/5 bg-[#1F9378] flex flex-col justify-center items-center p-6">
          <h1 className="text-white text-2xl mb-5">ลงชื่อเข้าใช้งาน</h1>
          <form className="w-full px-8" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                className="w-full p-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* ช่องป้อนรหัสผ่าน + ปุ่มเปิดตา */}
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                className="w-full p-2 pr-10 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* ปุ่มเปิด-ปิดตา (แสดงเฉพาะเมื่อมีการกรอกรหัสผ่าน) */}
              {password.length > 0 && (
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              )}
            </div>

            {/* แสดงข้อความข้อผิดพลาด */}
            {errorMessage && (
              <div className="mb-3 text-red-200 text-sm">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#3498db] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#2980b9] transition cursor-pointer"
            >
              ยืนยัน
            </button>
          </form>

          <div
            onClick={handleRegisterClick}
            className="mt-3 text-white font-semibold text-lg drop-shadow-[1px_1px_0px_rgba(255,0,0,1)] cursor-pointer hover:scale-105 transition"
          >
            สมัครบัญชีผู้ใช้งาน
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;