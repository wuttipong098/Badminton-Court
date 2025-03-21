"use client";

import styles from '@/styles/memberlist.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { useRouter } from "next/navigation";
import { FaSearch } from 'react-icons/fa';

const mockMembers = [
    { id: 1, stadium: "stadium A", phone: "093-xxx-xxxx", status: "Closed permanently" },
    { id: 2, stadium: "stadium B", phone: "093-xxx-xxxx", status: "Closed for renovation" },
    { id: 3, stadium: "stadium C", phone: "093-xxx-xxxx", status: "Open for service" },
    { id: 4, stadium: "stadium D", phone: "093-xxx-xxxx", status: "Open for service" },
    { id: 5, stadium: "stadium E", phone: "093-xxx-xxxx", status: "Open for service" },
    { id: 6, stadium: "stadium F", phone: "093-xxx-xxxx", status: "Open for service" },
    { id: 7, stadium: "stadium G", phone: "093-xxx-xxxx", status: "Open for service" },
];

const MemberlistPage = () => {
    const router = useRouter();

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
                        onClick={() => router.push("/BadmintonCourt/login")}
                    >
                        ออกจากระบบ
                    </button>
                </div>
                <div className={styles.headernav}>
                    <div className={styles.search}>
                        <FaSearch className={styles.searchIcon} size={20} />
                        <input type="text" className={styles.insearch} placeholder="ชื่อสนามแบดมินตัน" id="stadium" name="stadium" />
                    </div>
                    <button className={styles.buttons}>ค้นหา</button>
                    <button className={styles.buttona}>approve</button>
                </div>
            </div>
            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <span>Stadium ID</span>
                    <span>ชื่อสมาชิก</span>
                    <span>เบอร์โทรศัพท์</span>
                    <span>สถานะการให้บริการ</span>
                </div>
                <div className={styles.tableRows}>
                    {mockMembers.map((member) => (
                        <div key={member.id} className={styles.tableRow}>
                            <span>{member.id}</span>
                            <span>{member.stadium}</span>
                            <span>{member.phone}</span>
                            <div className={styles.statusContainer}>
                                <button
                                    className={`${styles.statusText} ${member.status === "Open for service"
                                            ? styles.statusopen
                                            : member.status === "Closed permanently"
                                                ? styles.statusoff
                                                : styles.statedit
                                        }`}
                                >
                                    {member.status === "Open for service" && "เปิดให้บริการ"}
                                    {member.status === "Closed permanently" && "ปิดกิจการ"}
                                    {member.status === "Closed for renovation" && "ปิดปรับปรุง"}
                                </button>
                                <button className={styles.dropdownButton}>▼</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full mt-20 h-20 bg-[#1F9378]"></div>
        </div>
    );
};

export default MemberlistPage;