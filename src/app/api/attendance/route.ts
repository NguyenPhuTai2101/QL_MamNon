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

// POST: Điểm danh học sinh (Hỗ trợ cả đơn lẻ và lưu hàng loạt cả lớp)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Hỗ trợ lưu danh sách điểm danh hàng loạt
    const items = Array.isArray(body) ? body : (body.attendances && Array.isArray(body.attendances)) ? body.attendances : null;

    if (items) {
      const results = [];
      for (const item of items) {
        const { studentId, status, pickupPerson, notes, date } = item;
        if (!studentId || !status) continue;

        const attendanceDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(new Date(attendanceDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(attendanceDate).setHours(23, 59, 59, 999));

        const existingRecord = await prisma.attendance.findFirst({
          where: {
            studentId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        });

        if (existingRecord) {
          const updated = await prisma.attendance.update({
            where: { id: existingRecord.id },
            data: {
              status,
              pickupPerson: pickupPerson || null,
              notes: notes || null,
            },
          });
          results.push(updated);
        } else {
          const created = await prisma.attendance.create({
            data: {
              studentId,
              status,
              pickupPerson: pickupPerson || null,
              notes: notes || null,
              date: attendanceDate,
            },
          });
          results.push(created);
        }
      }

      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    // Đơn lẻ
    const { studentId, status, pickupPerson, notes, date } = body;

    if (!studentId || !status) {
      return NextResponse.json(
        { error: "Thiếu thông tin học sinh hoặc trạng thái điểm danh." },
        { status: 400 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(new Date(attendanceDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(attendanceDate).setHours(23, 59, 59, 999));

    const existingRecord = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    let record;
    if (existingRecord) {
      record = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          status,
          pickupPerson: pickupPerson || null,
          notes: notes || null,
        },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          studentId,
          status,
          pickupPerson: pickupPerson || null,
          notes: notes || null,
          date: attendanceDate,
        },
      });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể lưu điểm danh.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa bản ghi điểm danh
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");
    const dateStr = searchParams.get("date");

    if (id) {
      await prisma.attendance.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa bản ghi điểm danh thành công." });
    }

    if (studentId && dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

      await prisma.attendance.deleteMany({
        where: {
          studentId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });
      return NextResponse.json({ success: true, message: "Đã xóa bản ghi điểm danh ngày này thành công." });
    }

    return NextResponse.json({ error: "Thiếu ID hoặc studentId + date cần xóa." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa điểm danh.", details: error.message },
      { status: 500 }
    );
  }
}
