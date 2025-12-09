"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import {
    CheckSquare,
    Clock,
    Calendar,
    TrendingUp,
    ChevronRight,
    Play,
    Pause,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { employeeStats, tasks, currentEmployee } from "@/lib/mock-data";
import { useState } from "react";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Get greeting based on time
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function EmployeeDashboard() {
    const [isClockedIn, setIsClockedIn] = useState(true);
    const [clockTime, setClockTime] = useState("09:15 AM");

    const myTasks = tasks.filter(t => t.assignee.id === currentEmployee.id);
    const todayTasks = myTasks.slice(0, 3); // Simulated "today's" tasks

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-20 lg:pb-0"
        >
            {/* Welcome Header */}
            <motion.div variants={fadeInUp} className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
                <p className="text-primary-100 text-sm mb-1">{getGreeting()}</p>
                <h1 className="text-2xl font-bold mb-2">{currentEmployee.name} 👋</h1>
                <p className="text-primary-100">
                    You have {employeeStats.tasksToday - employeeStats.tasksCompleted} tasks remaining today. Keep going!
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{employeeStats.tasksToday}</p>
                            <p className="text-xs text-slate-500">Tasks today</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-success-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{employeeStats.tasksCompleted}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{employeeStats.hoursToday}</p>
                            <p className="text-xs text-slate-500">Hours today</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{employeeStats.leaveBalance.casual}</p>
                            <p className="text-xs text-slate-500">Leaves left</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Today's Tasks */}
                <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Card hover={false} className="!p-0">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-900">Today&apos;s Tasks</h2>
                            <Link href="/dashboard/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {todayTasks.length > 0 ? todayTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={`/dashboard/tasks/${task.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 ${task.status === 'completed' ? 'bg-success-500 border-success-500' : 'border-slate-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{task.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PriorityBadge priority={task.priority} />
                                        <StatusBadge status={task.status} />
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-8 text-center text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-300" />
                                    <p>All tasks completed! 🎉</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Right column */}
                <motion.div variants={fadeInUp} className="space-y-6">
                    {/* Attendance Card */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Attendance</h3>
                        <div className="text-center">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isClockedIn ? 'bg-success-100' : 'bg-slate-100'}`}>
                                <Clock className={`w-8 h-8 ${isClockedIn ? 'text-success-600' : 'text-slate-400'}`} />
                            </div>
                            <p className="text-sm text-slate-500 mb-1">
                                {isClockedIn ? 'Clocked in at' : 'Not clocked in'}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 mb-4">{isClockedIn ? clockTime : '--:--'}</p>
                            <button
                                onClick={() => {
                                    if (isClockedIn) {
                                        setIsClockedIn(false);
                                    } else {
                                        setIsClockedIn(true);
                                        setClockTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                                    }
                                }}
                                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${isClockedIn
                                        ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                                        : 'bg-success-100 text-success-700 hover:bg-success-200'
                                    }`}
                            >
                                {isClockedIn ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isClockedIn ? 'Clock Out' : 'Clock In'}
                            </button>
                        </div>
                    </Card>

                    {/* Leave Balance */}
                    <Card hover={false}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Leave Balance</h3>
                            <Link href="/dashboard/leaves" className="text-xs text-primary-600 hover:underline">
                                Apply leave
                            </Link>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Casual</span>
                                <span className="font-semibold text-slate-900">{employeeStats.leaveBalance.casual} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Sick</span>
                                <span className="font-semibold text-slate-900">{employeeStats.leaveBalance.sick} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Earned</span>
                                <span className="font-semibold text-slate-900">{employeeStats.leaveBalance.earned} days</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Tip */}
                    <Card className="!bg-gradient-to-br !from-primary-50 !to-secondary-50 !border-primary-100">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 text-sm">Productivity Tip</p>
                                <p className="text-xs text-slate-600 mt-1">
                                    Complete your high-priority tasks before lunch for a more productive day!
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div variants={fadeInUp}>
                <Card hover={false} className="!p-0">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { text: 'Completed task "Design review meeting"', time: '2 hours ago', type: 'success' },
                            { text: 'Manager added comment on "Auth API"', time: '4 hours ago', type: 'info' },
                            { text: 'New task assigned: "Update docs"', time: 'Yesterday', type: 'warning' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-4">
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-success-500' :
                                        activity.type === 'warning' ? 'bg-warning-500' : 'bg-primary-500'
                                    }`} />
                                <p className="text-sm text-slate-700 flex-1">{activity.text}</p>
                                <p className="text-xs text-slate-400">{activity.time}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
