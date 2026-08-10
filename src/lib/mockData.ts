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

export const mockStudents: Student[] = [
  { 
    id: "1", 
    code: "HS001",
    name: "Nguyễn Minh Khang", 
    birthDate: "2023-04-15",
    gender: "Nam",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    className: "Mầm 1", 
    joinDate: "2025-09-05",
    status: "Đang học",
    fatherName: "Nguyễn Minh Triết",
    fatherJob: "Kỹ sư phần mềm",
    motherName: "Lê Thị Mai",
    motherJob: "Kế toán",
    address: "123 Nguyễn Trãi, Q.5, TP.HCM",
    parentName: "Nguyễn Minh Triết", 
    parentPhone: "0901234567", 
    tuitionStatus: "PAID", 
    amount: 3200000,
    absentDaysWithPermit: 2,
    refundMealFee: 60000,
    discountPercent: 10,
    freeUniform: true
  },
  { 
    id: "2", 
    code: "HS002",
    name: "Lê Vy Anh", 
    birthDate: "2022-08-20",
    gender: "Nữ",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    className: "Chồi 2", 
    joinDate: "2024-09-05",
    status: "Đang học",
    fatherName: "Lê Hoài Nam",
    fatherJob: "Kinh doanh",
    motherName: "Trần Thị Thanh",
    motherJob: "Giáo viên",
    address: "456 Lê Hồng Phong, Q.10, TP.HCM",
    parentName: "Lê Hoài Nam", 
    parentPhone: "0912345678", 
    tuitionStatus: "UNPAID", 
    amount: 3500000,
    absentDaysWithPermit: 0,
    refundMealFee: 0,
    discountPercent: 0,
    freeUniform: false
  },
  { 
    id: "3", 
    code: "HS003",
    name: "Trần Bảo Nam", 
    birthDate: "2021-11-10",
    gender: "Nam",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    className: "Lá 1", 
    joinDate: "2023-09-05",
    status: "Đang học",
    fatherName: "Trần Quốc Bảo",
    fatherJob: "Bác sĩ",
    motherName: "Phạm Thu Hương",
    motherJob: "Dược sĩ",
    address: "789 Cách Mạng Tháng 8, Q.3, TP.HCM",
    parentName: "Trần Quốc Bảo", 
    parentPhone: "0923456789", 
    tuitionStatus: "OVERDUE", 
    amount: 3800000,
    absentDaysWithPermit: 5,
    refundMealFee: 150000,
    discountPercent: 0,
    freeUniform: false
  },
  { 
    id: "4", 
    code: "HS004",
    name: "Phạm Mai Chi", 
    birthDate: "2023-01-05",
    gender: "Nữ",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    className: "Mầm 1", 
    joinDate: "2025-09-05",
    status: "Đang học",
    fatherName: "Phạm Hữu Nghĩa",
    fatherJob: "Kiến trúc sư",
    motherName: "Ngô Mỹ Linh",
    motherJob: "Nhân viên ngân hàng",
    address: "321 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
    parentName: "Phạm Hữu Nghĩa", 
    parentPhone: "0934567890", 
    tuitionStatus: "PAID", 
    amount: 3200000,
    absentDaysWithPermit: 1,
    refundMealFee: 30000,
    discountPercent: 10,
    freeUniform: true
  },
  { 
    id: "5", 
    code: "HS005",
    name: "Đỗ Gia Huy", 
    birthDate: "2022-05-12",
    gender: "Nam",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    className: "Chồi 1", 
    joinDate: "2024-09-05",
    status: "Đang học",
    fatherName: "Đỗ Quốc Huy",
    fatherJob: "Quản lý kinh doanh",
    motherName: "Nguyễn Phương Thảo",
    motherJob: "Luật sư",
    address: "654 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    parentName: "Đỗ Quốc Huy", 
    parentPhone: "0945678901", 
    tuitionStatus: "UNPAID", 
    amount: 3500000,
    absentDaysWithPermit: 0,
    refundMealFee: 0,
    discountPercent: 0,
    freeUniform: false
  },
];

export const mockWeeklyMenu: Record<string, MenuItem> = {
  "Thứ Hai": { breakfast: "Cháo thịt bằm, Sữa tươi", lunch: "Cơm, Thịt kho trứng, Canh bí đỏ, Rau cải", snack: "Chuối, Sữa đậu nành", cost: 30000 },
  "Thứ Ba": { breakfast: "Súp gà ngô ngọt, Sữa tươi", lunch: "Cơm, Tôm ram thịt băm, Canh cải ngọt", snack: "Sữa chua, Trái cây mùa vụ", cost: 30000 },
  "Thứ Tư": { breakfast: "Bún bò viên, Sữa đậu nành", lunch: "Cơm, Cá thu sốt cà, Canh khoai tây hầm xương", snack: "Chè đậu xanh, Nước dừa", cost: 30000 },
  "Thứ Năm": { breakfast: "Phở gà, Sữa bắp", lunch: "Cơm, Trứng đúc thịt, Canh cải thảo tôm khô", snack: "Bánh pudding, Chuối chín", cost: 30000 },
  "Thứ Sáu": { breakfast: "Mì Ý sốt bò băm, Nước ép dứa", lunch: "Cơm, Gà chiên nước mắm, Canh chua cá lóc", snack: "Váng sữa, Nho đen", cost: 30000 },
};

export const mockIngredients: IngredientCost[] = [
  { id: "1", code: "TP001", name: "Gạo ST25", quantity: 100, unit: "kg", unitPrice: 22000, total: 2200000, supplier: "Cửa hàng A" },
  { id: "2", code: "TP002", name: "Thịt heo nạc", quantity: 50, unit: "kg", unitPrice: 130000, total: 6500000, supplier: "Cửa hàng B" },
  { id: "3", code: "TP003", name: "Thịt gà ta", quantity: 40, unit: "kg", unitPrice: 95000, total: 3800000, supplier: "Cửa hàng B" },
  { id: "4", code: "TP004", name: "Cá lóc tươi", quantity: 30, unit: "kg", unitPrice: 85000, total: 2550000, supplier: "Cửa hàng C" },
  { id: "5", code: "TP005", name: "Tôm sú tươi", quantity: 20, unit: "kg", unitPrice: 180000, total: 3600000, supplier: "Hải sản D" },
  { id: "6", code: "TP006", name: "Trứng gà tươi", quantity: 300, unit: "Quả", unitPrice: 3000, total: 900000, supplier: "Trang trại E" },
  { id: "7", code: "TP007", name: "Sữa tươi TH True Milk", quantity: 250, unit: "Hộp", unitPrice: 8000, total: 2000000, supplier: "Vinamilk" },
  { id: "8", code: "TP008", name: "Cà rốt Đà Lạt", quantity: 30, unit: "kg", unitPrice: 20000, total: 600000, supplier: "Chợ đầu mối" },
  { id: "9", code: "TP009", name: "Khoai tây", quantity: 40, unit: "kg", unitPrice: 25000, total: 1000000, supplier: "Chợ đầu mối" },
  { id: "10", code: "TP010", name: "Rau cải xanh", quantity: 35, unit: "kg", unitPrice: 18000, total: 630000, supplier: "Nông trại F" },
];
