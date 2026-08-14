import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const evaluations = await prisma.evaluation.findMany({
      where: {
        ...(month ? { month } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: evaluations,
      total: evaluations.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Lỗi khi tải kết quả đánh giá nhân sự',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, staffName, month, attendancePts, teachingPts, feedbackPts, rank, notes } = body;

    if (!staffName || !month) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu tên nhân viên hoặc tháng đánh giá'
      }, { status: 400 });
    }

    const att = Number(attendancePts || 0);
    const teach = Number(teachingPts || 0);
    const fb = Number(feedbackPts || 0);
    const totalScore = att + teach + fb;

    let computedRank = rank;
    if (!computedRank) {
      if (totalScore >= 90) computedRank = 'EXCELLENT';
      else if (totalScore >= 80) computedRank = 'GOOD';
      else if (totalScore >= 70) computedRank = 'FAIR';
      else computedRank = 'POOR';
    }

    const newEvaluation = await prisma.evaluation.create({
      data: {
        staffId: staffId || `STF-${Date.now().toString().slice(-4)}`,
        staffName,
        month: month || '2026-08',
        attendancePts: att,
        teachingPts: teach,
        feedbackPts: fb,
        score: totalScore,
        rank: computedRank,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newEvaluation,
      message: 'Đã lưu kết quả đánh giá vào CSDL'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi lưu kết quả đánh giá vào CSDL',
      details: error.message
    }, { status: 500 });
  }
}

// PUT / PATCH: Cập nhật kết quả đánh giá giáo viên
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, staffName, month, attendancePts, teachingPts, feedbackPts, rank, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID kết quả đánh giá cần cập nhật' }, { status: 400 });
    }

    const updateData: any = {};
    if (staffName) updateData.staffName = staffName;
    if (month) updateData.month = month;
    if (attendancePts !== undefined) updateData.attendancePts = Number(attendancePts);
    if (teachingPts !== undefined) updateData.teachingPts = Number(teachingPts);
    if (feedbackPts !== undefined) updateData.feedbackPts = Number(feedbackPts);
    if (notes !== undefined) updateData.notes = notes;

    if (updateData.attendancePts !== undefined || updateData.teachingPts !== undefined || updateData.feedbackPts !== undefined) {
      const current = await prisma.evaluation.findUnique({ where: { id } });
      const att = updateData.attendancePts !== undefined ? updateData.attendancePts : (current?.attendancePts || 0);
      const teach = updateData.teachingPts !== undefined ? updateData.teachingPts : (current?.teachingPts || 0);
      const fb = updateData.feedbackPts !== undefined ? updateData.feedbackPts : (current?.feedbackPts || 0);
      updateData.score = att + teach + fb;

      if (!rank) {
        if (updateData.score >= 90) updateData.rank = 'EXCELLENT';
        else if (updateData.score >= 80) updateData.rank = 'GOOD';
        else if (updateData.score >= 70) updateData.rank = 'FAIR';
        else updateData.rank = 'POOR';
      } else {
        updateData.rank = rank;
      }
    } else if (rank) {
      updateData.rank = rank;
    }

    const updated = await prisma.evaluation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated, message: 'Đã cập nhật kết quả đánh giá' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Không thể cập nhật kết quả đánh giá', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID kết quả đánh giá' }, { status: 400 });
    }

    await prisma.evaluation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa kết quả đánh giá khỏi CSDL' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Không thể xóa kết quả đánh giá', details: error.message }, { status: 500 });
  }
}

