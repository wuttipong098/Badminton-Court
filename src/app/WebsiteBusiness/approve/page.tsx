"use client";

import Image from "next/image";
import ball from "@/public/ball.png";
import { useRouter } from "next/navigation";
import { FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import styles from '@/styles/approve.module.css';

interface User {
    RegisterID: number;
    StadiumName: string;
    PhoneNumber: string;
    Location: string;
    FirstName?: string;
    LastName?: string;
    UserName?: string;
    Password?: string;
}

const ApprovePage = () => {
    const router = useRouter();
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleMemberlistClick = () => {
        router.push("/WebsiteBusiness/memberlist");
    };

    const toggleDropdown = (id: number) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const fetchUsers = async (stadiumName: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ StadiumName: stadiumName }),
            });

            if (!response.ok) {
                throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
            }

            const result = await response.json();
            setMembers(result.data || []);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (member: User) => {
        setLoading(true);
        setError(null);
        try {
            // 1. เรียก API PUT เพื่อเพิ่มข้อมูลผู้ใช้
            const putResponse = await fetch('/api/approve', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: member.FirstName || 'DefaultFirstName',
                    last_name: member.LastName || 'DefaultLastName',
                    user_name: member.UserName || `user_${member.RegisterID}`,
                    password: member.Password || 'defaultPassword123',
                    phone_number: member.PhoneNumber,
                    stadium_name: member.StadiumName,
                    location: member.Location,
                    role_name: 'owner',
                }),
            });

            const putResult = await putResponse.json();

            if (!putResponse.ok || putResult.status_code !== 201) {
                throw new Error(putResult.status_message || 'เกิดข้อผิดพลาดในการอนุมัติ');
            }

            // 2. เรียก API DELETE เพื่อลบข้อมูลจากตาราง register
            const deleteResponse = await fetch('/api/approve', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ RegisterID: member.RegisterID }),
            });

            const deleteResult = await deleteResponse.json();

            if (!deleteResponse.ok || deleteResult.status_code !== 200) {
                throw new Error(deleteResult.status_message || 'เกิดข้อผิดพลาดในการลบข้อมูลหลังอนุมัติ');
            }

            // 3. อัปเดต state เพื่อลบผู้ใช้จาก UI
            setMembers(members.filter((m) => m.RegisterID !== member.RegisterID));
            alert('อนุมัติและลบข้อมูลสำเร็จ');
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (registerID: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/approve', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ RegisterID: registerID }),
            });

            const result = await response.json();

            if (!response.ok || result.status_code !== 200) {
                throw new Error(result.status_message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
            }

            setMembers(members.filter((m) => m.RegisterID !== registerID));
            alert('ปฏิเสธสำเร็จ');
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = () => {
        fetchUsers(searchQuery);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full h-[140px] bg-[#1F9378]">
                <div className={`w-full px-5 flex justify-between items-start ${styles.header}`}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.h1}>Approve</h1>
                        <div className={styles.ball}>
                            <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
                        </div>
                    </div>
                    <button
                        className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-gray-300 border-2 border-black cursor-pointer"
                        onClick={() => router.push("/BadmintonCourt/login")}
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
                            id="stadium"
                            name="stadium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className={styles.buttons} onClick={handleSearch}>
                        ค้นหา
                    </button>
                    <button className={styles.buttona} onClick={handleMemberlistClick}>
                        memberlist
                    </button>
                </div>
            </div>
            <div className="flex-grow">
                <div className={styles.tableContainer}>
                    {loading && <p className="text-center text-gray-600">กำลังโหลด...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    <div className={styles.tableHeader}>
                        <div className={styles.tableHeader}>
                            <span className="text-gray-600 font-semibold ml-[-45px]">Stadium ID</span>
                            <span className="text-gray-800 font-semibold ml-[150px]">ชื่อสนามแบดมินตัน</span>
                            <span className="text-gray-800 font-semibold ml-[328px]">เบอร์โทรศัพท์</span>
                        </div>
                    </div>
                    <div className={styles.tableRows}>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <div key={member.RegisterID}>
                                    <div className={styles.tableRow}>
                                        <span>{member.RegisterID}</span>
                                        <span>{member.StadiumName}</span>
                                        <span>{member.PhoneNumber}</span>
                                        <div className={styles.groupsbutton}>
                                            <button
                                                className={styles.nbutton}
                                                onClick={() => handleReject(member.RegisterID)}
                                                disabled={loading}
                                            >
                                                ปฏิเสธ
                                            </button>
                                            <button
                                                className={styles.ybutton}
                                                onClick={() => handleApprove(member)}
                                                disabled={loading}
                                            >
                                                อนุมัติ
                                            </button>
                                            <button
                                                className={styles.dropdownButton}
                                                onClick={() => toggleDropdown(member.RegisterID)}
                                            >
                                                {openDropdown === member.RegisterID ? '▲' : '▼'}
                                            </button>
                                        </div>
                                    </div>
                                    {openDropdown === member.RegisterID && (
                                        <div className={styles.dropdownContent}>
                                            <div className={styles.location}>
                                                <p>รายละเอียดที่อยู่ {member.StadiumName}</p>
                                                <p>{member.Location || 'ไม่มีข้อมูลที่อยู่'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">ไม่พบข้อมูล</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-full h-10 bg-[#1F9378] fixed bottom-0 left-0 z-50"></div>
        </div>
    );
};

export default ApprovePage;