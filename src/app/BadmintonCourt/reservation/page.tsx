"use client";

import styles from '@/styles/reservation.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import calendar from "@/public/calendar.png";
import { useRouter } from "next/navigation";
import { FaSearch, FaHeart, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { SearchAccountParams } from "@/dto/request/stadium";
import { stadiums, UserResponseModel } from "@/dto/response/stadium";

type TimeSlot = {
    time: string;
    court: number;
};

const ReservationPage = () => {
    const router = useRouter();
    const [courts, setCourts] = useState<stadiums[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [showFavorites, setShowFavorites] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState('');

    // ฟังก์ชันแปลง Buffer หรือ string เป็น base64 URL
    const getImageSrc = (image: string | Buffer | undefined): string => {
        if (!image) return '/default-image.jpg';
        if (typeof image === 'string') {
            // ตรวจสอบว่าเป็น base64 string หรือ URL
            if (image.startsWith('data:image')) return image;
            return `data:image/jpeg;base64,${image}`;
        }
        // หากเป็น Buffer แปลงเป็น base64
        return `data:image/jpeg;base64,${Buffer.from(image).toString('base64')}`;
    };

    // ดึงข้อมูลจาก API
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const params: SearchAccountParams = {
                    page: 1,
                    pageSize: 30,
                    Location: selectedProvince ? `%${selectedProvince}%` : undefined,
                };

                const response = await fetch('/api/stadium', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(params),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch courts');
                }

                const result: UserResponseModel = await response.json();
                if (result.status_code === 200) {
                    setCourts(result.data);
                    localStorage.setItem('favoriteCourts', JSON.stringify(result.data));
                } else {
                    setErrorMessage(result.status_message || "ไม่สามารถดึงข้อมูลสนามได้");
                }
            } catch (error) {
                console.error('Error fetching courts:', error);
                setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [selectedProvince]);

    const formatThaiDate = (dateString: string) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        const thaiYear = parseInt(year) + 543;
        return `${day}/${month}/${thaiYear}`;
    };

    const toggleFavorite = (id: number) => {
        setCourts((prevCourts) => {
            const updatedCourts = prevCourts.map((court) =>
                court.StadiumID === id ? { ...court, FavoriteID: court.FavoriteID ? undefined : court.StadiumID } : court
            );
            localStorage.setItem('favoriteCourts', JSON.stringify(updatedCourts));
            return updatedCourts;
        });
    };

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);
    };

    const handleStadiumClick = () => {
        router.push("/BadmintonCourt/reservation/stadium");
    };

    const handleShowFavorites = () => {
        setShowFavorites((prev) => !prev);
    };

    const displayedCourts = showFavorites ? courts.filter((court) => !!court.FavoriteID) : courts;

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
                <div className={styles.controlContainer}>
                    <div className={styles.day}>
                        <input
                            type="text"
                            className={styles.inputday}
                            value={selectedDate}
                            placeholder="วัน/เดือน/ปี"
                            readOnly
                            onClick={() => {
                                const dateInput = document.getElementById("hiddenDatePicker") as HTMLInputElement;
                                dateInput?.showPicker();
                            }}
                        />
                        <input
                            type="date"
                            id="hiddenDatePicker"
                            className={styles.hiddenDatePicker}
                            onChange={(e) => setSelectedDate(formatThaiDate(e.target.value))}
                        />
                        <Image
                            src={calendar}
                            alt="Calendar Icon"
                            width={24}
                            height={24}
                            className={styles.calendarIcon}
                            onClick={() => {
                                const dateInput = document.getElementById("hiddenDatePicker") as HTMLInputElement;
                                dateInput?.showPicker();
                            }}
                        />
                    </div>
                    <div className={styles.time}>
                        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                            <option value="" disabled>เวลา</option>
                            <option>08:00</option>
                            <option>09:00</option>
                            <option>10:00</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className={styles.headernav}>
                <div className={styles.search}>
                    <FaSearch className={styles.searchIcon} size={20} />
                    <input type="text" className={styles.insearch} placeholder="ชื่อสนามแบดมินตัน" id="stadium" name="stadium" />
                </div>
                <button className={styles.buttons}>ค้นหา</button>
                <select
                    className={styles.province}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                >
                    <option value="" disabled>จังหวัด</option>
                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="ชลบุรี">ชลบุรี</option>
                    <option value="พะเยา">พะเยา</option>
                </select>
                <FaHeart
                    className={showFavorites ? styles.favorite : styles.heartIcon}
                    size={30}
                    onClick={handleShowFavorites}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                />
            </div>
            <div className="flex flex-col min personally-h-screen">
                <div className="flex-grow">
                    <div className={styles.container}>
                        {loading && <div className="text-gray-500 text-center mt-4">กำลังโหลด...</div>}
                        {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
                        {!loading && !errorMessage && (
                            <div className={styles.courtList}>
                                {displayedCourts.length > 0 ? (
                                    displayedCourts.map((court) => (
                                        <div key={court.StadiumID} className={`${styles.courtItem} bg-[#1F9378] p-4 rounded-lg shadow-md flex flex-row relative mb-5`}>
                                            <FaHeart
                                                className={court.FavoriteID ? styles.favorite : styles.notFavorite}
                                                size={30}
                                                onClick={() => toggleFavorite(court.StadiumID)}
                                                style={{ position: 'absolute', top: '10px', right: '10px' }}
                                            />
                                            <div className="flex flex-col flex-shrink-0 mr-4">
                                                <Image
                                                    src={getImageSrc(court.ImageStadium)}
                                                    alt="Court Image"
                                                    width={300}
                                                    height={200}
                                                    className="rounded-lg"
                                                />
                                                <div className="flex space-x-2 mt-2 ml-0">
                                                    <Image
                                                        src={getImageSrc(court.ImageStadium)}
                                                        alt="Court Image 1"
                                                        width={90}
                                                        height={60}
                                                        className="rounded-lg"
                                                    />
                                                    <Image
                                                        src={getImageSrc(court.ImageStadium)}
                                                        alt="Court Image 2"
                                                        width={90}
                                                        height={60}
                                                        className="rounded-lg"
                                                    />
                                                    <Image
                                                        src={getImageSrc(court.ImageStadium)}
                                                        alt="Court Image 3"
                                                        width={90}
                                                        height={60}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-grow">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mt-0">สนามแบดมินตัน {court.StadiumName}</h3>
                                                    <p className="text-white flex items-center mt-1">
                                                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                                                        {court.Location}
                                                    </p>
                                                    <p className="text-white mt-1">รหัสไปรษณีย์: 56000</p>
                                                    <p className="text-white flex items-center mt-1">
                                                        <FaPhone className="mr-2 text-red-500" />
                                                        081-992-5780
                                                    </p>
                                                    <p className="text-white mt-1">จำนวนสนาม : {court.CourtAll} สนาม</p>
                                                </div>
                                                <button
                                                    className={`${styles.selectButton} bg-white text-[#1F9378] px-4 py-2 rounded-lg mt-4 self-start`}
                                                    onClick={handleStadiumClick}
                                                >
                                                    เลือก
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-center mt-4">ไม่มีข้อมูลสนาม</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-full h-35 bg-[#1F9378]"></div>
        </div>
    );
};

export default ReservationPage;