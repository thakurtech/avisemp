"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    CheckSquare,
    Clock,
    Calendar,
    Users,
    BarChart3,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
    { label: "Tasks", href: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" />, roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
    { label: "Attendance", href: "/dashboard/attendance", icon: <Clock className="w-5 h-5" />, roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
    { label: "Leaves", href: "/dashboard/leaves", icon: <Calendar className="w-5 h-5" />, roles: ["EMPLOYEE", "MANAGER", "OWNER"] },
    { label: "Employees", href: "/dashboard/employees", icon: <Users className="w-5 h-5" />, roles: ["MANAGER", "OWNER"] },
    { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" />, roles: ["MANAGER", "OWNER"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Redirect to role-specific dashboard
    useEffect(() => {
        if (user && pathname === '/dashboard') {
            if (user.role === 'OWNER') {
                router.push('/dashboard/owner');
            } else if (user.role === 'MANAGER') {
                router.push('/dashboard/manager');
            } else {
                router.push('/dashboard/employee');
            }
        }
    }, [user, pathname, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold animate-pulse">
                        A
                    </div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const filteredNavItems = navItems.filter(item =>
        !item.roles || item.roles.includes(user?.role || '')
    );

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-slate-200">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <span className="text-xl font-bold text-slate-900">AVIS</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                            (item.href === '/dashboard' && (
                                pathname === '/dashboard/employee' ||
                                pathname === '/dashboard/manager' ||
                                pathname === '/dashboard/owner'
                            ));

                        return (
                            <Link
                                key={item.href}
                                href={item.href === '/dashboard' ? `/dashboard/${user?.role?.toLowerCase()}` : item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <span className={clsx(isActive ? "text-primary-600" : "text-slate-400")}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-medium">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.designation || user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                    <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search */}
                        <div className="hidden sm:flex flex-1 max-w-md mx-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
                            </button>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="font-medium text-slate-900">{user?.name}</p>
                                                <p className="text-sm text-slate-500">{user?.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                                                    {user?.role}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <span className="text-xl font-bold text-slate-900">AVIS</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="px-4 py-6 space-y-1">
                                {filteredNavItems.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href === '/dashboard' ? `/dashboard/${user?.role?.toLowerCase()}` : item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-primary-50 text-primary-700"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className={isActive ? "text-primary-600" : "text-slate-400"}>{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile bottom nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-30">
                <div className="flex items-center justify-around py-2">
                    {filteredNavItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                            (item.href === '/dashboard' && pathname.includes('/dashboard/'));

                        return (
                            <Link
                                key={item.href}
                                href={item.href === '/dashboard' ? `/dashboard/${user?.role?.toLowerCase()}` : item.href}
                                className={clsx(
                                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                                    isActive ? "text-primary-600" : "text-slate-400"
                                )}
                            >
                                {item.icon}
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
