import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET: Lấy danh sách tất cả người dùng (Accounts)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // An toàn: Xóa trường password trước khi trả về client
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      email: u.email,
      phone: u.phone,
      students: u.students,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, data: safeUsers });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách tài khoản:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tạo tài khoản người dùng mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, name, role, email, phone, studentId } = body;

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp đầy đủ thông tin Tên đăng nhập, Mật khẩu, Họ tên và Vai trò!" },
        { status: 400 }
      );
    }

    const lowerUsername = username.toLowerCase().trim();

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    const existing = await prisma.user.findUnique({ where: { username: lowerUsername } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Tên đăng nhập "${lowerUsername}" đã tồn tại trên hệ thống!` },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username: lowerUsername,
        password, // mã hóa/lưu trực tiếp
        name,
        role: role.toUpperCase(),
        email: email || null,
        phone: phone || null,
      }
    });

    // Nếu tạo tài khoản phụ huynh và có truyền studentId -> liên kết học sinh với phụ huynh này
    if (studentId && role === "PARENT") {
      await prisma.student.update({
        where: { id: studentId },
        data: { parentId: newUser.id }
      });
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Tạo tài khoản "${name}" thành công!`,
      data: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role }
    });
  } catch (error: any) {
    console.error("Lỗi tạo tài khoản mới:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật tài khoản người dùng (Sửa thông tin / Đổi mật khẩu / Liên kết học sinh)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, role, email, phone, password, studentId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID người dùng!" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role.toUpperCase();
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password && password.trim() !== "") updateData.password = password;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Liên kết lại học sinh với phụ huynh nếu có
    if (studentId && updatedUser.role === "PARENT") {
      await prisma.student.update({
        where: { id: studentId },
        data: { parentId: updatedUser.id }
      });
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Cập nhật tài khoản "${updatedUser.name}" thành công!`,
      data: { id: updatedUser.id, username: updatedUser.username, name: updatedUser.name, role: updatedUser.role }
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật tài khoản:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa tài khoản người dùng
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID tài khoản cần xóa!" }, { status: 400 });
    }

    // Bỏ liên kết học sinh trước khi xóa
    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null }
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "🎉 Đã xóa tài khoản khỏi CSDL thành công!" });
  } catch (error: any) {
    console.error("Lỗi xóa tài khoản:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
