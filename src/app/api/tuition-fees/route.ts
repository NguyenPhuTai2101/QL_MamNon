import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách các khoản thu và bảng giá học phí từ CSDL
export async function GET() {
  try {
    const fees = await prisma.tuitionFee.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: fees });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi tải biểu phí từ CSDL", details: error.message, data: [] },
      { status: 500 }
    );
  }
}

// POST: Thêm khoản thu / biểu phí mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, amount, type, appliedClass, isActive, description } = body;

    if (!name || amount === undefined || amount === null) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên khoản thu và số tiền định mức." },
        { status: 400 }
      );
    }

    const newFee = await prisma.tuitionFee.create({
      data: {
        name,
        amount: parseFloat(amount),
        type: type || "MONTHLY",
        appliedClass: appliedClass || "ALL",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: newFee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Không thể lưu khoản thu mới vào CSDL.", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH / PUT: Cập nhật thông tin khoản thu
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, amount, type, appliedClass, isActive, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã ID khoản thu cần chỉnh sửa." },
        { status: 400 }
      );
    }

    const updated = await prisma.tuitionFee.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
        ...(type ? { type } : {}),
        ...(appliedClass !== undefined ? { appliedClass } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật khoản thu.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa khoản thu khỏi bảng cấu hình
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID khoản thu cần xóa." },
        { status: 400 }
      );
    }

    await prisma.tuitionFee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa khoản thu thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Không thể xóa khoản thu khỏi CSDL.", details: error.message },
      { status: 500 }
    );
  }
}
