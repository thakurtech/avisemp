"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth, getRoleDashboardPath } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            // Get user from localStorage after login
            const userStr = localStorage.getItem('avis_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                router.push(getRoleDashboardPath(user.role));
            } else {
                router.push('/dashboard/employee');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (email: string, password: string) => {
        setFormData({ email, password });
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            const userStr = localStorage.getItem('avis_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                router.push(getRoleDashboardPath(user.role));
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold text-slate-900">AVIS</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                    <p className="text-slate-600 mb-8">Sign in to continue to your dashboard</p>

                    {error && (
                        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@company.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-600">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Sign in
                        </Button>
                    </form>

                    {/* Demo login buttons */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-3 text-center">Quick demo login:</p>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                fullWidth
                                size="sm"
                                onClick={() => handleQuickLogin('owner@avis.com', 'owner123')}
                                disabled={isLoading}
                            >
                                Owner
                            </Button>
                            <Button
                                variant="secondary"
                                fullWidth
                                size="sm"
                                onClick={() => handleQuickLogin('manager@avis.com', 'manager123')}
                                disabled={isLoading}
                            >
                                Manager
                            </Button>
                            <Button
                                variant="secondary"
                                fullWidth
                                size="sm"
                                onClick={() => handleQuickLogin('arun@avis.com', 'employee123')}
                                disabled={isLoading}
                            >
                                Employee
                            </Button>
                        </div>
                    </div>

                    {/* Sign up link */}
                    <p className="text-center text-slate-600 mt-8">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-primary-600 font-medium hover:text-primary-700">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center text-white"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-8">
                            <Sparkles className="w-4 h-4" />
                            <span>Collaboration Reimagined</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-4">Work Together.<br />Deliver Faster.</h2>
                        <p className="text-white/80 max-w-md">
                            AVIS brings structure to chaos. Join thousands of teams already collaborating effortlessly.
                        </p>
                    </motion.div>

                    {/* Floating cards */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 left-20 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success-400 flex items-center justify-center text-white">✓</div>
                            <div>
                                <p className="text-white text-sm font-medium">Task completed</p>
                                <p className="text-white/60 text-xs">Just now</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-20 right-20 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                    >
                        <div className="text-white">
                            <p className="text-2xl font-bold">+23%</p>
                            <p className="text-white/60 text-sm">productivity boost</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
