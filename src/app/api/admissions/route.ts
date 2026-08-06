import { NextResponse } from 'next/server';

// Mock data
const leads = [
  { id: 1, parentName: 'Nguyễn Thị Hương', childName: 'Trần Minh Tuấn', ageGroup: '3-4 tuổi', phone: '0901234567', email: 'huong.nguyen@example.com', source: 'Facebook', status: 'NEW', date: '2026-08-01' },
  { id: 2, parentName: 'Trần Văn Dũng', childName: 'Lê Mai Trang', ageGroup: '4-5 tuổi', phone: '0901234568', email: 'dung.tran@example.com', source: 'Website', status: 'CONTACTED', date: '2026-08-02' },
  { id: 3, parentName: 'Lê Thị Thu', childName: 'Phạm Gia Bảo', ageGroup: '2-3 tuổi', phone: '0901234569', email: 'thu.le@example.com', source: 'Giới thiệu', status: 'VISITED', date: '2026-08-03' },
  { id: 4, parentName: 'Phạm Văn Thành', childName: 'Hoàng Bảo Yến', ageGroup: '5-6 tuổi', phone: '0901234570', email: 'thanh.pham@example.com', source: 'Google', status: 'ENROLLED', date: '2026-08-04' },
  { id: 5, parentName: 'Hoàng Thị Lan', childName: 'Nguyễn Quốc Việt', ageGroup: '3-4 tuổi', phone: '0901234571', email: 'lan.hoang@example.com', source: 'Facebook', status: 'REJECTED', date: '2026-08-05' },
  { id: 6, parentName: 'Ngô Văn Nam', childName: 'Đinh Phương Anh', ageGroup: '2-3 tuổi', phone: '0901234572', email: 'nam.ngo@example.com', source: 'Zalo', status: 'NEW', date: '2026-08-06' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLead = {
      id: leads.length + 1,
      ...body,
      date: new Date().toISOString().split('T')[0]
    };
    leads.push(newLead);
    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 400 });
  }
}
