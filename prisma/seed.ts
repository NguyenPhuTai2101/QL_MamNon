import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu chuẩn theo file demo.docx vào PostgreSQL Database...');

  // 1. Clear old data gracefully
  try {
    await prisma.ingredientCost.deleteMany({});
    await prisma.dailyMenu.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.healthRecord.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.evaluation.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (e) {
    console.warn('Xóa dữ liệu cũ:', e);
  }

  // 2. Create Users (Admin, Teachers, Parents)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: '$2a$10$YourEncryptedPasswordHashHere', // admin123
      name: 'Ban Giám Hiệu Ánh Bình Minh',
      role: 'ADMIN',
      email: 'bgh@anhbinhminh.edu.vn',
      phone: '0901234567',
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      username: 'teacher',
      password: '$2a$10$YourEncryptedPasswordHashHere',
      name: 'Cô Nguyễn Thị Hương',
      role: 'TEACHER',
      email: 'huong.nt@anhbinhminh.edu.vn',
      phone: '0912345678',
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      username: 'parent',
      password: '$2a$10$YourEncryptedPasswordHashHere',
      name: 'Nguyễn Minh Triết',
      role: 'PARENT',
      email: 'triet.nm@example.com',
      phone: '0901234567',
    },
  });

  console.log('✅ Đã khởi tạo 3 Tài khoản người dùng (ADMIN, TEACHER, PARENT)');

  // 3. Create Classes matching demo.docx scale (Quy mô 60-70 trẻ, 3 lớp)
  const class12_24 = await prisma.class.create({
    data: {
      name: '12 – 24 tháng',
      room: 'Phòng Mầm Nhỏ 101',
      teacher: 'Cô Lê Thị Lan & Cô Đỗ Thu Hà',
    },
  });

  const class24_36 = await prisma.class.create({
    data: {
      name: '24 – 36 tháng',
      room: 'Phòng Mầm Vừa 102',
      teacher: 'Cô Nguyễn Thị Hương',
    },
  });

  const class3_5 = await prisma.class.create({
    data: {
      name: '3 – 5 tuổi (Chồi - Lá)',
      room: 'Phòng Lớn 201',
      teacher: 'Cô Phạm Thị Hoa',
    },
  });

  console.log('✅ Đã khởi tạo 3 Lớp học nhóm trẻ độc lập Ánh Bình Minh');

  // 4. Create Students according to demo.docx structure
  await prisma.student.create({
    data: {
      firstName: 'Nguyễn Minh',
      lastName: 'Khang',
      birthDate: new Date('2023-04-15'),
      gender: 'Nam',
      parentId: parentUser.id,
      parentName: 'Nguyễn Minh Triết',
      parentPhone: '0901234567',
      address: '123 Nguyễn Trãi, Q.5, TP.HCM',
      classId: class12_24.id,
    },
  });

  await prisma.student.create({
    data: {
      firstName: 'Lê Vy',
      lastName: 'Anh',
      birthDate: new Date('2022-08-20'),
      gender: 'Nữ',
      parentName: 'Lê Hoài Nam',
      parentPhone: '0912345678',
      address: '456 Lê Hồng Phong, Q.10, TP.HCM',
      classId: class24_36.id,
    },
  });

  await prisma.student.create({
    data: {
      firstName: 'Trần Bảo',
      lastName: 'Nam',
      birthDate: new Date('2021-11-10'),
      gender: 'Nam',
      parentName: 'Trần Quốc Bảo',
      parentPhone: '0923456789',
      address: '789 Cách Mạng Tháng 8, Q.3, TP.HCM',
      classId: class3_5.id,
    },
  });

  console.log('✅ Đã tạo hồ sơ đầy đủ học sinh (Mã HS, Họ tên, Ngày sinh, Giới tính, Lớp, Phụ huynh)');

  // 5. Seed 18 Ingredients matching Section 4 of demo.docx exactly
  const rawIngredients = [
    { code: 'TP001', name: 'Gạo ST25', quantity: 100, unit: 'Kg', unitPrice: 22000, totalCost: 2200000, supplier: 'Cửa hàng A' },
    { code: 'TP002', name: 'Thịt heo nạc', quantity: 50, unit: 'Kg', unitPrice: 130000, totalCost: 6500000, supplier: 'Cửa hàng B' },
    { code: 'TP003', name: 'Thịt gà ta', quantity: 40, unit: 'Kg', unitPrice: 95000, totalCost: 3800000, supplier: 'Cửa hàng B' },
    { code: 'TP004', name: 'Cá lóc tươi', quantity: 30, unit: 'Kg', unitPrice: 85000, totalCost: 2550000, supplier: 'Cửa hàng C' },
    { code: 'TP005', name: 'Tôm sú tươi', quantity: 20, unit: 'Kg', unitPrice: 180000, totalCost: 3600000, supplier: 'Hải sản D' },
    { code: 'TP006', name: 'Trứng gà tươi', quantity: 300, unit: 'Quả', unitPrice: 3000, totalCost: 900000, supplier: 'Trang trại E' },
    { code: 'TP007', name: 'Sữa tươi TH True Milk', quantity: 250, unit: 'Hộp', unitPrice: 8000, totalCost: 2000000, supplier: 'Vinamilk' },
    { code: 'TP008', name: 'Cà rốt Đà Lạt', quantity: 30, unit: 'Kg', unitPrice: 20000, totalCost: 600000, supplier: 'Chợ đầu mối' },
    { code: 'TP009', name: 'Khoai tây', quantity: 40, unit: 'Kg', unitPrice: 25000, totalCost: 1000000, supplier: 'Chợ đầu mối' },
    { code: 'TP010', name: 'Rau cải xanh', quantity: 35, unit: 'Kg', unitPrice: 18000, totalCost: 630000, supplier: 'Nông trại F' },
    { code: 'TP011', name: 'Bí đỏ', quantity: 30, unit: 'Kg', unitPrice: 18000, totalCost: 540000, supplier: 'Nông trại F' },
    { code: 'TP012', name: 'Chuối chín', quantity: 30, unit: 'Kg', unitPrice: 28000, totalCost: 840000, supplier: 'Chợ đầu mối' },
    { code: 'TP013', name: 'Táo Mỹ', quantity: 25, unit: 'Kg', unitPrice: 60000, totalCost: 1500000, supplier: 'Siêu thị' },
    { code: 'TP014', name: 'Dầu ăn Tường An', quantity: 20, unit: 'Chai', unitPrice: 55000, totalCost: 1100000, supplier: 'Nhà phân phối' },
    { code: 'TP015', name: 'Nước mắm Nam Ngư', quantity: 15, unit: 'Chai', unitPrice: 40000, totalCost: 600000, supplier: 'Nhà phân phối' },
    { code: 'TP016', name: 'Đường tinh luyện', quantity: 10, unit: 'Kg', unitPrice: 24000, totalCost: 240000, supplier: 'Cửa hàng A' },
    { code: 'TP017', name: 'Bột ngọt Ajinomoto', quantity: 5, unit: 'Kg', unitPrice: 65000, totalCost: 325000, supplier: 'Cửa hàng A' },
    { code: 'TP018', name: 'Muối sấy tinh khiết', quantity: 10, unit: 'Kg', unitPrice: 10000, totalCost: 100000, supplier: 'Cửa hàng A' },
  ];

  for (const item of rawIngredients) {
    await prisma.ingredientCost.create({
      data: {
        date: new Date('2026-08-03'),
        name: `[${item.code}] ${item.name}`,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalCost: item.totalCost,
        notes: `Nhà cung cấp: ${item.supplier}`,
      },
    });
  }

  console.log('✅ Đã seed 18 Thực phẩm đầu vào chuẩn Mục 4 demo.docx (Tổng nhập kho: 28.360.000đ)');

  // 6. Create Daily Menu matching Section 6 of demo.docx
  await prisma.dailyMenu.create({
    data: {
      date: new Date('2026-08-03'),
      breakfast: 'Cháo thịt bằm, Sữa tươi',
      lunch: 'Cơm, Thịt kho, Canh bí đỏ, Rau cải',
      snack: 'Chuối, Sữa đậu nành',
      costPerStudent: 30000,
    },
  });

  console.log('✅ Đã seed Thực đơn ngày 03/08/2026 chuẩn Mục 6 demo.docx (30.000đ/ngày)');

  // 7. Seed Staff matching Section 1 & 8 of demo.docx (6 GV, 1 Quản lý, 1 Kế toán)
  const staffMembers = [
    { fullName: 'Nguyễn Thị Hương', position: 'TEACHER', phone: '0987654321', assignedClass: '24 – 36 tháng', salary: 12000000, degree: 'Đại học Sư phạm Mầm non' },
    { fullName: 'Lê Thị Lan', position: 'TEACHER', phone: '0909090909', assignedClass: '12 – 24 tháng', salary: 11000000, degree: 'Cao đẳng Sư phạm' },
    { fullName: 'Đỗ Thu Hà', position: 'ASSISTANT', phone: '0777777777', assignedClass: '12 – 24 tháng', salary: 8000000, degree: 'Trung cấp Mầm non' },
    { fullName: 'Phạm Thị Hoa', position: 'TEACHER', phone: '0933333333', assignedClass: '3 – 5 tuổi', salary: 12500000, degree: 'Đại học Sư phạm' },
    { fullName: 'Trần Văn Mạnh', position: 'GUARD', phone: '0912345678', assignedClass: '', salary: 7000000, degree: 'THPT' },
    { fullName: 'Phạm Minh Tuấn', position: 'ADMIN_STAFF', phone: '0888888888', assignedClass: '', salary: 10000000, degree: 'Cử nhân Kế toán' },
  ];

  for (const s of staffMembers) {
    await prisma.staff.create({
      data: {
        fullName: s.fullName,
        position: s.position,
        phone: s.phone,
        startDate: new Date('2024-09-01'),
        status: 'ACTIVE',
        assignedClass: s.assignedClass,
        salary: s.salary,
        degree: s.degree,
      },
    });
  }

  console.log('✅ Đã seed Quy mô Nhân sự Nhóm trẻ (6 Giáo viên & Nhân viên, Quản lý, Kế toán)');

  // 8. Seed Leads (Tuyển sinh)
  await prisma.lead.createMany({
    data: [
      { parentName: 'Nguyễn Thị Hương', childName: 'Trần Minh Tuấn', childAgeGroup: '12–24 tháng', phone: '0901234567', email: 'huong.nguyen@example.com', source: 'Facebook', status: 'NEW', notes: 'Hỏi học phí' },
      { parentName: 'Trần Văn Dũng', childName: 'Lê Mai Trang', childAgeGroup: '24–36 tháng', phone: '0901234568', email: 'dung.tran@example.com', source: 'Website', status: 'CONTACTED', notes: 'Đã gọi điện tư vấn' },
      { parentName: 'Lê Thị Thu', childName: 'Phạm Gia Bảo', childAgeGroup: '3–5 tuổi', phone: '0901234569', email: 'thu.le@example.com', source: 'Giới thiệu', status: 'VISITED', notes: 'Đã hẹn tham quan' },
    ],
  });

  console.log('✅ Đã seed Hồ sơ phễu Tuyển sinh online');

  console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC SEED THÀNH CÔNG VÀO POSTGRESQL DATABASE!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
