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
    const { 
      fullName, 
      dob, 
      cccd, 
      phone, 
      email, 
      position, 
      specialty, 
      degree, 
      startDate, 
      assignedClass, 
      workDays, 
      leaveDays, 
      salary, 
      notes 
    } = body;

    if (!fullName || !phone || !position) {
      return NextResponse.json({ error: 'Thiếu họ tên, số điện thoại hoặc chức vụ.' }, { status: 400 });
    }

    const newStaff = await prisma.staff.create({
      data: {
        fullName,
        dob: dob ? new Date(dob) : null,
        cccd: cccd || '',
        phone,
        email: email || '',
        position,
        specialty: specialty || '',
        degree: degree || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        assignedClass: assignedClass || '',
        workDays: workDays ? parseInt(workDays) : 26,
        leaveDays: leaveDays ? parseInt(leaveDays) : 0,
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

// PUT: Cập nhật thông tin nhân viên trong CSDL Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id,
      fullName, 
      dob, 
      cccd, 
      phone, 
      email, 
      position, 
      specialty, 
      degree, 
      startDate, 
      assignedClass, 
      workDays, 
      leaveDays, 
      salary, 
      notes 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID nhân viên' }, { status: 400 });
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        fullName,
        dob: dob ? new Date(dob) : undefined,
        cccd,
        phone,
        email,
        position,
        specialty,
        degree,
        startDate: startDate ? new Date(startDate) : undefined,
        assignedClass,
        workDays: workDays !== undefined ? parseInt(workDays) : undefined,
        leaveDays: leaveDays !== undefined ? parseInt(leaveDays) : undefined,
        salary: salary !== undefined ? parseFloat(salary) : undefined,
        notes,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể cập nhật nhân viên', details: error.message }, { status: 500 });
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
