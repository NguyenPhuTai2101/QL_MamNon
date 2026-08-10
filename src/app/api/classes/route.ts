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

// PUT: Cập nhật thông tin Lớp học
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, room, teacher } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID lớp học" }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(room ? { room } : {}),
        ...(teacher ? { teacher } : {}),
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi cập nhật lớp học", details: error.message }, { status: 500 });
  }
}

// DELETE: Xóa Lớp học khỏi CSDL
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID lớp học" }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa lớp học thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Không thể xóa lớp học do còn học sinh hoặc ràng buộc CSDL", details: error.message }, { status: 500 });
  }
}
