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
    let { firstName, lastName, name, birthDate, gender, parentName, parentPhone, classId, className, address } = body;

    // Tự tách name thành firstName & lastName nếu client truyền `name`
    if (name && (!firstName || !lastName)) {
      const parts = name.trim().split(" ");
      lastName = parts[0] || "Nguyễn";
      firstName = parts.slice(1).join(" ") || parts[0] || "Học sinh";
    }

    if (!firstName || !parentName || !parentPhone) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin tên học sinh và số điện thoại phụ huynh." },
        { status: 400 }
      );
    }

    // Nếu client chỉ truyền className (ví dụ "12 – 24 tháng" hoặc "Mầm 1"), tự động lookup hoặc tạo Class
    if (!classId) {
      const targetClassName = className || "12 – 24 tháng";
      let existingClass = await prisma.class.findFirst({
        where: { name: { contains: targetClassName } },
      });

      if (!existingClass) {
        existingClass = await prisma.class.findFirst();
      }

      if (!existingClass) {
        existingClass = await prisma.class.create({
          data: {
            name: targetClassName,
            teacher: "Cô Nguyễn Thị Hương",
            room: "Phòng 101",
          },
        });
      }

      classId = existingClass.id;
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: firstName || "Học sinh",
        lastName: lastName || "Nguyễn",
        birthDate: birthDate ? new Date(birthDate) : new Date("2022-01-01"),
        gender: gender || "Nam",
        parentName,
        parentPhone,
        address: address || "TP. Hồ Chí Minh",
        classId,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể thêm học sinh mới vào database.", details: error.message },
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
