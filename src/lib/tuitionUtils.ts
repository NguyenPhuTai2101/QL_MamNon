export type FeeType = "MONTHLY" | "DAILY" | "ONE_TIME";

export interface TuitionFeeItem {
  id: string;
  name: string;
  amount: number;
  type: FeeType;
  description?: string | null;
  appliedClass?: string | null; // Dùng làm Tên Danh Mục Lớn (VD: "Gói học phí chuẩn", "Môn năng khiếu & Tự chọn", "Dịch vụ tiện ích", "Khoản thu đầu năm / 1 lần")
  isActive?: boolean;
}

export interface TuitionCategory {
  id: string;
  name: string;
  icon: string;
  isPackage?: boolean; // Là gói học phí chính hay danh mục dịch vụ tự chọn
  items: TuitionFeeItem[];
}

export interface InvoiceSubItem {
  id?: string;
  feeId?: string;
  name: string;
  amount: number;
  type?: FeeType;
  categoryName?: string;
  note?: string;
}

export interface StudentInvoiceBreakdown {
  packageApplied?: string;
  items: InvoiceSubItem[];
  discountPercent?: number;
  discountAmount?: number;
  discountReason?: string;
  refundMealDays?: number;
  refundMealFee?: number;
  refundMealAmount?: number;
  leaveDays?: number;
  totalMonthly?: number;
  totalOneTime?: number;
  totalAll?: number;
  totalAmount: number;
  note?: string;
  monthlyItems?: InvoiceSubItem[];
  oneTimeItems?: InvoiceSubItem[];
}

export const DEFAULT_CATEGORY_NAMES = {
  STANDARD_PACKAGE: "Gói học phí chuẩn",
  ELECTIVES: "Môn năng khiếu & Tự chọn",
  SERVICES: "Dịch vụ tiện ích",
  ONE_TIME: "Khoản thu đầu năm / 1 lần",
};

/**
 * Lấy Icon phù hợp cho từng Danh Mục Lớn
 */
export function getCategoryIcon(categoryName: string): string {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("chuẩn") || name.includes("chính khóa") || name.includes("gói")) return "📦";
  if (name.includes("năng khiếu") || name.includes("nghệ thuật") || name.includes("anh văn") || name.includes("toán")) return "🎨";
  if (name.includes("dịch vụ") || name.includes("xe") || name.includes("trông") || name.includes("tiện ích")) return "🚌";
  if (name.includes("đầu năm") || name.includes("1 lần") || name.includes("đồng phục") || name.includes("cơ sở vật chất")) return "🎒";
  if (name.includes("hè") || name.includes("dã ngoại") || name.includes("sự kiện")) return "☀️";
  return "🏷️";
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
    name.includes("vẽ") ||
    name.includes("hội họa") ||
    name.includes("bơi") ||
    desc.includes("năng khiếu") ||
    desc.includes("tự chọn")
  );
}

/**
 * Nhận diện nhóm khối lớp từ tên lớp học (Mầm, Chồi, Lá)
 */
export function detectClassGroup(className: string): { isMam: boolean; isChoi: boolean; isLa: boolean } {
  const cls = (className || "").toLowerCase().trim();

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

  if (
    cls.includes("lá") ||
    cls.includes("4-5") ||
    cls.includes("4 - 5") ||
    cls.includes("5-6") ||
    cls.includes("5 tuổi") ||
    cls.includes("6 tuổi") ||
    cls.includes("tiền tiểu học") ||
    cls.includes("chồi lá") ||
    cls.includes("chồi - lá")
  ) {
    return { isMam: false, isChoi: false, isLa: true };
  }

  return { isMam: false, isChoi: true, isLa: false };
}

/**
 * Phân loại một khoản thu vào Danh Mục Lớn tương ứng
 */
export function normalizeCategoryName(fee: TuitionFeeItem): string {
  if (fee.appliedClass && fee.appliedClass !== "ALL" && fee.appliedClass !== "MAM" && fee.appliedClass !== "CHOI" && fee.appliedClass !== "LA") {
    return fee.appliedClass;
  }

  const name = (fee.name || "").toLowerCase();
  const desc = (fee.description || "").toLowerCase();

  if (fee.type === "ONE_TIME" || name.includes("đồng phục") || name.includes("balo") || name.includes("cơ sở vật chất")) {
    return DEFAULT_CATEGORY_NAMES.ONE_TIME;
  }

  if (
    name.includes("tiếng anh") ||
    name.includes("anh văn") ||
    name.includes("cambridge") ||
    name.includes("toán") ||
    name.includes("tư duy") ||
    name.includes("nhịp điệu") ||
    name.includes("múa") ||
    name.includes("aerobic") ||
    name.includes("âm nhạc") ||
    name.includes("vẽ") ||
    name.includes("hội họa") ||
    name.includes("bơi") ||
    desc.includes("năng khiếu") ||
    desc.includes("tự chọn")
  ) {
    return DEFAULT_CATEGORY_NAMES.ELECTIVES;
  }

  if (
    name.includes("xe") ||
    name.includes("đưa đón") ||
    name.includes("ngoài giờ") ||
    name.includes("trông muộn") ||
    name.includes("ăn sáng") ||
    name.includes("thứ 7")
  ) {
    return DEFAULT_CATEGORY_NAMES.SERVICES;
  }

  return DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE;
}

/**
 * Gom nhóm tất cả TuitionFeeItem thành danh sách các Danh Mục Lớn (TuitionCategory[])
 */
export function groupFeesIntoCategories(fees: TuitionFeeItem[]): TuitionCategory[] {
  const categoryMap = new Map<string, TuitionFeeItem[]>();

  categoryMap.set(DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE, []);
  categoryMap.set(DEFAULT_CATEGORY_NAMES.ELECTIVES, []);
  categoryMap.set(DEFAULT_CATEGORY_NAMES.SERVICES, []);
  categoryMap.set(DEFAULT_CATEGORY_NAMES.ONE_TIME, []);

  fees.forEach((fee) => {
    const catName = normalizeCategoryName(fee);
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, []);
    }
    categoryMap.get(catName)!.push(fee);
  });

  const categories: TuitionCategory[] = [];
  categoryMap.forEach((items, name) => {
    categories.push({
      id: `cat-${name}`,
      name: name,
      icon: getCategoryIcon(name),
      isPackage: name === DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE || name.toLowerCase().includes("gói"),
      items: items,
    });
  });

  return categories.sort((a, b) => {
    if (a.name === DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE) return -1;
    if (b.name === DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE) return 1;
    return a.name.localeCompare(b.name, "vi");
  });
}

/**
 * Phân tích và giải mã breakdownJson từ Hóa đơn trong CSDL
 */
export function parseInvoiceBreakdown(breakdownJson: string | null | undefined): StudentInvoiceBreakdown | null {
  if (!breakdownJson) return null;
  try {
    const parsed = JSON.parse(breakdownJson);
    if (parsed && typeof parsed === "object") {
      const items: InvoiceSubItem[] = Array.isArray(parsed.items)
        ? parsed.items.map((i: any) => ({
            id: i.id || i.feeId,
            feeId: i.feeId || i.id,
            name: i.name || "Khoản thu",
            amount: Number(i.amount) || 0,
            type: i.type || "MONTHLY",
            categoryName: i.categoryName || i.category,
            note: i.note,
          }))
        : [];

      const discountPercent = Number(parsed.discountPercent) || 0;
      const discountAmount = Number(parsed.discountAmount) || 0;
      const discountReason = parsed.discountReason || "";
      const refundMealDays = Number(parsed.refundMealDays || parsed.leaveDays) || 0;
      const refundMealFee = Number(parsed.refundMealFee || parsed.refundMealAmount) || 0;

      const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.amount) || 0), 0);
      const totalAmount = Number(parsed.totalAmount) || Math.max(0, subtotal - discountAmount - refundMealFee);

      const monthlyItems = items.filter((i) => i.type !== "ONE_TIME");
      const oneTimeItems = items.filter((i) => i.type === "ONE_TIME");

      return {
        packageApplied: parsed.packageApplied,
        items,
        monthlyItems,
        oneTimeItems,
        discountPercent,
        discountAmount,
        discountReason,
        refundMealDays,
        refundMealFee,
        refundMealAmount: refundMealFee,
        leaveDays: refundMealDays,
        totalMonthly: monthlyItems.reduce((s, i) => s + i.amount, 0),
        totalOneTime: oneTimeItems.reduce((s, i) => s + i.amount, 0),
        totalAll: totalAmount,
        totalAmount,
        note: parsed.note,
      };
    }
  } catch (e) {
    console.error("Error parsing breakdownJson:", e);
  }
  return null;
}

/**
 * Lấy đơn giá tiền ăn theo ngày từ danh mục biểu phí
 */
export function getDailyMealRate(fees: TuitionFeeItem[] = []): number {
  const mealFee = fees.find(
    (f) =>
      f.isActive !== false &&
      (f.name.toLowerCase().includes("tiền ăn") ||
        f.name.toLowerCase().includes("ăn bán trú") ||
        f.type === "DAILY")
  );

  if (mealFee) {
    if (mealFee.type === "DAILY" && mealFee.amount > 0) {
      return mealFee.amount;
    }
    if (mealFee.amount > 0) {
      // 22 ngày ăn định mức chuẩn mầm non
      return Math.round(mealFee.amount / 22);
    }
  }

  // Mặc định chuẩn mầm non (~780k / 22 ngày)
  return 35450;
}

/**
 * Xây dựng hóa đơn mặc định cho một học sinh dựa trên Gói học phí chuẩn và số ngày nghỉ điểm danh
 */
export function buildDefaultStudentBreakdown(
  student: any,
  fees: TuitionFeeItem[] = [],
  existingInvoice?: any,
  absentPermitDays: number = 0
): StudentInvoiceBreakdown {
  if (existingInvoice?.breakdownJson) {
    const parsed = parseInvoiceBreakdown(existingInvoice.breakdownJson);
    if (parsed && parsed.items.length > 0) {
      return parsed;
    }
  }

  const standardCategoryItems = fees.filter(
    (f) => f.isActive !== false && normalizeCategoryName(f) === DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE
  );

  const defaultItems: InvoiceSubItem[] = standardCategoryItems.map((f) => ({
    id: f.id,
    feeId: f.id,
    name: f.name,
    amount: f.amount,
    type: f.type,
    categoryName: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE,
  }));

  if (defaultItems.length === 0) {
    defaultItems.push(
      { name: "Học phí chính khóa", amount: 1420000, type: "MONTHLY", categoryName: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE },
      { name: "Tiền ăn bán trú (3 bữa/ngày)", amount: 780000, type: "MONTHLY", categoryName: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE },
      { name: "Bán trú", amount: 400000, type: "MONTHLY", categoryName: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE }
    );
  }

  const subtotal = defaultItems.reduce((sum, it) => sum + it.amount, 0);
  const monthlyItems = defaultItems.filter((i) => i.type !== "ONE_TIME");
  const oneTimeItems = defaultItems.filter((i) => i.type === "ONE_TIME");

  // Tự động tính hoàn tiền ăn nếu bé có ngày nghỉ phép từ điểm danh
  const leaveDays = absentPermitDays > 0 ? absentPermitDays : 0;
  const mealRate = getDailyMealRate(fees);
  const refundFee = leaveDays > 0 ? Math.round(leaveDays * mealRate) : 0;
  const finalTotal = Math.max(0, subtotal - refundFee);

  return {
    packageApplied: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE,
    items: defaultItems,
    monthlyItems,
    oneTimeItems,
    discountPercent: 0,
    discountAmount: 0,
    discountReason: "",
    refundMealDays: leaveDays,
    refundMealFee: refundFee,
    refundMealAmount: refundFee,
    leaveDays: leaveDays,
    totalMonthly: monthlyItems.reduce((s, i) => s + i.amount, 0),
    totalOneTime: oneTimeItems.reduce((s, i) => s + i.amount, 0),
    totalAll: existingInvoice?.amount ? existingInvoice.amount : finalTotal,
    totalAmount: existingInvoice?.amount ? existingInvoice.amount : finalTotal,
  };
}

export function buildCustomStudentBreakdown(
  student: any,
  fees: TuitionFeeItem[],
  selectedFeeIds: string[]
): StudentInvoiceBreakdown {
  const selectedFees = fees.filter((f) => selectedFeeIds.includes(f.id));
  const items: InvoiceSubItem[] = selectedFees.map((f) => ({
    id: f.id,
    feeId: f.id,
    name: f.name,
    amount: f.amount,
    type: f.type,
    categoryName: normalizeCategoryName(f),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
  return {
    items,
    totalAmount: subtotal,
  };
}

/**
 * Tính số tiền học phí thực tế của học sinh (Tương thích ngược)
 */
export function getStudentEffectiveAmount(
  student: any,
  fees: TuitionFeeItem[] = [],
  invoice?: any
): number {
  if (invoice?.amount !== undefined && invoice?.amount !== null) {
    return Number(invoice.amount);
  }
  if (student?.amount !== undefined && student?.amount !== null && student?.amount > 0) {
    return Number(student.amount);
  }
  const breakdown = buildDefaultStudentBreakdown(student, fees, invoice);
  return breakdown.totalAmount;
}

/**
 * Lấy chi tiết bóc tách học phí của học sinh (Tương thích ngược)
 */
export function getStudentFeeBreakdown(
  student: any,
  fees: TuitionFeeItem[] = [],
  invoice?: any
): StudentInvoiceBreakdown {
  return buildDefaultStudentBreakdown(student, fees, invoice);
}

/**
 * Tính toán tổng tiền hóa đơn sau khi áp dụng Miễn giảm và Hoàn tiền ăn
 */
export function calculateInvoiceTotal(
  items: InvoiceSubItem[],
  discountPercent: number = 0,
  discountAmount: number = 0,
  refundMealFee: number = 0
): { subtotal: number; finalDiscount: number; total: number } {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  
  let computedDiscount = discountAmount;
  if (discountPercent > 0 && computedDiscount === 0) {
    computedDiscount = Math.round((subtotal * discountPercent) / 100);
  }

  const total = Math.max(0, subtotal - computedDiscount - refundMealFee);

  return {
    subtotal,
    finalDiscount: computedDiscount,
    total,
  };
}

/**
 * Trả về chi tiết các khoản để đưa vào VietQR Modal
 */
export function getVietQRBreakdownDetails(
  student: any,
  fees: TuitionFeeItem[] = [],
  amount: number = 0,
  invoiceBreakdown?: StudentInvoiceBreakdown | null
) {
  if (invoiceBreakdown && invoiceBreakdown.items && invoiceBreakdown.items.length > 0) {
    const monthlyItems = invoiceBreakdown.items.filter((i) => i.type !== "ONE_TIME");
    const oneTimeItems = invoiceBreakdown.items.filter((i) => i.type === "ONE_TIME");

    return {
      items: invoiceBreakdown.items,
      monthlyItems: monthlyItems.length > 0 ? monthlyItems : invoiceBreakdown.items,
      oneTimeItems,
      discountPercent: invoiceBreakdown.discountPercent || 0,
      discountAmount: invoiceBreakdown.discountAmount || 0,
      refundMealFee: invoiceBreakdown.refundMealFee || invoiceBreakdown.refundMealAmount || 0,
      leaveDays: invoiceBreakdown.refundMealDays || invoiceBreakdown.leaveDays || 0,
      totalAmount: invoiceBreakdown.totalAmount || amount,
    };
  }

  const fallback = buildDefaultStudentBreakdown(student, fees);
  return {
    items: fallback.items,
    monthlyItems: fallback.items,
    oneTimeItems: [],
    discountPercent: fallback.discountPercent || 0,
    discountAmount: fallback.discountAmount || 0,
    refundMealFee: fallback.refundMealFee || 0,
    leaveDays: fallback.refundMealDays || 0,
    totalAmount: amount > 0 ? amount : fallback.totalAmount,
  };
}

/**
 * Lưu trạng thái thanh toán hóa đơn vào CSDL
 */
export async function saveInvoicePaymentToDB(
  studentId: string,
  month: number,
  year: number,
  amount: number,
  status: "PAID" | "UNPAID",
  paymentMethod: "CASH" | "TRANSFER" | "QR" = "CASH",
  breakdown?: any
): Promise<boolean> {
  try {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        month,
        year,
        amount,
        status,
        paymentMethod,
        breakdownJson: breakdown ? JSON.stringify(breakdown) : undefined,
      }),
    });

    const data = await res.json();
    return data.success !== false;
  } catch (error) {
    console.error("Failed to save invoice payment to DB:", error);
    return false;
  }
}
