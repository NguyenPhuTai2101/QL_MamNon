import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách học sinh từ Supabase PostgreSQL
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        healthRecords: true,
        attendances: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách học sinh.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Thêm học sinh mới vào Supabase PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, gender, parentName, parentPhone, classId } = body;

    if (!firstName || !lastName || !parentName || !parentPhone || !classId) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin bắt buộc của học sinh và phụ huynh." },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : new Date("2021-01-01"),
        gender: gender || "Nam",
        parentName,
        parentPhone,
        classId,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể thêm học sinh mới.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa học sinh theo ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID học sinh cần xóa." }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa học sinh thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa học sinh.", details: error.message },
      { status: 500 }
    );
  }
}
