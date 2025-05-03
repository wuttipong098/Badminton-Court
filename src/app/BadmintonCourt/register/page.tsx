"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.png";
import logouser from "@/public/user.png"
import logoowner from "@/public/owner.png"
import { EyeIcon, EyeOffIcon } from "lucide-react";

const RegisterPage = () => {
    const router = useRouter();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }
        setPasswordError(false);
        router.push("/BadmintonCourt/login");
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-300">
            <div className="flex w-[700px] h-[450px] bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="w-3/5 bg-[#1F9378] flex flex-col justify-center items-center p-6">
                    <h1 className="text-white text-2xl mb-5">สร้างบัญชีของคุณ</h1>
                    <form className="w-full px-8" onSubmit={handleSubmit}>
                        <div className="mb-3 flex gap-3">
                            <input
                                type="text"
                                placeholder="ชื่อ"
                                className="w-1/2 p-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="นามสกุล"
                                className="w-1/2 p-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="อีเมล"
                                className="w-full p-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* รหัสผ่าน */}
                        <div className="mb-3 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="รหัสผ่าน"
                                className="w-full p-2 pr-10 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password.length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                                </button>
                            )}
                        </div>

                        {/* ยืนยันรหัสผ่าน */}
                        <div className="mb-3 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="ยืนยันรหัสผ่าน"
                                className={`w-full p-2 pr-10 bg-gray-200 text-gray-800 border ${passwordError ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500`}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setPasswordError(false);
                                }}
                            />
                            {confirmPassword.length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                                </button>
                            )}
                            {passwordError && (
                                <p className="text-white text-sm font-bold mt-1" style={{ textShadow: "2px 2px 0px #b91c1c, -2px -2px 0px #b91c1c, 2px -2px 0px #b91c1c, -2px 2px 0px #b91c1c" }}>
                                    รหัสผ่านไม่ตรงกัน
                                </p>
                            )}
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="เบอร์"
                                className="w-full p-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={phonenumber}
                                onChange={(e) => setPhonenumber(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-[#3498db] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#2980b9] transition cursor-pointer"
                        >
                            ยืนยัน
                        </button>
                    </form>
                </div>

                {/* รูปภาพย้ายไปขวา */}
                <div className="w-2/5 flex items-center justify-center bg-white">
                    <Image src={logo} alt="Badminton Court Logo" width={150} height={150} />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
