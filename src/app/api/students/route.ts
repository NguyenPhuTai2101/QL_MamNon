import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách học sinh từ Supabase PostgreSQL
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        healthRecords: true,
        attendances: {
          orderBy: { date: "desc" },
          take: 5,
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách học sinh.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Thêm học sinh mới vào Supabase PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { firstName, lastName, name, birthDate, gender, parentName, parentPhone, classId, className, address } = body;

    // Tự tách name thành firstName & lastName nếu client truyền `name`
    if (name && (!firstName || !lastName)) {
      const parts = name.trim().split(" ");
      lastName = parts[0] || "Nguyễn";
      firstName = parts.slice(1).join(" ") || parts[0] || "Học sinh";
    }

    if (!firstName || !parentName || !parentPhone) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin tên học sinh và số điện thoại phụ huynh." },
        { status: 400 }
      );
    }

    // Nếu client chỉ truyền className (ví dụ "12 – 24 tháng" hoặc "Mầm 1"), tự động lookup hoặc tạo Class
    if (!classId) {
      const targetClassName = className || "12 – 24 tháng";
      let existingClass = await prisma.class.findFirst({
        where: { name: { contains: targetClassName } },
      });

      if (!existingClass) {
        existingClass = await prisma.class.findFirst();
      }

      if (!existingClass) {
        existingClass = await prisma.class.create({
          data: {
            name: targetClassName,
            teacher: "Cô Nguyễn Thị Hương",
            room: "Phòng 101",
          },
        });
      }

      classId = existingClass.id;
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: firstName || "Học sinh",
        lastName: lastName || "Nguyễn",
        birthDate: birthDate ? new Date(birthDate) : new Date("2022-01-01"),
        gender: gender || "Nam",
        parentName,
        parentPhone,
        address: address || "TP. Hồ Chí Minh",
        classId,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể thêm học sinh mới vào database.", details: error.message },
      { status: 500 }
    );
  }
}

// PUT / PATCH: Cập nhật thông tin học sinh
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let { id, firstName, lastName, name, birthDate, gender, parentName, parentPhone, classId, className, address } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID học sinh cần cập nhật." }, { status: 400 });
    }

    if (name && (!firstName || !lastName)) {
      const parts = name.trim().split(" ");
      lastName = parts[0] || "Nguyễn";
      firstName = parts.slice(1).join(" ") || parts[0] || "Học sinh";
    }

    // Nếu truyền className thay vì classId
    if (className && !classId) {
      const foundClass = await prisma.class.findFirst({
        where: { name: { contains: className } },
      });
      if (foundClass) {
        classId = foundClass.id;
      }
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (gender) updateData.gender = gender;
    if (parentName) updateData.parentName = parentName;
    if (parentPhone) updateData.parentPhone = parentPhone;
    if (address !== undefined) updateData.address = address;
    if (classId) updateData.classId = classId;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { class: true },
    });

    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể cập nhật thông tin học sinh.", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

// DELETE: Xóa học sinh theo ID (Tự động xóa các dữ liệu liên quan: Điểm danh, Sức khỏe, Hóa đơn)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID học sinh cần xóa." }, { status: 400 });
    }

    // 1. Xóa các bản ghi điểm danh liên quan
    await prisma.attendance.deleteMany({
      where: { studentId: id },
    });

    // 2. Xóa các hồ sơ sức khỏe liên quan
    await prisma.healthRecord.deleteMany({
      where: { studentId: id },
    });

    // 3. Xóa các hóa đơn liên quan
    await prisma.invoice.deleteMany({
      where: { studentId: id },
    });

    // 4. Xóa Học sinh chính thức
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa học sinh và các dữ liệu liên quan thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa học sinh.", details: error.message },
      { status: 500 }
    );
  }
}
