"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play,
    Pause
} from "lucide-react";
import { useState, useEffect } from "react";
import { attendanceAPI } from "@/lib/api";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Generate calendar days
function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return days;
}

export default function AttendancePage() {
    const [currentDate] = useState(new Date());
    const [viewMonth, setViewMonth] = useState(new Date());
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, halfDay: 0, totalHours: "0" });
    const [records, setRecords] = useState<any[]>([]);

    const calendarDays = generateCalendarDays(viewMonth.getFullYear(), viewMonth.getMonth());
    const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    useEffect(() => {
        loadData();
    }, [viewMonth]);

    const loadData = async () => {
        try {
            const [todayRes, statsRes, recordsRes] = await Promise.all([
                attendanceAPI.getToday(),
                attendanceAPI.getStats(),
                attendanceAPI.getAll({
                    month: viewMonth.getMonth() + 1,
                    year: viewMonth.getFullYear()
                }),
            ]);

            setIsClockedIn(todayRes.isClockedIn);
            if (todayRes.clockIn) {
                setClockInTime(new Date(todayRes.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            }
            setStats(statsRes);
            setRecords(recordsRes.records);
        } catch (err) {
            console.error('Failed to load attendance:', err);
        }
    };

    const handleClockIn = async () => {
        setIsLoading(true);
        try {
            const res = await attendanceAPI.clockIn();
            setIsClockedIn(true);
            setClockInTime(res.clockIn);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to clock in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClockOut = async () => {
        setIsLoading(true);
        try {
            await attendanceAPI.clockOut();
            setIsClockedIn(false);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to clock out');
        } finally {
            setIsLoading(false);
        }
    };

    // Get attendance status for calendar
    const getAttendanceStatus = (day: number | null) => {
        if (!day) return null;
        const dateStr = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = records.find(r => r.date?.startsWith(dateStr));
        return record?.status?.toLowerCase() || null;
    };

    const prevMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6 pb-20 lg:pb-0"
        >
            {/* Header */}
            <motion.div variants={fadeInUp}>
                <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                <p className="text-slate-600">Track your daily attendance and work hours</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    {/* Clock In/Out Card */}
                    <Card hover={false}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-slate-500 mb-1">Today, {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-success-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-lg font-semibold text-slate-900">
                                        {isClockedIn ? `Clocked in since ${clockInTime}` : 'Not clocked in yet'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-900">{stats.totalHours}</p>
                                    <p className="text-sm text-slate-500">Hours this month</p>
                                </div>
                                <button
                                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                                    disabled={isLoading}
                                    className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 disabled:opacity-50 ${isClockedIn
                                            ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                                            : 'bg-success-500 text-white hover:bg-success-600 shadow-lg shadow-success-500/25'
                                        }`}
                                >
                                    {isClockedIn ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    {isLoading ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Calendar */}
                    <Card hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-600" />
                                Attendance Calendar
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-medium text-slate-900 min-w-[150px] text-center">{monthName}</span>
                                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                    {day}
                                </div>
                            ))}

                            {calendarDays.map((day, i) => {
                                const status = getAttendanceStatus(day);
                                const isToday = day === currentDate.getDate() &&
                                    viewMonth.getMonth() === currentDate.getMonth() &&
                                    viewMonth.getFullYear() === currentDate.getFullYear();

                                return (
                                    <div
                                        key={i}
                                        className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${!day ? '' :
                                                isToday ? 'bg-primary-500 text-white font-bold' :
                                                    status === 'present' ? 'bg-success-100 text-success-700' :
                                                        status === 'absent' ? 'bg-danger-100 text-danger-700' :
                                                            status === 'half_day' ? 'bg-warning-100 text-warning-700' :
                                                                'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-success-100" />
                                <span className="text-xs text-slate-600">Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-danger-100" />
                                <span className="text-xs text-slate-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-warning-100" />
                                <span className="text-xs text-slate-600">Half Day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-primary-500" />
                                <span className="text-xs text-slate-600">Today</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Right Column - Stats */}
                <motion.div variants={fadeInUp} className="space-y-6">
                    {/* Monthly Summary */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">This Month</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-success-600" />
                                    <span className="text-sm text-success-700">Present</span>
                                </div>
                                <span className="text-lg font-bold text-success-700">{stats.present} days</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-danger-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-5 h-5 text-danger-600" />
                                    <span className="text-sm text-danger-700">Absent</span>
                                </div>
                                <span className="text-lg font-bold text-danger-700">{stats.absent} days</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-warning-600" />
                                    <span className="text-sm text-warning-700">Half Day</span>
                                </div>
                                <span className="text-lg font-bold text-warning-700">{stats.halfDay} days</span>
                            </div>
                        </div>
                    </Card>

                    {/* Work Hours */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Work Hours</h3>
                        <div className="text-center py-4">
                            <p className="text-4xl font-bold text-slate-900">{stats.totalHours}</p>
                            <p className="text-sm text-slate-500">Total hours this month</p>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (parseFloat(stats.totalHours) / 176) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            {Math.round((parseFloat(stats.totalHours) / 176) * 100)}% of target (176 hrs)
                        </p>
                    </Card>

                    {/* Recent History */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Recent History</h3>
                        <div className="space-y-3">
                            {records.slice(0, 4).map((record, i) => (
                                <div key={record.id || i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            {' - '}
                                            {record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'PRESENT' ? 'bg-success-100 text-success-700' :
                                            record.status === 'ABSENT' ? 'bg-danger-100 text-danger-700' :
                                                'bg-warning-100 text-warning-700'
                                        }`}>
                                        {record.status?.charAt(0) + record.status?.slice(1).toLowerCase()}
                                    </div>
                                </div>
                            ))}
                            {records.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No records yet</p>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
