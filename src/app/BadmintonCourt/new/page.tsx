"use client";

import Image from "next/image";
import ball from "@/public/ball.png";
import court from "@/public/corut.png";
import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { SearchAccountParams } from "@/dto/request/stadium";
import { stadiums, UserResponseModel } from "@/dto/response/stadium";

const MainPage = () => {
  const [courts, setCourts] = useState<stadiums[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  const getImageSrc = (image: string | Buffer | null | undefined): string => {
    if (!image) return "/default-image.jpg"; // คืนค่า string เสมอเมื่อ image เป็น null/undefined
    if (typeof image === "string") {
      if (image.startsWith("data:image")) return image;
      return `data:image/jpeg;base64,${image}`;
    }
    return `data:image/jpeg;base64,${Buffer.from(image).toString("base64")}`;
  };

  const fetchCourts = async (params: SearchAccountParams) => {
    setLoading(true);
    try {
      const response = await fetch("/api/stadium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          UserID: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courts");
      }

      const result: UserResponseModel = await response.json();
      if (result.status_code === 200) {
        setCourts(result.data || []); // รับประกันว่า courts จะไม่เป็น null
      } else {
        setErrorMessage(result.status_message || "ไม่สามารถดึงข้อมูลสนามได้");
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params: SearchAccountParams = {
      page: 1,
      pageSize: 30, // ดึงทุกสนามมาในครั้งเดียว
    };
    fetchCourts(params);
  }, [userId]);

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // คำนวณสนามที่จะแสดงตามหน้าปัจจุบัน
  const displayedCourt = courts[currentPage - 1]; // แสดงสนามเดียวตามหน้าปัจจุบัน

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = courts.length;

  return (
    <div className="relative flex flex-col items-start justify-center min-h-screen bg-white overflow-hidden pb-10">
      <div className="absolute top-0 left-0 w-full h-60 bg-[#1F9378] skew-y-[-6deg] origin-top-left"></div>
      <div className="absolute top-[60px] left-0 text-left w-full max-w-lg text-white z-10 p-6">
        <h1 className="text-3xl font-bold">Badminton</h1>
        <h2 className="text-3xl font-semibold">CourtBooking</h2>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <Image src={ball} alt="Badminton shuttlecock" width={100} height={100} />
      </div>

      <div className="relative z-10 flex items-center justify-between w-full px-6 mt-6">
        <div className="flex-shrink-0">
          <Image src={court} alt="Badminton Court" width={250} height={100} />
        </div>

        <div className="relative z-10 p-6 self-start mt-40 max-w-lg w-full mx-auto flex flex-col items-center">
          <div className="w-full h-[400px] bg-gray-200 rounded-lg mb-4">
            {loading && <div className="text-gray-500 text-center mt-4">กำลังโหลด...</div>}
            {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
            {!loading && !errorMessage && (
              <div className="p-4">
                {displayedCourt ? (
                  <div
                    key={displayedCourt.StadiumID}
                    className="bg-[#1F9378] p-4 rounded-lg shadow-md flex flex-col relative h-[370px]"
                  >
                    <div className="flex flex-row">
                      <div className="flex-shrink-0 mr-2">
                        <Image
                          src={getImageSrc(displayedCourt.ImageStadium?.[0])}
                          alt="Court Image"
                          width={280}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        {(() => {
                          const secondaryImages = displayedCourt.ImageStadium?.slice(1, 4) || [];
                          const imagesToShow = [...secondaryImages];
                          while (imagesToShow.length < 3) {
                            imagesToShow.push("/default-image.jpg"); // ใช้ string แทน null
                          }
                          return imagesToShow.map((image, index) => (
                            <Image
                              key={index}
                              src={getImageSrc(image)}
                              alt={`Court Image ${index + 2}`}
                              width={107}
                              height={40}
                              className={`rounded-lg mb-1 object-cover ${
                                index === 1 ? "mt-[-2px]" : ""
                              }`}
                            />
                          ));
                        })()}
                      </div>
                    </div>
                    <div className="mt-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mt-0">
                          สนามแบดมินตัน {displayedCourt.StadiumName}
                        </h3>
                        <p className="text-white flex items-center mt-1" style={{ fontSize: "17px" }}>
                          <FaMapMarkerAlt className="mr-2 text-red-500" size={18} />
                          {displayedCourt.Location}
                        </p>
                        <p className="text-white flex items-center mt-1" style={{ fontSize: "17px" }}>
                          <FaPhone className="mr-2 text-red-500" size={18} />
                          {displayedCourt.PhoneNumber || "ไม่ระบุเบอร์โทร"}
                        </p>
                        <p className="text-white mt-1" style={{ fontSize: "17px" }}>
                          จำนวนสนาม : {displayedCourt.CourtAll} สนาม
                        </p>
                      </div>
                      <button
                        className="self-end mt-[-50px] bg-white text-[#1F9378] font-bold py-2 px-10 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => alert(`เลือกสนาม ${displayedCourt.StadiumName}`)}
                      >
                        เลือก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center mt-4">ไม่มีข้อมูลสนาม</div>
                )}
              </div>
            )}
          </div>

          {/* ปุ่ม Pagination */}
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm transition ${
                  currentPage === index + 1
                    ? "bg-[#167A63] text-white"
                    : "bg-[#1F9378] text-white hover:bg-[#167A63]"
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-[-24px] left-0 w-full h-10 bg-[#1F9378]"></div>
    </div>
  );
};

export default MainPage;