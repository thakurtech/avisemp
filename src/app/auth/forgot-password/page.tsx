"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-white">
            <div className="absolute inset-0 bg-mesh opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <span className="text-xl font-bold text-slate-900">AVIS</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-soft p-8 border border-slate-100">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-primary-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
                                <p className="text-slate-600">No worries, we&apos;ll send you reset instructions.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            className="input-field pl-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    isLoading={isLoading}
                                    rightIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    Send reset link
                                </Button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-success-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
                            <p className="text-slate-600 mb-6">
                                We&apos;ve sent a password reset link to<br />
                                <span className="font-medium text-slate-900">{email}</span>
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                Didn&apos;t receive the email?{" "}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-primary-600 font-medium hover:text-primary-700"
                                >
                                    Click to resend
                                </button>
                            </p>
                        </motion.div>
                    )}

                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 mt-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
