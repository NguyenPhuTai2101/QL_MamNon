import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách điểm danh theo ngày hoặc học sinh
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const classId = searchParams.get("classId");

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(classId ? { student: { classId } } : {}),
      },
      include: {
        student: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải điểm danh.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Điểm danh học sinh (Tạo mới hoặc cập nhật)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, status, pickupPerson, notes, date } = body;

    if (!studentId || !status) {
      return NextResponse.json(
        { error: "Thiếu thông tin học sinh hoặc trạng thái điểm danh." },
        { status: 400 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();

    // Check if attendance record exists for today
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    const existingRecord = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let record;
    if (existingRecord) {
      record = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          status,
          pickupPerson,
          notes,
        },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          studentId,
          status,
          pickupPerson,
          notes,
          date: attendanceDate,
        },
      });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể lưu điểm danh.", details: error.message },
      { status: 500 }
    );
  }
}
