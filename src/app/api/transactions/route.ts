import { NextResponse } from "next/server";

const mockTransactions = [
  { id: "1", date: "2026-08-01", type: "INCOME", category: "TUITION", amount: 15000000, description: "Học phí tháng 8 Lớp Mầm 1", createdBy: "Admin" },
  { id: "2", date: "2026-08-02", type: "EXPENSE", category: "KITCHEN", amount: 2500000, description: "Mua thực phẩm tuần 1", createdBy: "Thủ quỹ" },
  { id: "3", date: "2026-08-03", type: "INCOME", category: "MEAL_FEE", amount: 5000000, description: "Phí bán trú tháng 8 Lớp Mầm 1", createdBy: "Admin" },
  { id: "4", date: "2026-08-04", type: "EXPENSE", category: "EQUIPMENT", amount: 1200000, description: "Mua văn phòng phẩm", createdBy: "Thủ quỹ" },
  { id: "5", date: "2026-08-05", type: "EXPENSE", category: "UTILITY", amount: 3500000, description: "Thanh toán tiền điện nước tháng 7", createdBy: "Kế toán" },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockTransactions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTransaction = {
      id: Math.random().toString(36).substring(7),
      ...body,
      createdBy: "Admin"
    };
    return NextResponse.json({ success: true, data: newTransaction });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
  }
}
