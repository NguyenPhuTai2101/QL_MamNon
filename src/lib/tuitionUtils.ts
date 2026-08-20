export type FeeType = "MONTHLY" | "DAILY" | "ONE_TIME";

export interface TuitionFeeItem {
  id: string;
  name: string;
  amount: number;
  type: FeeType;
  description?: string | null;
  appliedClass?: string | null; // "ALL" | "MAM" | "CHOI" | "LA" | class name
  isActive?: boolean;
}

export interface FeeBreakdownItem {
  id: string;
  name: string;
  type: FeeType;
  amount: number;
  note: string;
}

export interface StudentFeeBreakdown {
  items: FeeBreakdownItem[];
  monthlyItems: FeeBreakdownItem[];
  oneTimeItems: FeeBreakdownItem[];
  totalMonthly: number;
  totalOneTime: number;
  totalAll: number;
}

/**
 * Nhận diện nhóm khối lớp từ tên lớp học (Mầm, Chồi, Lá)
 */
export function detectClassGroup(className: string): { isMam: boolean; isChoi: boolean; isLa: boolean } {
  const cls = (className || "").toLowerCase().trim();

  // 1. Nhóm Mầm / Nhà trẻ (12-36 tháng)
  if (
    cls.includes("mầm") ||
    cls.includes("nhà trẻ") ||
    cls.includes("thơ") ||
    cls.includes("12") ||
    cls.includes("18") ||
    cls.includes("24") ||
    cls.includes("36") ||
    cls.includes("tháng")
  ) {
    return { isMam: true, isChoi: false, isLa: false };
  }

  // 2. Nhóm Lá / Mẫu giáo lớn (4-6 tuổi) hoặc lớp ghép Chồi-Lá
  if (
    cls.includes("lá") ||
    cls.includes("4-5") ||
    cls.includes("4 - 5") ||
    cls.includes("4 – 5") ||
    cls.includes("5-6") ||
    cls.includes("5 – 6") ||
    cls.includes("5 tuổi") ||
    cls.includes("6 tuổi") ||
    cls.includes("tiền tiểu học") ||
    cls.includes("chồi lá") ||
    cls.includes("chồi - lá") ||
    cls.includes("chồi-lá")
  ) {
    return { isMam: false, isChoi: false, isLa: true };
  }

  // 3. Nhóm Chồi / Mẫu giáo nhỡ (3-4 tuổi)
  if (
    cls.includes("chồi") ||
    cls.includes("3-4") ||
    cls.includes("3 - 4") ||
    cls.includes("3 – 4") ||
    cls.includes("3-5") ||
    cls.includes("3 – 5") ||
    cls.includes("3 tuổi") ||
    cls.includes("4 tuổi")
  ) {
    return { isMam: false, isChoi: true, isLa: false };
  }

  return { isMam: false, isChoi: false, isLa: false };
}

/**
 * Tính toán bóc tách chi tiết học phí theo lớp học và cấu hình biểu phí
 */
export function getStudentFeeBreakdown(
  studentClassName: string,
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22
): StudentFeeBreakdown {
  const { isMam, isChoi, isLa } = detectClassGroup(studentClassName);
  const targetClassLower = (studentClassName || "").toLowerCase().trim();

  const applicableFees = feeItems.filter((f) => {
    if (f.isActive === false) return false;
    const applied = (f.appliedClass || "ALL").trim();
    if (applied === "ALL" || !applied) return true;
    if (applied.toLowerCase() === targetClassLower) return true; // Khớp đích danh từng lớp
    if (isMam && applied.toUpperCase() === "MAM") return true;
    if (isChoi && applied.toUpperCase() === "CHOI") return true;
    if (isLa && applied.toUpperCase() === "LA") return true;
    return false;
  });

  const monthlyItems: FeeBreakdownItem[] = [];
  const oneTimeItems: FeeBreakdownItem[] = [];

  applicableFees.forEach((fee) => {
    if (fee.type === "DAILY") {
      monthlyItems.push({
        id: fee.id,
        name: fee.name,
        type: fee.type,
        amount: fee.amount * schoolDays,
        note: `${schoolDays} ngày × ${(fee.amount).toLocaleString("vi-VN")} đ/ngày`,
      });
    } else if (fee.type === "MONTHLY") {
      monthlyItems.push({
        id: fee.id,
        name: fee.name,
        type: fee.type,
        amount: fee.amount,
        note: "Cố định hàng tháng",
      });
    } else if (fee.type === "ONE_TIME") {
      oneTimeItems.push({
        id: fee.id,
        name: fee.name,
        type: fee.type,
        amount: fee.amount,
        note: "Thu 1 lần đầu năm học",
      });
    }
  });

  const totalMonthly = monthlyItems.reduce((sum, i) => sum + i.amount, 0);
  const totalOneTime = oneTimeItems.reduce((sum, i) => sum + i.amount, 0);

  return {
    items: [...monthlyItems, ...oneTimeItems],
    monthlyItems,
    oneTimeItems,
    totalMonthly,
    totalOneTime,
    totalAll: totalMonthly + totalOneTime,
  };
}

/**
 * Lấy số tiền học phí thực tế của học sinh:
 * - Nếu học sinh đã có hóa đơn trong DB với số tiền > 0, ưu tiên số tiền hóa đơn.
 * - Nếu chưa có hóa đơn (hoặc số tiền = 0), tự động tính theo biểu phí lớp.
 * - Dự phòng mặc định: 3.200.000 đ nếu không có cấu hình biểu phí.
 */
export function getStudentEffectiveAmount(
  student: { className?: string; amount?: number; invoice?: { amount?: number } | null },
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22
): number {
  if (student.invoice && typeof student.invoice.amount === "number" && student.invoice.amount > 0) {
    return student.invoice.amount;
  }
  
  const className = student.className || "";
  const breakdown = getStudentFeeBreakdown(className, feeItems, schoolDays);
  if (breakdown.totalMonthly > 0) {
    return breakdown.totalMonthly;
  }

  if (student.amount && student.amount > 0) {
    return student.amount;
  }

  return 3200000;
}

/**
 * Tạo dữ liệu chi tiết cho VietQR Modal từ biểu phí hoặc hóa đơn
 */
export function getVietQRBreakdownDetails(
  className: string,
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22,
  overrideTotal?: number
) {
  const breakdown = getStudentFeeBreakdown(className, feeItems, schoolDays);
  
  const baseTuition =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("học phí"))?.amount || 0;
  const semiBoarding =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("bán trú"))?.amount || 0;
  const mealFee =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("tiền ăn") || i.name.toLowerCase().includes("ăn"))?.amount || 0;
  const facilityFee =
    breakdown.oneTimeItems.find((i) => i.name.toLowerCase().includes("csvc") || i.name.toLowerCase().includes("cơ sở"))?.amount || 0;
  const mathLogic =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("toán"))?.amount || 0;
  const english =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("anh") || i.name.toLowerCase().includes("tiếng anh"))?.amount || 0;
  const rhythmDance =
    breakdown.monthlyItems.find((i) => i.name.toLowerCase().includes("nhịp") || i.name.toLowerCase().includes("múa") || i.name.toLowerCase().includes("âm nhạc"))?.amount || 0;

  return {
    baseTuition: baseTuition || (breakdown.totalMonthly > 0 ? breakdown.totalMonthly - mealFee - english - rhythmDance - mathLogic : 1800000),
    semiBoarding,
    mealFee,
    facilityFee,
    mathLogic,
    english,
    rhythmDance,
    leaveDays: 0,
    refundMealFee: 0,
    discountAmount: 0,
    discountPercent: 0,
  };
}

/**
 * Gọi API lưu hoặc cập nhật hóa đơn học phí vào CSDL PostgreSQL
 */
export async function saveInvoicePaymentToDB(params: {
  studentId: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
  amount: number;
  month?: number;
  year?: number;
  paymentMethod?: string;
  breakdownJson?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const now = new Date();
    const month = params.month || now.getMonth() + 1;
    const year = params.year || now.getFullYear();

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: params.studentId,
        month,
        year,
        amount: params.amount,
        status: params.status,
        paymentMethod: params.paymentMethod || (params.status === "PAID" ? "QR" : null),
        breakdownJson: params.breakdownJson,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || "Lỗi khi lưu hóa đơn" };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
