import { NextResponse } from 'next/server';

let staffData = [
  { id: '1', fullName: 'Nguyễn Thị Hương', position: 'TEACHER', phone: '0987654321', email: 'huong.nt@example.com', degree: 'Đại học', startDate: '2023-08-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 12000000, notes: '' },
  { id: '2', fullName: 'Trần Văn Mạnh', position: 'GUARD', phone: '0912345678', email: 'manh.tv@example.com', degree: 'Trung học phổ thông', startDate: '2022-05-15', assignedClass: '', status: 'ACTIVE', salary: 7000000, notes: '' },
  { id: '3', fullName: 'Lê Thị Lan', position: 'COOK', phone: '0909090909', email: 'lan.lt@example.com', degree: 'Chứng chỉ nghề', startDate: '2024-01-10', assignedClass: '', status: 'ON_LEAVE', salary: 8500000, notes: 'Nghỉ sinh' },
  { id: '4', fullName: 'Phạm Minh Tuấn', position: 'ADMIN_STAFF', phone: '0888888888', email: 'tuan.pm@example.com', degree: 'Cao đẳng', startDate: '2023-11-20', assignedClass: '', status: 'ACTIVE', salary: 10000000, notes: '' },
  { id: '5', fullName: 'Đỗ Thu Hà', position: 'ASSISTANT', phone: '0777777777', email: 'ha.dt@example.com', degree: 'Cao đẳng', startDate: '2024-02-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 8000000, notes: '' },
  { id: '6', fullName: 'Hoàng Quốc Việt', position: 'TEACHER', phone: '0666666666', email: 'viet.hq@example.com', degree: 'Đại học', startDate: '2021-09-05', assignedClass: 'Lá 2', status: 'RESIGNED', salary: 13000000, notes: '' },
];

export async function GET() {
  return NextResponse.json(staffData);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStaff = {
      id: Date.now().toString(),
      ...body,
      status: body.status || 'ACTIVE',
    };
    staffData.push(newStaff);
    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
