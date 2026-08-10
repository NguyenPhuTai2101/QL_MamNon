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
