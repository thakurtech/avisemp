"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import {
    Users,
    CheckSquare,
    TrendingUp,
    TrendingDown,
    Building2,
    ChevronRight,
    Download,
    ArrowUpRight,
    AlertTriangle,
    Award
} from "lucide-react";
import Link from "next/link";
import { ownerStats, employees } from "@/lib/mock-data";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function OwnerDashboard() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-20 lg:pb-0"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
                    <p className="text-slate-600">Complete overview of your organization</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                        Export Report
                    </Button>
                </div>
            </motion.div>

            {/* Main Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Total Employees</p>
                            <p className="text-3xl font-bold text-slate-900">{ownerStats.totalEmployees}</p>
                            <div className="flex items-center gap-1 mt-2 text-success-600 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>+3 this month</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </Card>

                <Card className="!p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Departments</p>
                            <p className="text-3xl font-bold text-slate-900">{ownerStats.departments}</p>
                            <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                                <Building2 className="w-4 h-4" />
                                <span>All active</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-secondary-600" />
                        </div>
                    </div>
                </Card>

                <Card className="!p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Task Completion</p>
                            <p className="text-3xl font-bold text-slate-900">{ownerStats.completionRate}%</p>
                            <div className="flex items-center gap-1 mt-2 text-success-600 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>+5% vs last month</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-success-100 flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-success-600" />
                        </div>
                    </div>
                </Card>

                <Card className="!p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Productivity</p>
                            <p className="text-3xl font-bold text-slate-900">+{ownerStats.productivityTrend}%</p>
                            <div className="flex items-center gap-1 mt-2 text-success-600 text-sm">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>Trending up</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-accent-600" />
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    {/* Task Overview Chart */}
                    <Card hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-slate-900">Task Overview</h2>
                            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>

                        {/* Simple chart visualization */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-success-50 rounded-xl">
                                <p className="text-3xl font-bold text-success-700">{ownerStats.monthlyTasks.completed}</p>
                                <p className="text-sm text-success-600">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-warning-50 rounded-xl">
                                <p className="text-3xl font-bold text-warning-700">{ownerStats.monthlyTasks.pending}</p>
                                <p className="text-sm text-warning-600">Pending</p>
                            </div>
                            <div className="text-center p-4 bg-danger-50 rounded-xl">
                                <p className="text-3xl font-bold text-danger-700">{ownerStats.monthlyTasks.delayed}</p>
                                <p className="text-sm text-danger-600">Delayed</p>
                            </div>
                        </div>

                        {/* Bar chart visualization */}
                        <div className="h-48 flex items-end justify-around gap-2 bg-slate-50 rounded-xl p-4">
                            {[65, 82, 45, 90, 72, 88, 95].map((value, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${value}%` }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {value}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-around mt-2 text-xs text-slate-500">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                <span key={day}>{day}</span>
                            ))}
                        </div>
                    </Card>

                    {/* Department Performance */}
                    <Card hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-slate-900">Department Performance</h2>
                            <Link href="/dashboard/analytics" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View details <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {ownerStats.departmentPerformance.map((dept) => (
                                <div key={dept.name}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                                        <span className="text-sm font-bold text-slate-900">{dept.completion}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${dept.completion}%` }}
                                            transition={{ duration: 0.8 }}
                                            className={`h-full rounded-full ${dept.completion >= 90 ? 'bg-success-500' :
                                                    dept.completion >= 80 ? 'bg-primary-500' :
                                                        dept.completion >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div variants={fadeInUp} className="space-y-6">
                    {/* Top Performers */}
                    <Card hover={false}>
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-warning-500" />
                            <h3 className="font-semibold text-slate-900">Top Performers</h3>
                        </div>
                        <div className="space-y-4">
                            {ownerStats.topPerformers.map((performer, i) => (
                                <div key={performer.name} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                            i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                                                'bg-gradient-to-br from-amber-600 to-amber-700'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{performer.name}</p>
                                        <p className="text-xs text-slate-500">{performer.tasks} tasks • {performer.rate}% rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* At-Risk Tasks */}
                    <Card hover={false} className="!border-danger-200 !bg-danger-50/50">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-danger-500" />
                            <h3 className="font-semibold text-slate-900">At-Risk Tasks</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                            {ownerStats.monthlyTasks.delayed} tasks are delayed and need attention
                        </p>
                        <Link href="/dashboard/tasks?status=delayed">
                            <Button variant="danger" size="sm" fullWidth>
                                Review Delayed Tasks
                            </Button>
                        </Link>
                    </Card>

                    {/* Quick Links */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/employees"
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Manage Employees</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link
                                href="/dashboard/analytics"
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Full Analytics</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link
                                href="/dashboard/attendance"
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckSquare className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Attendance Overview</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                        </div>
                    </Card>

                    {/* Export Options */}
                    <Card className="!bg-gradient-to-br !from-slate-800 !to-slate-900 !text-white !border-slate-700">
                        <h3 className="font-semibold mb-2">Generate Reports</h3>
                        <p className="text-sm text-slate-300 mb-4">
                            Export comprehensive reports in PDF or CSV format
                        </p>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                                PDF
                            </Button>
                            <Button variant="secondary" size="sm" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                                CSV
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
