"use client";

   import styles from '@/styles/account.module.css';
   import Image from "next/image";
   import ball from "@/public/ball.png";
   import accout from "@/public/account.png";
   import { FaUser, FaEnvelope, FaPhone, FaEdit } from 'react-icons/fa';
   import { useState, useEffect } from 'react';
   import Swal from 'sweetalert2';
   import withReactContent from 'sweetalert2-react-content';

   const MySwal = withReactContent(Swal);

   const AccountPage = () => {
       const [imageFile, setImageFile] = useState<string | null>(null);
       const [isImageChanged, setIsImageChanged] = useState(false);
       const [userID, setUserID] = useState<number | null>(null);
       const [firstName, setFirstName] = useState("");
       const [lastName, setLastName] = useState("");
       const [phone, setPhone] = useState("");
       const [email, setEmail] = useState("");
       const [isEditingName, setIsEditingName] = useState(false);
       const [isEditingPhone, setIsEditingPhone] = useState(false);
       const [initialFirstName, setInitialFirstName] = useState("");
       const [initialLastName, setInitialLastName] = useState("");
       const [initialPhone, setInitialPhone] = useState("");
       const [initialImageFile, setInitialImageFile] = useState<string | null>(null);

       useEffect(() => {
           if (typeof window !== 'undefined') {
               const storedUserID = localStorage.getItem('userID');
               if (storedUserID) {
                   setUserID(parseInt(storedUserID));
               }
           }
       }, []);

       useEffect(() => {
           const fetchUserData = async () => {
               if (userID) {
                   try {
                       const response = await fetch('/api/account', {
                           method: 'POST',
                           headers: {
                               'Content-Type': 'application/json',
                           },
                           body: JSON.stringify({ UserID: userID }),
                       });
                       const result = await response.json();
                       if (result.status_code === 200 && result.data.length > 0) {
                           const user = result.data[0];
                           setFirstName(user.FirstName || "");
                           setLastName(user.LastName || "");
                           setPhone(user.PhoneNumber ? `0${user.PhoneNumber}` : ""); // ✅ เพิ่ม 0 นำหน้า
                           setEmail(user.UserName || "");
                           setImageFile(user.Profile || null);
                           setInitialFirstName(user.FirstName || "");
                           setInitialLastName(user.LastName || "");
                           setInitialPhone(user.PhoneNumber ? `0${user.PhoneNumber}` : ""); // ✅ เพิ่ม 0 นำหน้า
                           setInitialImageFile(user.Profile || null);
                       }
                   } catch (error) {
                       console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
                       MySwal.fire({
                           icon: 'error',
                           title: 'ข้อผิดพลาด',
                           text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
                       });
                   }
               }
           };

           fetchUserData();
       }, [userID]);

       const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
           const file = event.target.files?.[0];
           if (file) {
               const reader = new FileReader();
               reader.onload = () => {
                   if (reader.result) {
                       setImageFile(reader.result.toString().split(',')[1]);
                       setIsImageChanged(true);
                   }
               };
               reader.readAsDataURL(file);
           }
       };

       const handleConfirm = async () => {
           if (!firstName || !lastName || !phone || !email) {
               MySwal.fire({
                   icon: 'error',
                   title: 'ข้อมูลไม่ครบถ้วน',
                   text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
               });
               return;
           }

           const phoneNumber = parseInt(phone);
           if (isNaN(phoneNumber) || phoneNumber <= 0) {
               MySwal.fire({
                   icon: 'error',
                   title: 'ข้อมูลไม่ถูกต้อง',
                   text: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง',
               });
               return;
           }

           const result = await MySwal.fire({
               title: 'ยืนยันการแก้ไข',
               text: 'จะทำการแก้ไขข้อมูลหรือไม่?',
               icon: 'question',
               showCancelButton: true,
               confirmButtonText: 'ใช่',
               cancelButtonText: 'ไม่',
               confirmButtonColor: '#379DD6',
               cancelButtonColor: '#d33',
           });

           if (result.isConfirmed && userID) {
               try {
                   const updateData = {
                       UserID: userID,
                       FirstName: firstName,
                       LastName: lastName,
                       PhoneNumber: phoneNumber,
                       UserName: email,
                       Profile: imageFile,
                   };

                   const response = await fetch('/api/account', {
                       method: 'PATCH',
                       headers: {
                           'Content-Type': 'application/json',
                       },
                       body: JSON.stringify(updateData),
                   });

                   const responseData = await response.json();
                   if (responseData.status_code === 200) {
                       await MySwal.fire({
                           icon: 'success',
                           title: 'สำเร็จ',
                           text: 'แก้ไขข้อมูลสำเร็จแล้ว',
                       });
                       localStorage.setItem('firstName', firstName);
                       localStorage.setItem('lastName', lastName);
                       localStorage.setItem('phone', phone);
                       setIsEditingName(false);
                       setIsEditingPhone(false);
                       setIsImageChanged(false);
                       setInitialFirstName(firstName);
                       setInitialLastName(lastName);
                       setInitialPhone(phone);
                       setInitialImageFile(imageFile);
                   } else {
                       await MySwal.fire({
                           icon: 'error',
                           title: 'ข้อผิดพลาด',
                           text: `ไม่สามารถอัปเดตข้อมูลผู้ใช้: ${responseData.status_message}`,
                       });
                       console.error("ไม่สามารถอัปเดตข้อมูลผู้ใช้:", responseData.status_message);
                   }
               } catch (error) {
                   await MySwal.fire({
                       icon: 'error',
                       title: 'ข้อผิดพลาด',
                       text: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้',
                   });
                   console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', error);
               }
           }
       };

       const handleCancel = () => {
           setFirstName(initialFirstName);
           setLastName(initialLastName);
           setPhone(initialPhone);
           setImageFile(initialImageFile);
           setIsEditingName(false);
           setIsEditingPhone(false);
           setIsImageChanged(false);
       };

       return (
           <div className={styles.container}>
               <div className="w-full h-35 bg-[#1F9378]">
                   <div className={styles.header}>
                       <h1 className={styles.h1}>Badminton</h1>
                       <h2 className={styles.h2}>CourtBooking</h2>
                       <div className={styles.ball}>
                           <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
                       </div>
                   </div>
               </div>

               <div className="flex flex-col items-center mt-10 px-5">
                   <div className="mb-6 relative">
                       {imageFile ? (
                           <Image
                               src={`data:image/jpeg;base64,${imageFile}`}
                               alt="รูปโปรไฟล์"
                               width={120}
                               height={120}
                               className="rounded-lg border-4 border-white shadow-lg"
                           />
                       ) : (
                           <Image
                               src={accout}
                               alt="รูปโปรไฟล์เริ่มต้น"
                               width={120}
                               height={120}
                               className="rounded-lg border-4 border-white shadow-lg"
                           />
                       )}
                       <input
                           type="file"
                           accept="image/*"
                           onChange={handleFileChange}
                           className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                   </div>

                   <div className="w-full max-w-md space-y-4">
                       <div className="flex items-center bg-white p-3 rounded-lg shadow-md">
                           <FaUser className="text-gray-600 mr-3" size={24} />
                           <span className="text-gray-800 font-medium">{userID || "00001"}</span>
                       </div>
                       <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                           <div className="flex items-center">
                               <FaEnvelope className="text-gray-600 mr-3" size={24} />
                               <span className="text-gray-800 font-medium">{email || "Acenpwk@gmail.com"}</span>
                           </div>
                       </div>
                       <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                           <div className="flex items-center w-full">
                               <FaUser className="text-gray-600 mr-3" size={24} />
                               {isEditingName ? (
                                   <div className="flex items-center space-x-2 flex-1">
                                       <input
                                           type="text"
                                           value={firstName}
                                           onChange={(e) => setFirstName(e.target.value)}
                                           className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                           placeholder="ชื่อ"
                                       />
                                       <input
                                           type="text"
                                           value={lastName}
                                           onChange={(e) => setLastName(e.target.value)}
                                           className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                           placeholder="นามสกุล"
                                       />
                                   </div>
                               ) : (
                                   <span className="text-gray-800 font-medium">
                                       {firstName} {lastName}
                                   </span>
                               )}
                           </div>
                           <FaEdit 
                               className="text-gray-600 cursor-pointer ml-3" 
                               size={20} 
                               onClick={() => setIsEditingName(!isEditingName)}
                           />
                       </div>
                       <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md">
                           <div className="flex items-center w-full">
                               <FaPhone className="text-gray-600 mr-3" size={24} />
                               {isEditingPhone ? (
                                   <input
                                       type="text"
                                       value={phone}
                                       onChange={(e) => setPhone(e.target.value)}
                                       className="flex-1 text-gray-800 font-medium border-b border-gray-300 focus:outline-none"
                                       placeholder="เบอร์โทรศัพท์"
                                   />
                               ) : (
                                   <span className="text-gray-800 font-medium">{phone}</span>
                               )}
                           </div>
                           <FaEdit 
                               className="text-gray-600 cursor-pointer ml-3" 
                               size={20} 
                               onClick={() => setIsEditingPhone(!isEditingPhone)}
                           />
                       </div>
                   </div>
                   {(isEditingName || isEditingPhone || isImageChanged) && (
                       <div className="mt-6 flex flex-row items-center space-x-4">
                           <button 
                               className="bg-[#379DD6] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-[#2980b9] transition duration-300"
                               onClick={handleConfirm}
                           >
                               ยืนยัน
                           </button>
                           <button 
                               className="bg-[#d33] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-[#b32] transition duration-300"
                               onClick={handleCancel}
                           >
                               ยกเลิก
                           </button>
                       </div>
                   )}
               </div>
               <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
           </div>
       );
   };

   export default AccountPage;