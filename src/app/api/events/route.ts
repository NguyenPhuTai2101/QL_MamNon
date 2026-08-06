import { NextResponse } from "next/server";

// Mock data for events and announcements
let events = [
  {
    id: "1",
    title: "Khai giảng năm học mới 2026-2027",
    description: "Lễ khai giảng năm học mới dành cho toàn bộ học sinh và giáo viên.",
    date: "2026-09-05",
    endDate: "2026-09-05",
    type: "EVENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "2",
    title: "Họp phụ huynh đầu năm",
    description: "Triển khai kế hoạch năm học mới và các hoạt động của trường.",
    date: "2026-09-12",
    endDate: "2026-09-12",
    type: "EVENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "3",
    title: "Nghỉ lễ Quốc khánh 2/9",
    description: "Toàn trường nghỉ lễ Quốc khánh theo quy định của nhà nước.",
    date: "2026-09-02",
    endDate: "2026-09-03",
    type: "HOLIDAY",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Phòng Hành chính",
  },
  {
    id: "4",
    title: "Thông báo thu học phí tháng 9",
    description: "Đề nghị quý phụ huynh hoàn thành học phí tháng 9 trước ngày 10/09.",
    date: "2026-09-01",
    endDate: "2026-09-10",
    type: "ANNOUNCEMENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Phòng Kế toán",
  },
  {
    id: "5",
    title: "Thông báo phòng dịch Sốt xuất huyết",
    description: "Tăng cường vệ sinh, diệt muỗi, lăng quăng tại các khu vực lớp học.",
    date: "2026-08-15",
    endDate: "2026-08-30",
    type: "ANNOUNCEMENT",
    priority: "URGENT",
    targetClass: null,
    createdBy: "Y tế học đường",
  },
  {
    id: "6",
    title: "Nghỉ Tết Trung thu",
    description: "Học sinh được nghỉ học buổi chiều để tham gia rước đèn.",
    date: "2026-09-25",
    endDate: "2026-09-25",
    type: "HOLIDAY",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "7",
    title: "Tham quan dã ngoại Thảo Cầm Viên",
    description: "Chương trình dã ngoại học tập ngoại khóa cho các khối Mầm, Chồi, Lá.",
    date: "2026-10-15",
    endDate: "2026-10-15",
    type: "EVENT",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Phòng Đào tạo",
  },
  {
    id: "8",
    title: "Thay đổi lịch học thể dục Lớp Chồi 1",
    description: "Lịch học thể dục chuyển từ sáng Thứ 3 sang chiều Thứ 4.",
    date: "2026-08-20",
    endDate: "2026-08-20",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    targetClass: "Chồi 1",
    createdBy: "Giáo viên Thể chất",
  },
];

export async function GET() {
  return NextResponse.json({ data: events });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEvent = {
      id: Math.random().toString(36).substring(7),
      ...body,
      date: body.date || new Date().toISOString().split("T")[0],
    };
    events.push(newEvent);
    return NextResponse.json({ message: "Thêm thành công", data: newEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
