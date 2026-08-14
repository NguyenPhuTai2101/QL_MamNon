import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách hóa đơn học phí từ Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(month ? { month: parseInt(month) } : {}),
        ...(year ? { year: parseInt(year) } : {}),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải hóa đơn học phí.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hóa đơn học phí mới cho học sinh
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, month, year, amount } = body;

    if (!studentId || !month || !year || !amount) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ thông tin học sinh, tháng, năm và số tiền." },
        { status: 400 }
      );
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        studentId,
        month: parseInt(month),
        year: parseInt(year),
        amount: parseFloat(amount),
        status: "UNPAID",
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể tạo hóa đơn mới.", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH / PUT: Cập nhật thông tin hoặc trạng thái thanh toán của hóa đơn
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, amount, paymentMethod, month, year } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID hóa đơn cần cập nhật." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.paymentDate = status === "PAID" ? new Date() : null;
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (month !== undefined) updateData.month = parseInt(month);
    if (year !== undefined) updateData.year = parseInt(year);

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: { class: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể cập nhật hóa đơn.", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

// DELETE: Xóa hoặc hủy hóa đơn học phí
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID hóa đơn cần xóa." }, { status: 400 });
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa hóa đơn học phí thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa hóa đơn.", details: error.message },
      { status: 500 }
    );
  }
}
