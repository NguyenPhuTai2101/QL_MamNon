import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách Lớp học kèm số lượng học sinh
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách lớp học.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo lớp học mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, room, teacher } = body;

    if (!name || !teacher) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên lớp và tên giáo viên chủ nhiệm." },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        room: room || "Phòng học",
        teacher,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể tạo lớp học mới.", details: error.message },
      { status: 500 }
    );
  }
}
