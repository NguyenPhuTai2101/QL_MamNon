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
  isElective?: boolean; // Môn năng khiếu / tự chọn riêng
}

export interface StudentFeeBreakdown {
  items: FeeBreakdownItem[];
  monthlyItems: FeeBreakdownItem[];
  oneTimeItems: FeeBreakdownItem[];
  totalMonthly: number;
  totalOneTime: number;
  totalAll: number;
  selectedFeeIds?: string[];
  schoolDays?: number;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
}

/**
 * Kiểm tra xem một khoản thu có phải là Môn Năng Khiếu / Dịch Vụ Tự Chọn đăng ký riêng hay không
 */
export function isElectiveSubject(fee: TuitionFeeItem): boolean {
  const name = (fee.name || "").toLowerCase();
  const desc = (fee.description || "").toLowerCase();

  return (
    name.includes("tiếng anh") ||
    name.includes("anh văn") ||
    name.includes("cambridge") ||
    name.includes("toán") ||
    name.includes("tư duy") ||
    name.includes("nhịp điệu") ||
    name.includes("múa") ||
    name.includes("aerobic") ||
    name.includes("âm nhạc") ||
    name.includes("đàn") ||
    name.includes("hội họa") ||
    name.includes("vẽ") ||
    name.includes("năng khiếu") ||
    name.includes("xe") ||
    name.includes("đưa đón") ||
    name.includes("ngoài giờ") ||
    name.includes("trông muộn") ||
    name.includes("bơi") ||
    name.includes("kỹ năng") ||
    desc.includes("tự chọn") ||
    desc.includes("đăng ký thêm") ||
    desc.includes("năng khiếu")
  );
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
 * Phân tích đối tượng bóc tách JSON lưu trong hóa đơn
 */
export function parseInvoiceBreakdown(invoice?: { breakdownJson?: string | null } | null): StudentFeeBreakdown | null {
  if (!invoice || !invoice.breakdownJson) return null;
  try {
    const parsed = JSON.parse(invoice.breakdownJson);
    if (parsed && Array.isArray(parsed.items) && typeof parsed.totalMonthly === "number") {
      return parsed as StudentFeeBreakdown;
    }
  } catch (e) {}
  return null;
}

/**
 * Xây dựng bóc tách học phí tùy biến cho TỪNG HỌC SINH dựa trên các môn năng khiếu và dịch vụ bé đăng ký
 */
export function buildCustomStudentBreakdown({
  className,
  feeItems = [],
  selectedFeeIds = [],
  schoolDays = 22,
  discountPercent = 0,
  notes = "",
}: {
  className: string;
  feeItems: TuitionFeeItem[];
  selectedFeeIds: string[];
  schoolDays?: number;
  discountPercent?: number;
  notes?: string;
}): StudentFeeBreakdown {
  const { isMam, isChoi, isLa } = detectClassGroup(className);
  const targetClassLower = (className || "").toLowerCase().trim();

  const monthlyItems: FeeBreakdownItem[] = [];
  const oneTimeItems: FeeBreakdownItem[] = [];

  feeItems.forEach((fee) => {
    if (fee.isActive === false) return;

    const isElective = isElectiveSubject(fee);
    const applied = (fee.appliedClass || "ALL").trim();
    const isMatchingClass =
      applied === "ALL" ||
      !applied ||
      applied.toLowerCase() === targetClassLower ||
      (isMam && applied.toUpperCase() === "MAM") ||
      (isChoi && applied.toUpperCase() === "CHOI") ||
      (isLa && applied.toUpperCase() === "LA");

    // Nếu là môn năng khiếu / tự chọn: CHỈ tính khi học sinh đó có đăng ký (selectedFeeIds)
    if (isElective) {
      if (selectedFeeIds.includes(fee.id)) {
        if (fee.type === "DAILY") {
          monthlyItems.push({
            id: fee.id,
            name: fee.name,
            type: fee.type,
            amount: fee.amount * schoolDays,
            note: `Tự chọn: ${schoolDays} ngày × ${fee.amount.toLocaleString("vi-VN")} đ/ngày`,
            isElective: true,
          });
        } else if (fee.type === "MONTHLY") {
          monthlyItems.push({
            id: fee.id,
            name: fee.name,
            type: fee.type,
            amount: fee.amount,
            note: "Môn năng khiếu đăng ký riêng",
            isElective: true,
          });
        } else {
          oneTimeItems.push({
            id: fee.id,
            name: fee.name,
            type: fee.type,
            amount: fee.amount,
            note: "Dịch vụ tự chọn (1 lần)",
            isElective: true,
          });
        }
      }
      return;
    }

    // Nếu là khoản thu bắt buộc chung theo lớp/trường: Tự động đưa vào nếu khớp lớp
    if (isMatchingClass) {
      if (fee.type === "DAILY") {
        monthlyItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount * schoolDays,
          note: `${schoolDays} ngày × ${fee.amount.toLocaleString("vi-VN")} đ/ngày`,
          isElective: false,
        });
      } else if (fee.type === "MONTHLY") {
        monthlyItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount,
          note: "Học phí định mức cơ bản",
          isElective: false,
        });
      } else if (fee.type === "ONE_TIME") {
        oneTimeItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount,
          note: "Khoản thu bắt buộc đầu năm",
          isElective: false,
        });
      }
    }
  });

  const rawMonthly = monthlyItems.reduce((sum, i) => sum + i.amount, 0);
  const totalOneTime = oneTimeItems.reduce((sum, i) => sum + i.amount, 0);

  // Tính miễn giảm nếu có (áp dụng trên học phí chính khóa hoặc tổng tháng)
  const baseTuition = monthlyItems.find((i) => i.name.toLowerCase().includes("học phí"))?.amount || rawMonthly;
  const discountAmount = discountPercent > 0 ? Math.round(baseTuition * (discountPercent / 100)) : 0;
  const totalMonthly = Math.max(0, rawMonthly - discountAmount);

  return {
    items: [...monthlyItems, ...oneTimeItems],
    monthlyItems,
    oneTimeItems,
    totalMonthly,
    totalOneTime,
    totalAll: totalMonthly + totalOneTime,
    selectedFeeIds,
    schoolDays,
    discountPercent,
    discountAmount,
    notes,
  };
}

/**
 * Tính toán bóc tách chi tiết học phí cho học sinh:
 * - Ưu tiên đọc bóc tách tùy biến đã lưu trong hóa đơn DB của học sinh (`invoice.breakdownJson`).
 * - Nếu chưa có, tự động tính theo biểu phí mặc định của lớp học.
 */
export function getStudentFeeBreakdown(
  studentClassName: string,
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22,
  invoice?: { breakdownJson?: string | null; amount?: number } | null
): StudentFeeBreakdown {
  // 1. Kiểm tra hóa đơn đã lưu bóc tách
  const savedBreakdown = parseInvoiceBreakdown(invoice);
  if (savedBreakdown && savedBreakdown.items && savedBreakdown.items.length > 0) {
    return savedBreakdown;
  }

  // 2. Nếu chưa lưu bóc tách riêng, tính mặc định theo lớp
  const defaultElectiveIds = feeItems
    .filter((f) => {
      if (!isElectiveSubject(f)) return false;
      const { isLa } = detectClassGroup(studentClassName);
      const applied = (f.appliedClass || "ALL").toUpperCase();
      // Mặc định tự chọn lớp Lá có tiếng anh nếu chưa cấu hình riêng
      if (isLa && (applied === "LA" || applied === "ALL")) return true;
      return false;
    })
    .map((f) => f.id);

  return buildCustomStudentBreakdown({
    className: studentClassName,
    feeItems,
    selectedFeeIds: defaultElectiveIds,
    schoolDays,
    discountPercent: 0,
  });
}

/**
 * Lấy số tiền học phí thực tế của học sinh:
 * - Ưu tiên số tiền trên hóa đơn DB (nếu có).
 * - Hoặc số tiền tính toán theo bóc tách của học sinh.
 */
export function getStudentEffectiveAmount(
  student: { className?: string; amount?: number; invoice?: { amount?: number; breakdownJson?: string | null } | null },
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22
): number {
  if (student.invoice && typeof student.invoice.amount === "number" && student.invoice.amount > 0) {
    return student.invoice.amount;
  }

  const className = student.className || "";
  const breakdown = getStudentFeeBreakdown(className, feeItems, schoolDays, student.invoice);
  if (breakdown.totalMonthly > 0) {
    return breakdown.totalMonthly;
  }

  if (student.amount && student.amount > 0) {
    return student.amount;
  }

  return 3200000;
}

/**
 * Tạo dữ liệu chi tiết cho VietQR Modal từ bóc tách của học sinh
 */
export function getVietQRBreakdownDetails(
  className: string,
  feeItems: TuitionFeeItem[] = [],
  schoolDays: number = 22,
  overrideTotal?: number,
  invoice?: { breakdownJson?: string | null; amount?: number } | null
) {
  const breakdown = getStudentFeeBreakdown(className, feeItems, schoolDays, invoice);

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
    items: breakdown.items,
    monthlyItems: breakdown.monthlyItems,
    oneTimeItems: breakdown.oneTimeItems,
    baseTuition: baseTuition || (breakdown.totalMonthly > 0 ? breakdown.totalMonthly - mealFee - english - rhythmDance - mathLogic : 1800000),
    semiBoarding,
    mealFee,
    facilityFee,
    mathLogic,
    english,
    rhythmDance,
    leaveDays: 0,
    refundMealFee: 0,
    discountAmount: breakdown.discountAmount || 0,
    discountPercent: breakdown.discountPercent || 0,
    totalMonthly: breakdown.totalMonthly,
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
