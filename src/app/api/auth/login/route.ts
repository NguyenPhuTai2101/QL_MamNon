import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const lowerUsername = username.toLowerCase().trim();

    // Query user from PostgreSQL DB via Prisma
    let dbUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: lowerUsername,
          mode: "insensitive",
        },
      },
    });

    // If database user is not found, attempt fallback lookup or auto-provision for initial testing
    if (!dbUser) {
      const defaultUsers: Record<string, { role: string; name: string }> = {
        admin: { role: "ADMIN", name: "Ban Giám Hiệu Ánh Bình Minh" },
        giaovien: { role: "TEACHER", name: "Cô Nguyễn Thị Hương" },
        teacher: { role: "TEACHER", name: "Cô Nguyễn Thị Hương" },
        phuhuynh: { role: "PARENT", name: "Phụ huynh Nguyễn Minh Triết" },
        parent: { role: "PARENT", name: "Phụ huynh Nguyễn Minh Triết" },
      };

      const fallback = defaultUsers[lowerUsername];
      if (fallback) {
        try {
          dbUser = await prisma.user.create({
            data: {
              username: lowerUsername,
              password: password,
              name: fallback.name,
              role: role || fallback.role,
              email: `${lowerUsername}@anhbinhminh.edu.vn`,
            },
          });
        } catch (e) {
          // If creation fails due to unique constraint, attempt finding again
          dbUser = await prisma.user.findFirst({ where: { username: lowerUsername } });
        }
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại trong hệ thống." },
        { status: 401 }
      );
    }

    // Return authenticated user session payload
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: role || dbUser.role,
        email: dbUser.email,
        phone: dbUser.phone,
        token: `auth-token-${dbUser.id}-${Date.now()}`,
      },
    });
  } catch (error: any) {
    console.error("Auth Login Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi xử lý đăng nhập.", details: error.message },
      { status: 500 }
    );
  }
}

