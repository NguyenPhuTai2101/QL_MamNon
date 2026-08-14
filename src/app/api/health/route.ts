import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách hồ sơ sức khỏe và lịch sử phát triển thể chất của học sinh
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    let whereClause = {};
    if (studentId) {
      whereClause = { studentId };
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            class: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(healthRecords);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải hồ sơ sức khỏe.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc cập nhật chỉ số chiều cao, cân nặng, dị ứng của trẻ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, heightCm, weightKg, allergies, bloodType, notes } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Thiếu ID học sinh." }, { status: 400 });
    }

    const height = heightCm ? parseFloat(heightCm) : null;
    const weight = weightKg ? parseFloat(weightKg) : null;

    // Check if record exists for this student
    const existing = await prisma.healthRecord.findFirst({
      where: { studentId }
    });

    let result;
    if (existing) {
      result = await prisma.healthRecord.update({
        where: { id: existing.id },
        data: {
          heightCm: height,
          weightKg: weight,
          allergies: allergies || null,
          bloodType: bloodType || null,
          notes: notes || null,
        }
      });
    } else {
      result = await prisma.healthRecord.create({
        data: {
          studentId,
          heightCm: height,
          weightKg: weight,
          allergies: allergies || null,
          bloodType: bloodType || null,
          notes: notes || null,
        }
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể lưu hồ sơ sức khỏe.", details: error.message },
      { status: 500 }
    );
  }
}

// PUT / PATCH: Cập nhật hồ sơ sức khỏe
export async function PUT(request: Request) {
  return POST(request);
}

export async function PATCH(request: Request) {
  return POST(request);
}

// DELETE: Xóa hồ sơ sức khỏe
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");

    if (id) {
      await prisma.healthRecord.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa hồ sơ sức khỏe thành công." });
    }

    if (studentId) {
      await prisma.healthRecord.deleteMany({ where: { studentId } });
      return NextResponse.json({ success: true, message: "Đã xóa hồ sơ sức khỏe của học sinh thành công." });
    }

    return NextResponse.json({ error: "Thiếu ID hoặc studentId cần xóa." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Không thể xóa hồ sơ sức khỏe.", details: error.message },
      { status: 500 }
    );
  }
}
