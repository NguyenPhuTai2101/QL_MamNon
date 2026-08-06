"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Clock, 
  User, 
  Baby, 
  ArrowLeft,
  Calendar
} from 'lucide-react';

export default function RegistrationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    parentName: '',
    phone: '',
    email: '',
    childName: '',
    childBirthDate: '',
    ageGroup: '18-36T',
    desiredStartDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parentName || !form.phone || !form.childName) return;

    setLoading(true);

    try {
      await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: form.parentName,
          childName: form.childName,
          ageGroup: form.ageGroup === '18-36T' ? '18-36 tháng (Nhà trẻ)' : form.ageGroup === '3-4T' ? '3-4 tuổi (Mầm)' : form.ageGroup === '4-5T' ? '4-5 tuổi (Chồi)' : '5-6 tuổi (Lá)',
          phone: form.phone,
          email: form.email,
          source: 'Website đăng ký online',
          status: 'NEW',
          notes: `Ngày muốn nhập học: ${form.desiredStartDate || 'Càng sớm càng tốt'}. Ghi chú: ${form.notes || 'Không'}`,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Public Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              MẦM NON NVSOFT
            </h1>
            <p className="text-[11px] text-indigo-400 font-semibold tracking-wider uppercase">Cơ sở Giáo dục Mầm non Chất lượng cao</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ ERP</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
        {/* Left Side: Brand Value Proposition & School Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Tuyển Sinh Năm Học 2026 - 2027
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Ươm Mầm Tương Lai Rạng Rỡ Cho Bé Yêu
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Mầm non NVSOFT tự hào mang đến môi trường giáo dục an toàn, tràn ngập tình yêu thương cùng phương pháp phát triển tư duy sáng tạo chuẩn quốc tế cho trẻ từ 18 tháng đến 6 tuổi.
          </p>

          {/* Value Highlights */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">An Toàn Tuyệt Đối & Camera 24/7</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hệ thống bảo vệ chặt chẽ, điểm danh đón trả bằng mã QR thông minh.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Dinh Dưỡng Học Đường Chuẩn Y Khoa</h3>
                <p className="text-xs text-slate-400 mt-0.5">Thực đơn phong phú 3 bữa/ngày, tính toán calo chuẩn dinh dưỡng cho trẻ.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Chương Trình Ngoại Khóa & Tiếng Anh</h3>
                <p className="text-xs text-slate-400 mt-0.5">Giáo viên bản ngữ, các môn năng khiếu múa, vẽ, võ thuật và kỹ năng sống.</p>
              </div>
            </div>
          </div>

          {/* Direct Hotline Box */}
          <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-5 rounded-2xl border border-indigo-500/30 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Tư vấn trực tiếp 24/7</h4>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-indigo-400" />
              <span className="text-lg font-extrabold text-white">0901.234.567 - (028) 38.999.888</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          {submitted ? (
            <div className="py-12 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Đăng Ký Thành Công!</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Cảm ơn Quý phụ huynh <strong className="text-indigo-600">{form.parentName}</strong> đã tin tưởng đăng ký thông tin cho bé <strong className="text-indigo-600">{form.childName}</strong>.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-w-md mx-auto text-xs text-slate-500 space-y-1 text-left">
                <p>✓ Đã ghi nhận hồ sơ vào hệ thống Quản lý Tuyển sinh ERP.</p>
                <p>✓ Bộ phận tư vấn sẽ gọi điện hỗ trợ và mời xếp lịch tham quan trường trong vòng 24h làm việc.</p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    parentName: '',
                    phone: '',
                    email: '',
                    childName: '',
                    childBirthDate: '',
                    ageGroup: '18-36T',
                    desiredStartDate: '',
                    notes: '',
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-sm"
              >
                Đăng ký cho bé thứ hai
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Đăng Ký Tư Vấn & Tham Quan Trường</h3>
                <p className="text-xs text-slate-500 mt-1">Quý Phụ huynh vui lòng điền thông tin bên dưới để Ban tuyển sinh hỗ trợ chu đáo nhất.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Parent Section */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-500" /> Thông tin Phụ huynh
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên Phụ huynh *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn Nam"
                        value={form.parentName}
                        onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại Zalo / Gọi *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0901234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Địa chỉ Email</label>
                    <input
                      type="email"
                      placeholder="phuhuynh@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Child Section */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-indigo-500" /> Thông tin Bé
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên bé *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Minh Khang"
                        value={form.childName}
                        onChange={(e) => setForm({ ...form, childName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nhóm tuổi tuyển sinh *</label>
                      <select
                        value={form.ageGroup}
                        onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800"
                      >
                        <option value="18-36T">Nhà trẻ (18 - 36 tháng)</option>
                        <option value="3-4T">Lớp Mầm (3 - 4 tuổi)</option>
                        <option value="4-5T">Lớp Chồi (4 - 5 tuổi)</option>
                        <option value="5-6T">Lớp Lá (5 - 6 tuổi)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Ngày sinh của bé</label>
                      <input
                        type="date"
                        value={form.childBirthDate}
                        onChange={(e) => setForm({ ...form, childBirthDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Dự kiến ngày học</label>
                      <input
                        type="date"
                        value={form.desiredStartDate}
                        onChange={(e) => setForm({ ...form, desiredStartDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú thêm từ Phụ huynh</label>
                    <textarea
                      rows={2}
                      placeholder="Dặn dò về thói quen ăn uống, mong muốn đặc biệt khi gửi trẻ..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 text-base"
                  >
                    {loading ? (
                      <span>Đang gửi thông tin...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gửi Đăng Ký Tư Vấn & Nhập Học
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        © 2026 Hệ thống Trường Mầm Non NVSOFT ERP. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  );
}
