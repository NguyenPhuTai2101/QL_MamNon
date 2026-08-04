export interface Student {
  id: string;
  name: string;
  className: string;
  parentName: string;
  parentPhone: string;
  tuitionStatus: "PAID" | "UNPAID" | "OVERDUE";
  amount: number;
}

export interface MenuItem {
  breakfast: string;
  lunch: string;
  snack: string;
  cost: number;
}

export interface IngredientCost {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const mockStudents: Student[] = [
  { id: "1", name: "Nguyễn Minh Khang", className: "Mầm 1", parentName: "Nguyễn Minh Triết", parentPhone: "0901234567", tuitionStatus: "PAID", amount: 3200000 },
  { id: "2", name: "Lê Vy Anh", className: "Chồi 2", parentName: "Lê Hoài Nam", parentPhone: "0912345678", tuitionStatus: "UNPAID", amount: 3500000 },
  { id: "3", name: "Trần Bảo Nam", className: "Lá 1", parentName: "Trần Quốc Bảo", parentPhone: "0923456789", tuitionStatus: "OVERDUE", amount: 3800000 },
  { id: "4", name: "Phạm Mai Chi", className: "Mầm 1", parentName: "Phạm Hữu Nghĩa", parentPhone: "0934567890", tuitionStatus: "PAID", amount: 3200000 },
  { id: "5", name: "Đỗ Gia Huy", className: "Chồi 1", parentName: "Đỗ Quốc Huy", parentPhone: "0945678901", tuitionStatus: "UNPAID", amount: 3500000 },
];

export const mockWeeklyMenu: Record<string, MenuItem> = {
  "Thứ Hai": { breakfast: "Cháo sườn heo, Sữa hạt sen", lunch: "Cơm trắng, Thịt kho trứng, Canh bí đao", snack: "Bánh bông lan, Nước cam", cost: 35000 },
  "Thứ Ba": { breakfast: "Súp gà ngô ngọt, Sữa tươi", lunch: "Cơm trắng, Tôm ram thịt băm, Canh cải ngọt", snack: "Sữa chua, Trái cây mùa vụ", cost: 38000 },
  "Thứ Tư": { breakfast: "Bún bò viên, Sữa đậu nành", lunch: "Cơm trắng, Cá thu sốt cà, Canh khoai tây hầm xương", snack: "Chè đậu xanh, Nước dừa", cost: 37000 },
  "Thứ Năm": { breakfast: "Phở gà, Sữa bắp", lunch: "Cơm trắng, Trứng đúc thịt, Canh cải thảo tôm khô", snack: "Bánh pudding, Chuối chín", cost: 36000 },
  "Thứ Sáu": { breakfast: "Mì Ý sốt bò băm, Nước ép dứa", lunch: "Cơm trắng, Gà chiên nước mắm, Canh chua cá lóc", snack: "Váng sữa, Nho đen", cost: 40000 },
};

export const mockIngredients: IngredientCost[] = [
  { id: "1", name: "Thịt heo nạc", quantity: 15, unit: "kg", unitPrice: 120000, total: 1800000 },
  { id: "2", name: "Gà ta thả vườn", quantity: 12, unit: "kg", unitPrice: 110000, total: 1320000 },
  { id: "3", name: "Sữa tươi TH True Milk", quantity: 5, unit: "thùng", unitPrice: 380000, total: 1900000 },
  { id: "4", name: "Rau củ quả sạch tổng hợp", quantity: 30, unit: "kg", unitPrice: 25000, total: 750000 },
  { id: "5", name: "Gạo thơm ST25", quantity: 50, unit: "kg", unitPrice: 28000, total: 1400000 },
];
