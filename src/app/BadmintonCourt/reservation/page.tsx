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
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userID');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            setErrorMessage("ไม่พบ UserID ใน localStorage");
        }
    }, []);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const getImageSrc = (image: string | Buffer | undefined): string => {
        if (!image) return '/default-image.jpg';
        if (typeof image === 'string') {
            if (image.startsWith('data:image')) return image;
            return `data:image/jpeg;base64,${image}`;
        }
        return `data:image/jpeg;base64,${Buffer.from(image).toString('base64')}`;
    };

    const fetchCourts = async (params: SearchAccountParams) => {
        setLoading(true);
        try {
            const response = await fetch('/api/stadium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...params,
                    UserID: userId, 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courts');
            }

            const result: UserResponseModel = await response.json();
            if (result.status_code === 200) {
                const sortedCourts = result.data.sort((a, b) => {
                    if (a.FavoriteID && !b.FavoriteID) return -1;
                    if (!a.FavoriteID && b.FavoriteID) return 1;
                    return a.StadiumID - b.StadiumID;
                });
                setCourts(sortedCourts);
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

    const addFavorite = async (stadiumId: number) => {
        if (!userId) {
            setErrorMessage("กรุณาล็อกอินก่อนเพิ่มรายการโปรด");
            return;
        }

        try {
            const response = await fetch('/api/stadium', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserID: userId,
                    StadiumID: stadiumId,
                }),
            });

            const result = await response.json();
            if (result.status_code === 201 && result.FavoriteID) {
                setCourts((prevCourts) =>
                    prevCourts.map((court) =>
                        court.StadiumID === stadiumId
                            ? { ...court, FavoriteID: result.FavoriteID }
                            : court
                    ).sort((a, b) => {
                        if (a.FavoriteID && !b.FavoriteID) return -1;
                        if (!a.FavoriteID && b.FavoriteID) return 1;
                        return a.StadiumID - b.StadiumID;
                    })
                );
            } else {
                setErrorMessage(result.status_message || "ไม่สามารถเพิ่มรายการโปรดได้");
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
            setErrorMessage("เกิดข้อผิดพลาดในการเพิ่มรายการโปรด");
        }
    };

    const removeFavorite = async (favoriteId: number) => {
        if (!userId) {
            setErrorMessage("กรุณาล็อกอินก่อนลบรายการโปรด");
            return;
        }

        try {
            const response = await fetch('/api/stadium', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    FavoriteID: favoriteId,
                }),
            });

            const result = await response.json();
            if (result.status_code === 200) {
                setCourts((prevCourts) =>
                    prevCourts.map((court) =>
                        court.FavoriteID === favoriteId
                            ? { ...court, FavoriteID: undefined }
                            : court
                    ).sort((a, b) => {
                        if (a.FavoriteID && !b.FavoriteID) return -1;
                        if (!a.FavoriteID && b.FavoriteID) return 1;
                        return a.StadiumID - b.StadiumID;
                    })
                );
            } else {
                setErrorMessage(result.status_message || "ไม่สามารถลบรายการโปรดได้");
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            setErrorMessage("เกิดข้อผิดพลาดในการลบรายการโปรด");
        }
    };

    const toggleFavorite = async (stadiumId: number, favoriteId?: number) => {
        if (favoriteId) {
            await removeFavorite(favoriteId);
        } else {
            await addFavorite(stadiumId);
        }
    };

    useEffect(() => {
        const params: SearchAccountParams = {
            page: 1,
            pageSize: 30,
            Location: selectedProvince ? `%${selectedProvince}%` : undefined,
            StadiumName: searchQuery ? `%${searchQuery}%` : undefined,
        };
        fetchCourts(params);
    }, [selectedProvince, searchQuery, userId]);

    const handleSearch = () => {
        const params: SearchAccountParams = {
            page: 1,
            pageSize: 30,
            StadiumName: searchQuery ? `%${searchQuery}%` : undefined,
            Location: selectedProvince ? `%${selectedProvince}%` : undefined,
        };
        fetchCourts(params);
    };

    const formatThaiDate = (dateString: string) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        const thaiYear = parseInt(year) + 543;
        return `${day}/${month}/${thaiYear}`;
    };

    const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(event.target.value);
    };

    const handleStadiumClick = () => {
        router.push("/BadmintonCourt/reservation/stadium");
    };

    const handleShowFavorites = () => {
        const newShowFavorites = !showFavorites;
        setShowFavorites(newShowFavorites);

        // ตรวจสอบว่ามีสนามที่ถูกใจหรือไม่หลังจากกรอง
        if (newShowFavorites) {
            const favoriteCourts = courts.filter(court => court.FavoriteID !== undefined);
            if (favoriteCourts.length === 0) {
                MySwal.fire({
                    icon: 'info',
                    title: 'ไม่มีสนามที่ถูกใจ',
                    text: 'คุณยังไม่ได้เพิ่มสนามใดในรายการโปรด',
                    confirmButtonText: 'ตกลง',
                });
            }
        }
    };

    // กรองสนามตาม showFavorites: ถ้า true และมีสนามที่ถูกใจ แสดงเฉพาะนั้น, ถ้าไม่มีให้แสดงทั้งหมด
    const displayedCourts = showFavorites && courts.some(court => court.FavoriteID !== undefined)
        ? courts.filter(court => court.FavoriteID !== undefined)
        : courts;

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage(null);
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
                    <input
                        type="text"
                        className={styles.insearch}
                        placeholder="ชื่อสนามแบดมินตัน"
                        id="stadium"
                        name="stadium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className={styles.buttons} onClick={handleSearch}>ค้นหา</button>
                <select
                    className={styles.province}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                >
                    <option value="" disabled>จังหวัด</option>
                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="ชลบุรี">ชลบุรี</option>
                    <option value="สุโขทัย">สุโขทัย</option>
                </select>
                <FaHeart
                    className={showFavorites ? styles.favorite : styles.heartIcon}
                    size={30}
                    onClick={handleShowFavorites}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                />
            </div>
            <div className="flex flex-col min-h-screen">
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
                                                onClick={() => toggleFavorite(court.StadiumID, court.FavoriteID)}
                                                style={{ position: 'absolute', top: '10px', right: '10px' }}
                                            />
                                            <div className="flex flex-col flex-shrink-0 mr-4">
                                                <Image
                                                    src={getImageSrc(court.ImageStadium?.[0]) || '/default-image.jpg'}
                                                    alt="Court Image"
                                                    width={300}
                                                    height={200}
                                                    className="rounded-lg cursor-pointer"
                                                    onClick={() => { setSelectedImage(getImageSrc(court.ImageStadium?.[0]) || '/default-image.jpg'); setShowModal(true); }}
                                                />
                                                <div className="flex space-x-2 mt-2 ml-0">
                                                    {court.ImageStadium && court.ImageStadium.length > 0 ? (
                                                        court.ImageStadium.slice(1, 4).map((image, index) => (
                                                            <Image
                                                                key={index}
                                                                src={getImageSrc(image) || '/default-image.jpg'}
                                                                alt={`Court Image ${index + 2}`}
                                                                width={90}
                                                                height={60}
                                                                className="rounded-lg cursor-pointer"
                                                                onClick={() => { setSelectedImage(getImageSrc(image) || '/default-image.jpg'); setShowModal(true); }}
                                                            />
                                                        ))
                                                    ) : (
                                                        <Image
                                                            src="/default-image.jpg"
                                                            alt="Default Image"
                                                            width={90}
                                                            height={60}
                                                            className="rounded-lg"
                                                        />
                                                    )}
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
            <div className={`${styles.footer} w-full h-35 bg-[#1F9378]`}></div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={selectedImage || '/default-image.jpg'}
                            alt="Enlarged Court Image"
                            width={600}
                            height={400}
                            className="rounded-lg"
                        />
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            onClick={closeModal}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationPage;