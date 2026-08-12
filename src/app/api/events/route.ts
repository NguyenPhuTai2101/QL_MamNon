import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi khi tải danh sách sự kiện từ CSDL", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, endDate, type, priority, targetClass, createdBy } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Thiếu tiêu đề sự kiện" }, { status: 400 });
    }

    const eventDate = date ? new Date(date) : new Date();
    const eventEndDate = endDate ? new Date(endDate) : eventDate;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: eventDate,
        endDate: eventEndDate,
        type: type || "EVENT",
        priority: priority || "NORMAL",
        targetClass: targetClass || null,
        createdBy: createdBy || "Ban Giám Hiệu",
      },
    });

    return NextResponse.json({ success: true, message: "Thêm thành công", data: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Không thể tạo sự kiện", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID sự kiện cần xóa" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa sự kiện thành công" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Không thể xóa sự kiện khỏi CSDL", details: error.message }, { status: 500 });
  }
}

