import { NextResponse } from 'next/server';

let evaluations = [
  {
    id: '1',
    staffId: 'STF001',
    staffName: 'Nguyễn Thị Hoa',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 38,
    feedbackPts: 28,
    totalScore: 96,
    rank: 'EXCELLENT',
    notes: 'Hoàn thành xuất sắc nhiệm vụ, được phụ huynh khen ngợi.'
  },
  {
    id: '2',
    staffId: 'STF002',
    staffName: 'Trần Văn An',
    month: '2026-08',
    attendancePts: 28,
    teachingPts: 35,
    feedbackPts: 25,
    totalScore: 88,
    rank: 'GOOD',
    notes: 'Giảng dạy tốt, cần cải thiện tương tác phụ huynh.'
  },
  {
    id: '3',
    staffId: 'STF003',
    staffName: 'Lê Thu Hương',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 39,
    feedbackPts: 29,
    totalScore: 98,
    rank: 'EXCELLENT',
    notes: 'Giáo án sáng tạo, luôn đi làm đúng giờ.'
  },
  {
    id: '4',
    staffId: 'STF004',
    staffName: 'Phạm Minh Đức',
    month: '2026-08',
    attendancePts: 25,
    teachingPts: 30,
    feedbackPts: 20,
    totalScore: 75,
    rank: 'FAIR',
    notes: 'Thường xuyên đi muộn, cần chú ý giờ giấc.'
  },
  {
    id: '5',
    staffId: 'STF005',
    staffName: 'Hoàng Thị Lan',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 36,
    feedbackPts: 26,
    totalScore: 92,
    rank: 'GOOD',
    notes: 'Hoàn thành tốt nhiệm vụ.'
  },
  {
    id: '6',
    staffId: 'STF006',
    staffName: 'Vũ Ngọc Hùng',
    month: '2026-08',
    attendancePts: 20,
    teachingPts: 25,
    feedbackPts: 15,
    totalScore: 60,
    rank: 'POOR',
    notes: 'Nhiều phụ huynh phàn nàn, cần họp nhắc nhở.'
  }
];

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    data: evaluations,
    total: evaluations.length
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEvaluation = {
      id: Math.random().toString(36).substring(7),
      ...body,
      totalScore: Number(body.attendancePts || 0) + Number(body.teachingPts || 0) + Number(body.feedbackPts || 0)
    };
    evaluations.push(newEvaluation);
    
    return NextResponse.json({
      success: true,
      data: newEvaluation,
      message: 'Đã lưu kết quả đánh giá'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi lưu kết quả đánh giá'
    }, { status: 400 });
  }
}
