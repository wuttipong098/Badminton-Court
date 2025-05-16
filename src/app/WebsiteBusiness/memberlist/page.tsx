"use client";

import styles from '@/styles/memberlist.module.css';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaSearch } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { SearchMemberParams } from '@/dto/request/member';
import { MemberList, MemberResponseModel } from "@/dto/response/member";
import ball from "@/public/ball.png";

const MemberlistPage = () => {
    const router = useRouter();
    const [members, setMembers] = useState<MemberList[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchMembers = async (params: SearchMemberParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            const data: MemberResponseModel = await response.json();
            if (data.status_code === 200) {
                setMembers(data.data);
                setTotal(data.total);
            } else {
                throw new Error(data.status_message);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    // เรียก API เมื่อ searchTerm เปลี่ยน
    useEffect(() => {
        const params: SearchMemberParams = {
            StadiumName: searchTerm || undefined,
        };
        fetchMembers(params);
    }, [searchTerm]);

    // จัดการการค้นหา
    const handleSearch = () => {
        fetchMembers({ StadiumName: searchTerm || undefined });
    };

    // จัดการการออกจากระบบ
    const handleLogout = () => {
        router.push("/BadmintonCourt/login");
    };

    // จัดการการกดปุ่ม approve
    const handleApproveClick = () => {
        router.push("/WebsiteBusiness/approve");
    };

    // จัดการการสลับ dropdown ด้วย debounce
    const toggleDropdown = useCallback((id: number) => {
        setOpenDropdown((prev) => (prev === id ? null : id));
    }, []);

    // จัดการการคลิกที่รูปภาพ
    const handleImageClick = (image: string) => {
        setSelectedImage(`data:image/jpeg;base64,${image}`);
    };

    // จัดการการปิด modal
    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className={styles.container}>
            <div className="w-full h-[140px] bg-[#1F9378]">
                <div className={`w-full px-5 flex justify-between items-start ${styles.header}`}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.h1}>Member</h1>
                        <div className={styles.listWrapper}>
                            <h2 className={styles.h2}>List</h2>
                            <div className={styles.ball}>
                                <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
                            </div>
                        </div>
                    </div>
                    <button
                        className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-gray-300 border-2 border-black cursor-pointer"
                        onClick={handleLogout}
                    >
                        ออกจากระบบ
                    </button>
                </div>
                <div className={styles.headernav}>
                    <div className={styles.search}>
                        <FaSearch className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            className={styles.insearch}
                            placeholder="ชื่อสนามแบดมินตัน"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={styles.buttons} onClick={handleSearch}>
                        ค้นหา
                    </button>
                    <button className={styles.buttona} onClick={handleApproveClick}>
                        approve
                    </button>
                </div>
            </div>
            <div className={styles.tableContainer}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.tableHeader}>
                    <span>Stadium ID</span>
                    <span>ชื่อสมาชิก</span>
                    <span>เบอร์โทรศัพท์</span>
                    <span>สถานะการให้บริการ</span>
                </div>
                <div className={styles.tableRows}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : members.length > 0 ? (
                        members.map((member) => (
                            <div key={member.StadiumID} className={styles.tableRowWrapper}>
                                <div className={styles.tableRow}>
                                    <span>{member.StadiumID}</span>
                                    <span>{member.StadiumName}</span>
                                    <span>{member.PhoneNumber}</span>
                                    <div className={styles.statusContainer}>
                                        <button
                                            className={`${styles.statusText} ${member.Situation === "เปิดให้บริการ"
                                                    ? styles.statusopen
                                                    : member.Situation === "ปิดกิจการ"
                                                        ? styles.statusoff
                                                        : styles.statedit
                                                }`}
                                        >
                                            {member.Situation}
                                        </button>
                                        <button
                                            className={styles.dropdownButton}
                                            onClick={() => toggleDropdown(member.StadiumID)}
                                        >
                                            {openDropdown === member.StadiumID ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>
                                {openDropdown === member.StadiumID && (
                                    <div className={styles.dropdownContent}>
                                        <div className={styles.location}>
                                            <p className={styles.dropdownTitle}>รายละเอียดที่อยู่ {member.StadiumName}</p>
                                            <p>{member.Location || 'ไม่มีข้อมูลที่อยู่'}</p>
                                        </div>
                                        <div className={styles.imageSection}>
                                            <p className={styles.dropdownTitle}>ภาพสนาม</p>
                                            {member.ImageStadium && member.ImageStadium.length > 0 ? (
                                                <div className={styles.imageContainer}>
                                                    {member.ImageStadium.map((image, index) => (
                                                        <Image
                                                            key={index}
                                                            src={`data:image/jpeg;base64,${image}`}
                                                            alt={`สนาม ${member.StadiumName} ภาพที่ ${index + 1}`}
                                                            width={150}
                                                            height={100}
                                                            className={styles.stadiumImage}
                                                            loading="lazy"
                                                            onClick={() => handleImageClick(image)}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>ไม่มีภาพสนาม</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div>ไม่มีข้อมูล</div>
                    )}
                </div>
            </div>
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={selectedImage}
                            alt="รูปภาพสนามขนาดใหญ่"
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
            <div className="w-full h-10 bg-[#1F9378] fixed bottom-0 left-0 z-50"></div>
        </div>
    );
};

export default MemberlistPage;