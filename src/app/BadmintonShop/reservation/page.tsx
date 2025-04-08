"use client";

import { useState } from "react";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Calendar as CalendarIcon } from "lucide-react";

const courts = [
  { id: 1, status: "available" },
  { id: 2, status: "booked" },
  { id: 3, status: "available" },
  { id: 4, status: "available" },
];

export default function CourtBooking() {
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Badminton Court Booking</h1>

      <div className="mb-6">
        <label className="block font-medium text-black mb-1 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          วันเริ่มต้น :
        </label>
        <input
          type="date"
          className="border p-2 rounded-lg text-black w-1/3"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {courts.map((court) => (
          <Card key={court.id} className="p-4 flex flex-col items-center text-center">
            <img src="/court.png" alt="Court" className="w-32 h-20 mb-2" />
            <Badge variant={court.status === "available" ? "success" : "destructive"}>
              {court.status === "available" ? "Available" : "Booked"}
            </Badge>
            <Button disabled={court.status === "booked"} className="mt-2">
              {court.status === "available" ? "Book Now" : "Full"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
