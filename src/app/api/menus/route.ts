import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy thực đơn theo khoảng thời gian (Tuần / Tháng)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    let whereClause = {};
    if (startDateStr && endDateStr) {
      whereClause = {
        date: {
          gte: new Date(startDateStr),
          lte: new Date(endDateStr),
        },
      };
    }

    const menus = await prisma.dailyMenu.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(menus);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải lịch sử thực đơn.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật thực đơn theo ngày
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, breakfast, lunch, snack, costPerStudent } = body;

    if (!date || !breakfast || !lunch || !snack) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin ngày và các bữa ăn." },
        { status: 400 }
      );
    }

    const menuDate = new Date(date);
    const startOfDay = new Date(menuDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(menuDate.setHours(23, 59, 59, 999));

    // Check if menu exists for this date
    const existing = await prisma.dailyMenu.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let result;
    if (existing) {
      result = await prisma.dailyMenu.update({
        where: { id: existing.id },
        data: {
          breakfast,
          lunch,
          snack,
          costPerStudent: parseFloat(costPerStudent) || 35000,
        },
      });
    } else {
      result = await prisma.dailyMenu.create({
        data: {
          date: menuDate,
          breakfast,
          lunch,
          snack,
          costPerStudent: parseFloat(costPerStudent) || 35000,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể lưu thực đơn.", details: error.message },
      { status: 500 }
    );
  }
}
