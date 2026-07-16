"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { api } from "@/lib/api-client";

type Role = "intern" | "supervisor";
type Supervisor = { id: string; name: string };

export function RegisterForm({ role }: { role: Role }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role !== "intern") return;
    api.get<Supervisor[]>("/api/supervisors").then((res) => {
      if (res.success) setSupervisors(res.data);
    });
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await api.post("/api/auth/register", {
      name,
      email,
      password,
      role,
      course: role === "intern" ? course : undefined,
      department: role === "supervisor" ? department : undefined,
      supervisorId: role === "intern" && supervisorId ? supervisorId : undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(role === "supervisor" ? "/supervisor" : "/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0">
        <Image src="/images/campus-bg.jpg" alt="PSU Main Campus" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-800/85" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-white/10 bg-white shadow-lg mb-3">
            <Image src="/images/logo.jpg" alt="PSU seal" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-white font-bold text-lg tracking-wide capitalize">Create {role} account</h1>
          <p className="text-white/60 text-sm mt-1">Join the PSU OJT Monitoring System</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {role === "intern" ? (
            <>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Course / Program (e.g. BSIT)"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
              />
              <select
                value={supervisorId}
                onChange={(e) => setSupervisorId(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Assign supervisor later</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department / Office"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
          )}

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl bg-white pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
          />

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 font-semibold py-3 text-sm transition-colors shadow-lg shadow-black/20 mt-1"
          >
            {submitting ? "Creating account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-500 hover:text-gold-600 font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
        <p className="text-center text-white/50 text-xs mt-2">
          Registering as {role}?{" "}
          <Link
            href={role === "intern" ? "/register/supervisor" : "/register/intern"}
            className="text-white/70 hover:text-white underline underline-offset-2"
          >
            Switch to {role === "intern" ? "supervisor" : "intern"} sign-up
          </Link>
        </p>
      </div>
    </div>
  );
}
