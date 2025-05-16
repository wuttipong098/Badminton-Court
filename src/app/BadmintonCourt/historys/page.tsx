"use client";

import styles from '@/styles/historys.module.css';
import Image from "next/image";
import ball from "@/public/ball.png";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchHistoryParams } from "@/dto/request/historys";
import { historys } from "@/dto/response/historys";
import { FaSearch } from "react-icons/fa";

// จำนวนรายการต่อหน้า
const ITEMS_PER_PAGE = 5;

// ฟังก์ชันช่วยแปลงวันที่จาก ISO 8601 เป็น DD/MM/YYYY
const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

const HistoryPage = () => {
  const router = useRouter();
  const [data, setData] = useState<historys[]>([]);
  const [filteredData, setFilteredData] = useState<historys[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ในทุก render
  const fetchData = useCallback(async (stadiumName?: string, page: number = 1) => {
    try {
      setLoading(true);
      const userID = localStorage.getItem("userID");
      if (!userID) {
        setErrorMessage("กรุณาเข้าสู่ระบบก่อน");
        router.push("/login");
        return;
      }

      const params: SearchHistoryParams & { page?: number; pageSize?: number } = {
        ...(stadiumName ? { StadiumName: stadiumName } : {}),
        page,
        pageSize: ITEMS_PER_PAGE,
      };

      console.log('Sending request with params:', params); // Debug

      const response = await fetch('/api/historys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // ป้องกัน cache
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();
      console.log('API response:', result); // Debug

      if (result.status_code === 200) {
        setData(result.data);
        setFilteredData(result.data);
        setTotal(result.total || 0);
      } else {
        setErrorMessage(result.status_message || "ไม่สามารถดึงข้อมูลประวัติการจองได้");
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [router]); // router เป็น dependency ของ fetchData

  useEffect(() => {
    console.log('useEffect triggered with:', { searchQuery, currentPage }); // Debug
    fetchData(searchQuery, currentPage);
  }, [fetchData, searchQuery, currentPage]); // ใช้ fetchData แทน router

  const handleSearch = () => {
    console.log('Search triggered with query:', searchQuery); // Debug
    setCurrentPage(1); // รีเซ็ตไปหน้าแรกเมื่อค้นหา
    fetchData(searchQuery, 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    console.log('Changing to page:', pageNumber); // Debug
    setCurrentPage(pageNumber);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const visiblePages = 5;
    const pageOffset = Math.floor(visiblePages / 2);

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= pageOffset + 1) {
      for (let i = 1; i <= visiblePages; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage > totalPages - pageOffset) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - visiblePages + 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - pageOffset; i <= currentPage + pageOffset; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages.filter((page) => page === '...' || (typeof page === 'number' && !isNaN(page)));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="w-full h-35 bg-[#1F9378]">
        <div className={styles.header}>
          <h1 className={styles.h1}>Badminton</h1>
          <h2 className={styles.h2}>CourtBooking</h2>
          <div className={styles.ball}>
            <Image src={ball} alt="Badminton Court Logo" width={50} height={50} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 mb-10">
        <div className={styles.searchContainer}>
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
            <button className={styles.buttons} onClick={handleSearch}>
              ค้นหา
            </button>
          </div>
        </div>
        {loading && <div className="text-gray-500 text-center mt-4">กำลังโหลด...</div>}
        {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
        {!loading && !errorMessage && (
          <>
            <div className={styles.headertable}>
              <label className={styles.headtable}>วันที่จอง</label>
              <label className={styles.headtable}>เวลาที่จอง</label>
              <label className={styles.headtable}>ชื่อสถานที่</label>
              <label className={styles.headtable}>สนามที่จอง</label>
            </div>
            {filteredData.length > 0 ? (
              filteredData.map((booking, index) => (
                <div key={index} className={styles.rowtable}>
                  <label className={styles.celltable}>{formatDate(booking.BookingDate)}</label>
                  <label className={styles.celltable}>
                    {booking.StartTime && booking.EndTime
                      ? `${booking.StartTime.slice(0, 5)} - ${booking.EndTime.slice(0, 5)}`
                      : '-'}
                  </label>
                  <label className={styles.celltable}>{booking.StadiumName || '-'}</label>
                  <label className={styles.celltable}>
                    {booking.CourtNumber ? `สนามที่ ${booking.CourtNumber}` : '-'}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center mt-4">ไม่มีประวัติการจอง</div>
            )}
            {filteredData.length > 0 && (
              <div className="flex justify-between mt-6 mx-4">
                <div className="text-gray-600">
                  {filteredData.length > 0 ? (
                    <>
                      {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, total)} of {total} items
                    </>
                  ) : (
                    <span>No items found</span>
                  )}
                </div>
                <nav className="flex space-x-2">
                  <button
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-300 text-black'
                    }`}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {'<'}
                  </button>
                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
                      }`}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-300 text-black'
                    }`}
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {'>'}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      <div className="w-full h-20 bg-[#1F9378]"></div>
    </div>
  );
};

export default HistoryPage;