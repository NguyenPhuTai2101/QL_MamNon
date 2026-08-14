export interface Student {
  id: string;
  code?: string; // Mã học sinh (VD: HS001)
  name: string;
  birthDate?: string;
  gender?: "Nam" | "Nữ";
  ethnicity?: string; // Dân tộc (Kinh, Tay, Nung...)
  nationality?: string; // Quốc tịch (Việt Nam...)
  className: string;
  joinDate?: string;
  status?: "Đang học" | "Nghỉ học" | "Bảo lưu";
  fatherName?: string;
  fatherJob?: string;
  motherName?: string;
  motherJob?: string;
  address?: string;
  parentName: string;
  parentPhone: string;
  tuitionStatus: "PAID" | "UNPAID" | "OVERDUE";
  amount: number;
  absentDaysWithPermit?: number; // Số ngày nghỉ có phép trong tháng
  refundMealFee?: number; // Tiền ăn được hoàn lại (30k x absentDays)
  discountPercent?: number; // Giảm giá % (VD: 10%)
  freeUniform?: boolean; // Tặng đồng phục
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
