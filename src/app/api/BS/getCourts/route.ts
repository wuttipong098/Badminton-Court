import { NextResponse } from "next/server";
import { getDbConnection } from "@/repository/db_connection";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
  }

  try {
    const result = await getDbConnection(async (manager) => {
      const courts = await manager.query(
        "SELECT DISTINCT court_number FROM court WHERE user_id = $1 ORDER BY court_number ASC",
        [userId]
      );
      return courts;
    });

    return NextResponse.json({ success: true, data: { courts: result } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch courts" }, { status: 500 });
  }
}