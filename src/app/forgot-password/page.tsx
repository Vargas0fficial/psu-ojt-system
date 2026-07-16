"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setSubmitting(true);
        const res = await api.post<{ message: string }>("/api/auth/forgot-password", { email });
        setSubmitting(false);

        if (!res.success) {
            setError(res.error);
            return;
        }

        setSent(true);
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
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-white/10 bg-white shadow-lg mb-3">
                        <Image src="/images/logo.jpg" alt="PSU seal" width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <h1 className="text-white font-bold text-lg tracking-wide">Reset your password</h1>
                    <p className="text-white/60 text-sm mt-1">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="rounded-xl bg-white/10 border border-white/10 p-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-6 w-6 text-success-600" />
                        </div>
                        <p className="text-white text-sm font-medium">Check your email</p>
                        <p className="text-white/70 text-sm mt-1.5 leading-relaxed">
                            If an account exists for <span className="font-medium">{email}</span>, a
                            password reset link is on its way. The link expires in 1 hour.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                autoComplete="email"
                                className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gold-500"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 font-semibold py-3 text-sm transition-colors shadow-lg shadow-black/20"
                        >
                            {submitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-white/70 hover:text-white mt-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}