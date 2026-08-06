import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fallback in-memory store if DB is temporarily unreachable in dev/preview
let mockLeads = [
  { id: '1', parentName: 'Nguyễn Thị Hương', childName: 'Trần Minh Tuấn', childAgeGroup: '3-4 tuổi', phone: '0901234567', email: 'huong.nguyen@example.com', source: 'Facebook', status: 'NEW', notes: 'Hỏi về học phí', createdAt: new Date('2026-08-01') },
  { id: '2', parentName: 'Trần Văn Dũng', childName: 'Lê Mai Trang', childAgeGroup: '4-5 tuổi', phone: '0901234568', email: 'dung.tran@example.com', source: 'Website', status: 'CONTACTED', notes: 'Đã gọi tư vấn', createdAt: new Date('2026-08-02') },
  { id: '3', parentName: 'Lê Thị Thu', childName: 'Phạm Gia Bảo', childAgeGroup: '2-3 tuổi', phone: '0901234569', email: 'thu.le@example.com', source: 'Giới thiệu', status: 'VISITED', notes: 'Đã hẹn t7 qua trường', createdAt: new Date('2026-08-03') },
  { id: '4', parentName: 'Phạm Văn Thành', childName: 'Hoàng Bảo Yến', childAgeGroup: '5-6 tuổi', phone: '0901234570', email: 'thanh.pham@example.com', source: 'Google', status: 'ENROLLED', notes: 'Đã đóng học phí', createdAt: new Date('2026-08-04') },
  { id: '5', parentName: 'Hoàng Thị Lan', childName: 'Nguyễn Quốc Việt', childAgeGroup: '3-4 tuổi', phone: '0901234571', email: 'lan.hoang@example.com', source: 'Facebook', status: 'REJECTED', notes: 'Trường xa nhà', createdAt: new Date('2026-08-05') },
  { id: '6', parentName: 'Ngô Văn Nam', childName: 'Đinh Phương Anh', childAgeGroup: '2-3 tuổi', phone: '0901234572', email: 'nam.ngo@example.com', source: 'Zalo', status: 'NEW', notes: 'Xin thực đơn', createdAt: new Date('2026-08-06') },
];

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads.length > 0 ? leads : mockLeads });
  } catch (error) {
    console.error('Error fetching leads from database:', error);
    return NextResponse.json({ success: true, data: mockLeads });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let createdLead;
    try {
      createdLead = await prisma.lead.create({
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
    } catch (dbErr) {
      console.warn('Prisma DB insert fallback to memory store:', dbErr);
      createdLead = {
        id: Date.now().toString(),
        parentName: body.parentName,
        childName: body.childName,
        childAgeGroup: body.childAgeGroup || body.ageGroup || '3-4T',
        phone: body.phone,
        email: body.email,
        source: body.source || 'Website đăng ký online',
        status: body.status || 'NEW',
        notes: body.notes,
        createdAt: new Date(),
      };
      mockLeads.unshift(createdLead);
    }

    return NextResponse.json({ success: true, data: createdLead }, { status: 201 });
  } catch (error) {
    console.error('Error in admissions API:', error);
    return NextResponse.json({ success: false, error: 'Failed to process registration' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    try {
      const updatedLead = await prisma.lead.update({
        where: { id: String(id) },
        data: { status },
      });
      return NextResponse.json({ success: true, data: updatedLead });
    } catch (dbErr) {
      mockLeads = mockLeads.map(l => String(l.id) === String(id) ? { ...l, status } : l);
      const updated = mockLeads.find(l => String(l.id) === String(id));
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    try {
      await prisma.lead.delete({ where: { id: String(id) } });
    } catch (dbErr) {
      mockLeads = mockLeads.filter(l => String(l.id) !== String(id));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
