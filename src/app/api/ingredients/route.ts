import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Truy vấn danh sách chi phí thực phẩm theo tháng/năm từ Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause = {};
    if (month && year) {
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

// POST: Nhập thực phẩm mới vào kho
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, quantity, unit, unitPrice, notes, date } = body;

    if (!name || !quantity || !unit || !unitPrice) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp tên nguyên liệu, số lượng, đơn vị và đơn giá." },
        { status: 400 }
      );
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
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

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể thêm nguyên liệu thực phẩm.", details: error.message },
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
