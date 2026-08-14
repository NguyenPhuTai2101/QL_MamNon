import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách tài sản từ PostgreSQL Supabase
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi tải danh sách tài sản từ CSDL', details: error.message }, { status: 500 });
  }
}

// POST: Thêm tài sản mới vào Supabase DB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, location, quantity, unitPrice, status } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Thiếu tên tài sản hoặc loại tài sản.' }, { status: 400 });
    }

    const newAsset = await prisma.asset.create({
      data: {
        code: `TS${Date.now().toString().slice(-4)}`,
        name,
        category,
        location: location || 'Kho trường',
        quantity: quantity ? parseInt(quantity) : 1,
        unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
        status: status || 'GOOD',
      },
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể thêm tài sản vào CSDL', details: error.message }, { status: 500 });
  }
}

// PUT / PATCH: Cập nhật thông tin tài sản & cơ sở vật chất
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, location, quantity, unitPrice, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID tài sản cần cập nhật.' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
    if (status) updateData.status = status;

    const updated = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể cập nhật tài sản.', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

// DELETE: Xóa tài sản khỏi CSDL Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID tài sản' }, { status: 400 });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa tài sản khỏi CSDL' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể xóa tài sản khỏi CSDL', details: error.message }, { status: 500 });
  }
}
