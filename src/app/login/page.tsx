"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, UserCheck, HeartHandshake, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "TEACHER" | "PARENT">("ADMIN");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role: "ADMIN" | "TEACHER" | "PARENT") => {
    setSelectedRole(role);
    setError("");
    if (role === "ADMIN") setUsername("admin");
    if (role === "TEACHER") setUsername("giaovien");
    if (role === "PARENT") setUsername("phuhuynh");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại.");
      }

      // Save user session in localStorage
      localStorage.setItem("user_session", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hệ thống Mầm Non NVSOFT</h1>
          <p className="text-xs text-slate-300">Vui lòng chọn vai trò và đăng nhập để tiếp tục</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-1.5 rounded-2xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => handleRoleChange("ADMIN")}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === "ADMIN" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1" />
            Quản trị
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("TEACHER")}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === "TEACHER" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4 mb-1" />
            Giáo viên
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("PARENT")}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === "PARENT" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <HeartHandshake className="w-4 h-4 mb-1" />
            Phụ huynh
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        {/* Demo hints footer */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/10 pt-4">
          <p>Mật khẩu thử nghiệm chung: <span className="font-mono text-indigo-300 font-bold">123456</span></p>
        </div>
      </div>
    </div>
  );
}
