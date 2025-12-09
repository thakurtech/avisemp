"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import { StatusBadge } from "@/components/ui/Badge";
import {
    Users,
    CheckSquare,
    Clock,
    AlertTriangle,
    ChevronRight,
    Plus,
    UserCheck,
    UserX,
    CheckCircle,
    AlertCircle,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { managerStats, tasks, employees, leaveRequests, currentManager } from "@/lib/mock-data";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function ManagerDashboard() {
    const teamMembers = employees.filter(e => e.role === "employee");
    const pendingLeaves = leaveRequests.filter(l => l.status === "pending");
    const tasksNeedingReview = tasks.filter(t => t.status === "under-review");

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
                    <h1 className="text-2xl font-bold text-slate-900">Team Dashboard</h1>
                    <p className="text-slate-600">Manage your team&apos;s tasks and performance</p>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                    Assign New Task
                </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{managerStats.teamSize}</p>
                            <p className="text-xs text-slate-500">Team members</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{managerStats.pendingTasks}</p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{managerStats.inProgressTasks}</p>
                            <p className="text-xs text-slate-500">In Progress</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-success-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{managerStats.completedTasks}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </Card>

                <Card className="!p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-danger-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{managerStats.delayedTasks}</p>
                            <p className="text-xs text-slate-500">Delayed</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pending Approvals */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    {/* Tasks needing review */}
                    <Card hover={false} className="!p-0">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-slate-900">Tasks Under Review</h2>
                                {tasksNeedingReview.length > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
                                        {tasksNeedingReview.length}
                                    </span>
                                )}
                            </div>
                            <Link href="/dashboard/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {tasksNeedingReview.length > 0 ? tasksNeedingReview.map((task) => (
                                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs">
                                                    {task.assignee.name.charAt(0)}
                                                </div>
                                                <p className="text-sm text-slate-500">{task.assignee.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 text-sm font-medium text-success-700 bg-success-50 rounded-lg hover:bg-success-100 transition-colors">
                                                Approve
                                            </button>
                                            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                                                Request Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-300" />
                                    <p>No tasks pending review</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Leave Requests */}
                    <Card hover={false} className="!p-0">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-slate-900">Leave Requests</h2>
                                {pendingLeaves.length > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
                                        {pendingLeaves.length} pending
                                    </span>
                                )}
                            </div>
                            <Link href="/dashboard/leaves" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
                                <div key={leave.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-medium">
                                                {leave.employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{leave.employee.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave • {leave.startDate} to {leave.endDate}
                                                </p>
                                                <p className="text-sm text-slate-400 mt-1">{leave.reason}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors">
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                                                <AlertCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-300" />
                                    <p>No pending leave requests</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div variants={fadeInUp} className="space-y-6">
                    {/* Team Attendance Today */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Today&apos;s Attendance</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-success-50 rounded-xl">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <UserCheck className="w-4 h-4 text-success-600" />
                                    <span className="text-xl font-bold text-success-700">{managerStats.teamAttendanceToday.present}</span>
                                </div>
                                <p className="text-xs text-success-600">Present</p>
                            </div>
                            <div className="text-center p-3 bg-danger-50 rounded-xl">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <UserX className="w-4 h-4 text-danger-600" />
                                    <span className="text-xl font-bold text-danger-700">{managerStats.teamAttendanceToday.absent}</span>
                                </div>
                                <p className="text-xs text-danger-600">Absent</p>
                            </div>
                        </div>
                        <Link href="/dashboard/attendance" className="text-sm text-primary-600 hover:underline flex items-center justify-center gap-1">
                            View full report <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Card>

                    {/* Team Members */}
                    <Card hover={false}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Team Members</h3>
                            <Link href="/dashboard/team" className="text-xs text-primary-600 hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {teamMembers.slice(0, 4).map((member) => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-medium">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{member.designation}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-success-500' : 'bg-slate-300'}`} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="!bg-gradient-to-br !from-primary-50 !to-secondary-50 !border-primary-100">
                        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button fullWidth variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                                Create Task
                            </Button>
                            <Button fullWidth variant="ghost" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                                View Team Report
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
