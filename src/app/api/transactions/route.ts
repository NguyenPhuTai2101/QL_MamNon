import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách Sổ Thu Chi từ PostgreSQL Supabase
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi tải Sổ thu chi từ CSDL", details: error.message }, { status: 500 });
  }
}

// POST: Thêm bút toán Thu/Chi mới vào Supabase DB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, type, category, amount, description, createdBy } = body;

    if (!amount || !description) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập số tiền và nội dung bút toán." }, { status: 400 });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        date: date ? new Date(date) : new Date(),
        type: type || "INCOME",
        category: category || "OTHER",
        amount: parseFloat(amount),
        description,
        createdBy: createdBy || "Admin",
      },
    });

    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Không thể lưu bút toán vào CSDL", details: error.message }, { status: 500 });
  }
}

// DELETE: Xóa bút toán khỏi CSDL Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID bút toán" }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bút toán khỏi CSDL" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Không thể xóa bút toán khỏi CSDL", details: error.message }, { status: 500 });
  }
}
