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
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      whereClause = {
        date: {
          gte: start,
          lte: end,
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
    const { id, date, breakfast, lunch, snack, costPerStudent, ingredientsJson } = body;

    if (!date || !breakfast || !lunch || !snack) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin ngày và các bữa ăn." },
        { status: 400 }
      );
    }

    const menuDate = new Date(date);
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    // Check if menu exists by ID or by date
    let existing = null;
    if (id) {
      existing = await prisma.dailyMenu.findUnique({ where: { id } });
    }
    if (!existing) {
      existing = await prisma.dailyMenu.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
    }

    let result;
    if (existing) {
      result = await prisma.dailyMenu.update({
        where: { id: existing.id },
        data: {
          date: menuDate,
          breakfast,
          lunch,
          snack,
          costPerStudent: parseFloat(costPerStudent) || 30000,
          ingredientsJson: ingredientsJson !== undefined ? (typeof ingredientsJson === "string" ? ingredientsJson : JSON.stringify(ingredientsJson)) : undefined,
        },
      });
    } else {
      result = await prisma.dailyMenu.create({
        data: {
          date: menuDate,
          breakfast,
          lunch,
          snack,
          costPerStudent: parseFloat(costPerStudent) || 30000,
          ingredientsJson: ingredientsJson ? (typeof ingredientsJson === "string" ? ingredientsJson : JSON.stringify(ingredientsJson)) : null,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể lưu thực đơn.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa thực đơn theo ID hoặc theo Ngày
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const dateStr = searchParams.get("date");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);

      await prisma.dailyMenu.deleteMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });
      return NextResponse.json({ success: true, message: "Đã xóa toàn bộ thực đơn tùy chỉnh trong khoảng thời gian này." });
    }

    if (id) {
      await prisma.dailyMenu.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Đã xóa thực đơn thành công." });
    }

    if (dateStr) {
      const menuDate = new Date(dateStr);
      const startOfDay = new Date(new Date(menuDate).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(menuDate).setHours(23, 59, 59, 999));

      await prisma.dailyMenu.deleteMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      return NextResponse.json({ success: true, message: "Đã xóa thực đơn ngày này thành công." });
    }

    return NextResponse.json({ error: "Thiếu ID hoặc ngày của thực đơn cần xóa." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa thực đơn.", details: error.message },
      { status: 500 }
    );
  }
}
