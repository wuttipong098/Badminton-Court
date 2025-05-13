"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.png";
import logouser from "@/public/user.png";
import logoowner from "@/public/owner.png";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const RegisterPage = () => {
    const router = useRouter();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [province, setProvince] = useState(""); // New state for Province
    const [district, setDistrict] = useState(""); // New state for District
    const [courtLocation, setCourtLocation] = useState(""); // New state for Court Location
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [role, setRole] = useState<"user" | "owner" | null>(null);

    const handleRoleSelect = (selectedRole: "user" | "owner") => {
        if (selectedRole === "user") {
            router.push("/BadmintonCourt/register"); 
        } else {
            setRole(selectedRole); 
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError(true);
            MySwal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: 'รหัสผ่านไม่ตรงกัน',
                confirmButtonColor: '#d33',
            });
            return;
        }
        if (!role) {
            MySwal.fire({
                icon: 'warning',
                title: 'กรุณาเลือกบทบาท',
                text: 'กรุณาเลือกบทบาท (ผู้เล่น)',
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        setPasswordError(false);

        // Prepare data for API submission
        const formData = {
            FirstName: firstname,
            LastName: lastname,
            UserName: username,
            Password: password,
            PhoneNumber: phonenumber,
            Province: province, // Include province
            District: district, // Include district
            CourtLocation: courtLocation, // Include court location
            RoleName: role,
        };

        try {
            const response = await fetch("/api/BS/registerBS", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorText = await response.text(); // Try to fetch plain text to understand error
                MySwal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: errorText || 'เกิดข้อผิดพลาดในการสร้างบัญชี',
                    confirmButtonColor: '#d33',
                });
                return;
            }

            // Safely parse JSON if content is available
            const result = await response.json();
            
            if (result.status_code === 200) {
                await MySwal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'สร้างบัญชีสำเร็จ',
                    confirmButtonColor: '#3085d6',
                });
                router.push("/BadmintonCourt/login");
            } else {
                MySwal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: result.status_message || 'เกิดข้อผิดพลาดในการสร้างบัญชี',
                    confirmButtonColor: '#d33',
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            MySwal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
                confirmButtonColor: '#d33',
            });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-300">
            <div className="flex w-[700px] h-[700px] bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="w-3/5 bg-[#1F9378] flex flex-col justify-center items-center p-6 rounded-lg">
                    <h1 className="text-white text-2xl mb-5">สร้างบัญชีของคุณ</h1>
                    <form className="w-full px-8" onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex flex-col items-center bg-white rounded-lg p-2 cursor-pointer ${role === "user" ? "border-4 border-yellow-400" : ""}`}
                                    onClick={() => handleRoleSelect("user")}
                                >
                                    <Image src={logouser} alt="User Icon" width={50} height={50} />
                                </div>
                                <p className="text-white text-[10px] mt-1">ผู้เล่น</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex flex-col items-center bg-white rounded-lg p-2 cursor-pointer ${role === "owner" ? "border-4 border-yellow-400" : ""}`}
                                    onClick={() => handleRoleSelect("owner")}
                                >
                                    <Image src={logoowner} alt="Owner Icon" width={45} height={30} />
                                </div>
                                <p className="text-white text-[10px] mt-1">เจ้าของสนาม</p>
                            </div>
                        </div>
                        <div className="mb-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="ชื่อ"
                                className="w-1/2 p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="นามสกุล"
                                className="w-1/2 p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="อีเมล"
                                className="w-full p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-2 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="รหัสผ่าน"
                                className="w-full p-1.5 pr-8 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password.length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-2.5 text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon size={12} /> : <EyeIcon size={12} />}
                                </button>
                            )}
                        </div>
                        <div className="mb-2 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="ยืนยันรหัสผ่าน"
                                className={`w-full p-1.5 pr-8 bg-gray-200 text-gray-800 border ${passwordError ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm`}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setPasswordError(false);
                                }}
                            />
                            {confirmPassword.length > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-2.5 text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={12} /> : <EyeIcon size={12} />}
                                </button>
                            )}
                            {passwordError && (
                                <p
                                    className="text-white text-xs font-bold mt-1"
                                    style={{
                                        textShadow:
                                            "2px 2px 0px #b91c1c, -2px -2px 0px #b91c1c, 2px -2px 0px #b91c1c, -2px 2px 0px #b91c1c",
                                    }}
                                >
                                    รหัสผ่านไม่ตรงกัน
                                </p>
                            )}
                        </div>
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="เบอร์"
                                className="w-full p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={phonenumber}
                                onChange={(e) => setPhonenumber(e.target.value)}
                            />
                        </div>
                        <div className="mb-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="จังหวัด"
                                className="w-1/2 p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="อำเภอ"
                                className="w-1/2 p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="ที่อยู่ของสนาม"
                                className="w-full p-1.5 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                value={courtLocation}
                                onChange={(e) => setCourtLocation(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-1.5 bg-[#3498db] text-white text-base font-semibold rounded-lg shadow-md hover:bg-[#2980b9] transition cursor-pointer"
                        >
                            ยืนยัน
                        </button>
                    </form>
                </div>
                <div className="w-2/5 flex items-center justify-center bg-white">
                    <Image src={logo} alt="Badminton Court Logo" width={150} height={150} />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;