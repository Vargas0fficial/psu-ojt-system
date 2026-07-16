"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, GraduationCap, Briefcase } from "lucide-react";
import { api } from "@/lib/api-client";

type Role = "intern" | "supervisor";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("intern");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    const result = await api.post<{ role: Role }>("/api/auth/login", {
      email,
      password,
      role,
      remember,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(result.data.role === "supervisor" ? "/supervisor" : "/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0">
        <Image
          src="/images/campus-bg.jpg"
          alt="PSU Main Campus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-800/85" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-white/10 bg-white shadow-lg mb-4">
            <Image
              src="/images/logo.jpg"
              alt="Pangasinan State University seal"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-white font-bold text-xl tracking-wide leading-tight">
            PSU OJT
          </h1>
          <p className="text-white/70 text-xs tracking-[0.2em] font-medium mt-0.5">
            MONITORING SYSTEM
          </p>
          <p className="text-white/60 text-sm mt-3">Sign in to your account</p>
        </div>

        <div className="flex rounded-xl bg-white/10 p-1 mb-5">
          {(["intern", "supervisor"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${role === r ? "bg-white text-navy-900" : "text-white/70 hover:text-white"
                }`}
            >
              {r === "intern" ? (
                <GraduationCap className="h-4 w-4" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or Email"
              autoComplete="email"
              className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-xl bg-white pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-white/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-gold-500"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-white/70 hover:text-white underline underline-offset-2">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 font-semibold py-3 text-sm transition-colors shadow-lg shadow-black/20"
          >
            {submitting ? "Signing in..." : "LOGIN"}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register/${role}`}
            className="text-gold-500 hover:text-gold-600 font-medium underline underline-offset-2"
          >
            Create {role} account
          </Link>
        </p>
      </div>
    </div>
  );
}