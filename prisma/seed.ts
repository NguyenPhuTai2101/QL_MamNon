import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Đang khởi tạo dữ liệu mẫu vào Supabase PostgreSQL...");

  // Seed default Users
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "123456",
      name: "Admin NVSOFT",
      role: "ADMIN",
      email: "admin@nvsoft.vn",
    },
  });

  await prisma.user.upsert({
    where: { username: "giaovien" },
    update: {},
    create: {
      username: "giaovien",
      password: "123456",
      name: "Cô Nguyễn Thị Mai",
      role: "TEACHER",
      email: "mai.nguyen@mamnon.edu.vn",
    },
  });

  await prisma.user.upsert({
    where: { username: "phuhuynh" },
    update: {},
    create: {
      username: "phuhuynh",
      password: "123456",
      name: "Phụ huynh Nguyễn Minh Triết",
      role: "PARENT",
      email: "triet.nguyen@gmail.com",
    },
  });

  // Seed default Class
  const defaultClass = await prisma.class.upsert({
    where: { name: "Mầm 1" },
    update: {},
    create: {
      name: "Mầm 1",
      room: "Phòng 101",
      teacher: "Cô Nguyễn Thị Mai",
    },
  });

  // Seed default Student
  const existingStudent = await prisma.student.findFirst({
    where: { parentPhone: "0901234567" }
  });

  if (!existingStudent) {
    await prisma.student.create({
      data: {
        firstName: "Khang",
        lastName: "Nguyễn Minh",
        birthDate: new Date("2021-05-15"),
        gender: "Nam",
        parentName: "Nguyễn Minh Triết",
        parentPhone: "0901234567",
        classId: defaultClass.id,
      },
    });
  }

  console.log("Khởi tạo dữ liệu mẫu thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
