import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách nhân viên từ PostgreSQL Supabase
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi tải danh sách nhân sự từ DB', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Thêm nhân viên mới vào CSDL Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, position, phone, email, degree, startDate, assignedClass, salary, notes } = body;

    if (!fullName || !phone || !position) {
      return NextResponse.json({ error: 'Thiếu họ tên, số điện thoại hoặc chức vụ.' }, { status: 400 });
    }

    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        position,
        phone,
        email: email || '',
        degree: degree || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        assignedClass: assignedClass || '',
        salary: salary ? parseFloat(salary) : 8000000,
        notes: notes || '',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể lưu nhân viên vào CSDL', details: error.message }, { status: 500 });
  }
}

// DELETE: Xóa nhân viên khỏi CSDL Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID nhân viên' }, { status: 400 });
    }

    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa nhân viên khỏi CSDL' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể xóa nhân viên khỏi CSDL', details: error.message }, { status: 500 });
  }
}
