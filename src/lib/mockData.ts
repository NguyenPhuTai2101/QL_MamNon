export interface Student {
  id: string;
  code?: string; // Mã học sinh (VD: HS001)
  name: string;
  birthDate?: string;
  gender?: "Nam" | "Nữ";
  ethnicity?: string; // Dân tộc (Kinh, Tày, Thái, Mường...)
  nationality?: string; // Quốc tịch (Việt Nam...)
  residence?: string; // Nơi cư trú (Tạm trú / Thường trú)
  className: string;
  joinDate?: string;
  enrollmentDate?: string; // Ngày nhập học của bé
  status?: "Đang học" | "Nghỉ học" | "Bảo lưu";
  fatherName?: string; // Họ tên cha
  fatherJob?: string; // Nghề nghiệp cha
  fatherPhone?: string; // SĐT cha
  motherName?: string; // Họ tên mẹ
  motherJob?: string; // Nghề nghiệp mẹ
  motherPhone?: string; // SĐT mẹ
  address?: string; // Địa chỉ gia đình
  parentName: string; // Người liên hệ chính
  parentPhone: string; // SĐT liên hệ chính
  tuitionStatus: "PAID" | "UNPAID" | "OVERDUE";
  amount: number;
  absentDaysWithPermit?: number; // Số ngày nghỉ có phép trong tháng
  refundMealFee?: number; // Tiền ăn được hoàn lại (30k x absentDays)
  discountPercent?: number; // Giảm giá % (VD: 10%)
  freeUniform?: boolean; // Tặng đồng phục
  invoice?: any; // Hóa đơn tháng hiện tại
}

export interface MenuItem {
  breakfast: string;
  lunch: string;
  snack: string;
  cost: number;
}

export interface IngredientCost {
  id: string;
  code?: string; // Mã TP (TP001...)
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  supplier?: string; // Nhà cung cấp (Cửa hàng A, Vinamilk...)
}

// Toàn bộ dữ liệu được quản lý và tải trực tiếp từ CSDL PostgreSQL qua Prisma ORM
export const mockStudents: Student[] = [];

export const mockWeeklyMenu: Record<string, MenuItem> = {};

export const mockIngredients: IngredientCost[] = [];
