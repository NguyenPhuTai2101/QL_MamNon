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

// POST: Tạo hoặc cập nhật (Upsert) hóa đơn học phí cho học sinh
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Hỗ trợ xử lý mảng hóa đơn đồng loạt (Batch sync)
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const { studentId, month, year, amount, status, paymentMethod, breakdownJson } = item;
        if (!studentId || !amount) continue;

        const m = month ? parseInt(month) : new Date().getMonth() + 1;
        const y = year ? parseInt(year) : new Date().getFullYear();

        const existing = await prisma.invoice.findFirst({
          where: { studentId, month: m, year: y },
        });

        if (existing) {
          const updated = await prisma.invoice.update({
            where: { id: existing.id },
            data: {
              amount: parseFloat(amount),
              ...(status ? { status } : {}),
              ...(paymentMethod !== undefined ? { paymentMethod } : {}),
              ...(breakdownJson !== undefined ? { breakdownJson } : {}),
              ...(status === "PAID" ? { paymentDate: new Date() } : status === "UNPAID" ? { paymentDate: null } : {}),
            },
          });
          results.push(updated);
        } else {
          const created = await prisma.invoice.create({
            data: {
              studentId,
              month: m,
              year: y,
              amount: parseFloat(amount),
              status: status || "UNPAID",
              paymentMethod: paymentMethod || null,
              breakdownJson: breakdownJson || null,
              paymentDate: status === "PAID" ? new Date() : null,
            },
          });
          results.push(created);
        }
      }
      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    const { studentId, month, year, amount, status, paymentMethod, breakdownJson } = body;

    if (!studentId || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ thông tin học sinh và số tiền." },
        { status: 400 }
      );
    }

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();
    const invoiceStatus = status || "UNPAID";

    // Kiểm tra xem đã có hóa đơn của học sinh này trong tháng/năm này chưa (Upsert)
    const existing = await prisma.invoice.findFirst({
      where: {
        studentId,
        month: m,
        year: y,
      },
    });

    if (existing) {
      const updated = await prisma.invoice.update({
        where: { id: existing.id },
        data: {
          amount: parseFloat(amount),
          status: invoiceStatus,
          paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
          paymentDate: invoiceStatus === "PAID" ? new Date() : invoiceStatus === "UNPAID" ? null : existing.paymentDate,
          ...(breakdownJson !== undefined ? { breakdownJson } : {}),
        },
        include: {
          student: { include: { class: true } },
        },
      });
      return NextResponse.json({ success: true, isUpdate: true, data: updated });
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        studentId,
        month: m,
        year: y,
        amount: parseFloat(amount),
        status: invoiceStatus,
        paymentMethod: paymentMethod || null,
        paymentDate: invoiceStatus === "PAID" ? new Date() : null,
        breakdownJson: breakdownJson || null,
      },
      include: {
        student: { include: { class: true } },
      },
    });

    return NextResponse.json({ success: true, isUpdate: false, data: newInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể tạo hoặc cập nhật hóa đơn.", details: error.message },
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
