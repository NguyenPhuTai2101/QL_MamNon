import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Truy vấn danh sách chi phí thực phẩm theo ngày / tháng / năm từ CSDL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause = {};
    if (dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(new Date(dateStr).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(dateStr).setHours(23, 59, 59, 999));
      whereClause = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const ingredients = await prisma.ingredientCost.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(ingredients);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách chi phí thực phẩm.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Thêm mới hoặc nhập thực phẩm đi chợ vào kho (Hỗ trợ cả đơn lẻ và hàng loạt)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Hỗ trợ nhập thực phẩm hàng loạt
    const items = Array.isArray(body) ? body : (body.items && Array.isArray(body.items)) ? body.items : null;
    const replaceForDate = body.replaceForDate || false;
    const targetDateStr = body.date;

    if (items) {
      // Nếu có yêu cầu ghi đè theo ngày, xóa các bản ghi cũ của ngày đó trước khi lưu danh sách mới
      if (replaceForDate && targetDateStr) {
        const startOfDay = new Date(new Date(targetDateStr).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(targetDateStr).setHours(23, 59, 59, 999));
        await prisma.ingredientCost.deleteMany({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });
      }

      const createdList = [];
      for (const item of items) {
        const { name, quantity, unit, unitPrice, notes, date } = item;
        if (!name) continue;
        const qty = quantity !== undefined && quantity !== null ? parseFloat(quantity) : 0;
        const price = parseFloat(unitPrice) || 0;
        const totalCost = qty * price;

        const created = await prisma.ingredientCost.create({
          data: {
            name,
            quantity: isNaN(qty) ? 0 : qty,
            unit: unit || "kg",
            unitPrice: price,
            totalCost,
            notes: notes || null,
            date: date ? new Date(date) : (targetDateStr ? new Date(targetDateStr) : new Date()),
          },
        });
        createdList.push(created);
      }
      return NextResponse.json({ success: true, count: createdList.length, data: createdList }, { status: 201 });
    }

    // Đơn lẻ
    const { name, quantity, unit, unitPrice, notes, date } = body;

    if (!name || quantity === undefined || !unit || unitPrice === undefined) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp tên nguyên liệu, số lượng, đơn vị và đơn giá." },
        { status: 400 }
      );
    }

    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const totalCost = qty * price;

    const newIngredient = await prisma.ingredientCost.create({
      data: {
        name,
        quantity: qty,
        unit,
        unitPrice: price,
        totalCost,
        notes,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: newIngredient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể thêm nguyên liệu thực phẩm.", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH / PUT: Cập nhật thông tin hoặc khối lượng nguyên liệu thực phẩm
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, quantity, unit, unitPrice, notes, date } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID nguyên liệu cần cập nhật." }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
    if (updateData.quantity !== undefined && updateData.unitPrice !== undefined) {
      updateData.totalCost = updateData.quantity * updateData.unitPrice;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (date !== undefined) updateData.date = new Date(date);

    const updated = await prisma.ingredientCost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể cập nhật nguyên liệu.", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa thực phẩm khỏi danh sách
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID nguyên liệu cần xóa." }, { status: 400 });
    }

    await prisma.ingredientCost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa nguyên liệu thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa nguyên liệu.", details: error.message },
      { status: 500 }
    );
  }
}
