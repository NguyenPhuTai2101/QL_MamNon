import { NextResponse } from "next/server";

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

    // Default mock accounts for quick testing & demonstration
    const mockAccounts: Record<string, { role: string; name: string }> = {
      admin: { role: "ADMIN", name: "Admin NVSOFT" },
      giaovien: { role: "TEACHER", name: "Cô Nguyễn Thị Mai" },
      phuhuynh: { role: "PARENT", name: "Phụ huynh Nguyễn Minh Triết" },
    };

    const user = mockAccounts[username.toLowerCase()];

    if (!user || password !== "123456") {
      return NextResponse.json(
        { error: "Tài khoản hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Return authenticated user token payload
    return NextResponse.json({
      success: true,
      user: {
        username,
        name: user.name,
        role: role || user.role,
        token: `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi xử lý đăng nhập." },
      { status: 500 }
    );
  }
}
