"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, XCircle } from "lucide-react";
import { api } from "@/lib/api-client";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [checking, setChecking] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect -- validating the token from the URL on load */
    useEffect(() => {
        if (!token) {
            setTokenError("This reset link is missing a token.");
            setChecking(false);
            return;
        }
        api.get<{ valid: boolean; email: string }>(`/api/auth/reset-password?token=${token}`).then((res) => {
            setChecking(false);
            if (res.success) {
                setTokenValid(true);
            } else {
                setTokenError(res.error);
            }
        });
    }, [token]);
    /* eslint-enable react-hooks/set-state-in-effect */

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        const res = await api.post("/api/auth/reset-password", { token, newPassword });
        setSubmitting(false);

        if (!res.success) {
            setError(res.error);
            return;
        }

        setDone(true);
        setTimeout(() => router.push("/login"), 2000);
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
                    <h1 className="text-white font-bold text-lg tracking-wide">Set a new password</h1>
                </div>

                {checking ? (
                    <p className="text-center text-white/70 text-sm">Checking your link...</p>
                ) : !tokenValid ? (
                    <div className="rounded-xl bg-white/10 border border-white/10 p-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                            <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <p className="text-white text-sm font-medium">Link invalid or expired</p>
                        <p className="text-white/70 text-sm mt-1.5">{tokenError}</p>
                        <Link
                            href="/forgot-password"
                            className="inline-block mt-4 text-sm text-gold-500 hover:text-gold-600 underline underline-offset-2"
                        >
                            Request a new link
                        </Link>
                    </div>
                ) : done ? (
                    <div className="rounded-xl bg-white/10 border border-white/10 p-5 text-center">
                        <p className="text-white text-sm font-medium">Password updated!</p>
                        <p className="text-white/70 text-sm mt-1.5">Taking you to the login page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
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
                            placeholder="Confirm new password"
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
                            className="w-full rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 font-semibold py-3 text-sm transition-colors shadow-lg shadow-black/20"
                        >
                            {submitting ? "Updating..." : "Update Password"}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}