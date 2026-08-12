import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    console.error('Error fetching leads from database:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách tuyển sinh từ CSDL', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createdLead = await prisma.lead.create({
      data: {
        parentName: body.parentName || 'Chưa cập nhật',
        childName: body.childName || 'Chưa cập nhật',
        childAgeGroup: body.childAgeGroup || body.ageGroup || '3-4T',
        phone: body.phone || '',
        email: body.email || null,
        source: body.source || 'Website đăng ký online',
        status: body.status || 'NEW',
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: createdLead }, { status: 201 });
  } catch (error: any) {
    console.error('Error in admissions API:', error);
    return NextResponse.json({ success: false, error: 'Không thể thêm hồ sơ tuyển sinh vào CSDL', details: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Thiếu ID hoặc trạng thái' }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: String(id) },
      data: { status },
    });
    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Không thể cập nhật trạng thái tuyển sinh', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu ID' }, { status: 400 });

    await prisma.lead.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true, message: 'Đã xóa hồ sơ tuyển sinh khỏi CSDL' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Không thể xóa hồ sơ tuyển sinh', details: error.message }, { status: 500 });
  }
}
