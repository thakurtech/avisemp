"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import {
    Calendar,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { leavesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { clsx } from "clsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    employee: { id: string; name: string; department?: string };
    reviewer?: { id: string; name: string };
}

export default function LeavesPage() {
    const { user } = useAuth();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "pending">("my");
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [balance, setBalance] = useState({ casual: 12, sick: 12, earned: 24 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        type: "CASUAL" as "CASUAL" | "SICK" | "EARNED" | "UNPAID",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const canApprove = user?.role === 'OWNER' || user?.role === 'MANAGER';

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            const status = activeTab === "pending" ? "PENDING" : undefined;
            const [leavesRes, balanceRes] = await Promise.all([
                leavesAPI.getAll(status),
                leavesAPI.getBalance(),
            ]);
            setLeaves(leavesRes.leaves);
            setBalance(balanceRes.balance);
        } catch (err) {
            console.error('Failed to load leaves:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.startDate || !formData.endDate) {
            setError("Please select start and end dates");
            return;
        }

        try {
            await leavesAPI.create(formData);
            setShowApplyModal(false);
            setFormData({
                type: "CASUAL",
                startDate: "",
                endDate: "",
                reason: "",
            });
            loadData();
        } catch (err: any) {
            setError(err.message || "Failed to apply leave");
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await leavesAPI.approve(id);
            loadData();
        } catch (err: any) {
            alert(err.message || "Failed to approve");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await leavesAPI.reject(id);
            loadData();
        } catch (err: any) {
            alert(err.message || "Failed to reject");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-success-100 text-success-700";
            case "REJECTED": return "bg-danger-100 text-danger-700";
            default: return "bg-warning-100 text-warning-700";
        }
    };

    const myLeaves = leaves.filter(l => l.employee.id === user?.id);
    const pendingLeaves = leaves.filter(l => l.status === "PENDING" && l.employee.id !== user?.id);

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
                    <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
                    <p className="text-slate-600">Request and track your leaves</p>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowApplyModal(true)}>
                    Apply Leave
                </Button>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("my")}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                activeTab === "my"
                                    ? "bg-primary-500 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                            )}
                        >
                            My Leaves
                        </button>
                        {canApprove && (
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                    activeTab === "pending"
                                        ? "bg-primary-500 text-white"
                                        : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                                )}
                            >
                                Pending Approvals
                                {pendingLeaves.length > 0 && (
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs",
                                        activeTab === "pending" ? "bg-white/20" : "bg-warning-100 text-warning-700"
                                    )}>
                                        {pendingLeaves.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Leave List */}
                    <Card hover={false} className="!p-0">
                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="animate-pulse flex gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {(activeTab === "my" ? myLeaves : pendingLeaves).map((leave) => (
                                    <div key={leave.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                                                    <Calendar className="w-6 h-6 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium text-slate-900">
                                                            {leave.type.charAt(0) + leave.type.slice(1).toLowerCase()} Leave
                                                        </h3>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                                                            {leave.status.charAt(0) + leave.status.slice(1).toLowerCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">{leave.reason}</p>
                                                    {activeTab === "pending" && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs">
                                                                {leave.employee.name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-slate-600">{leave.employee.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {activeTab === "pending" && leave.status === "PENDING" && canApprove && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(leave.id)}
                                                        className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(leave.id)}
                                                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(activeTab === "my" ? myLeaves : pendingLeaves).length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>{activeTab === "my" ? "No leave requests yet" : "No pending approvals"}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Right Sidebar - Leave Balance */}
                <motion.div variants={fadeInUp} className="space-y-6">
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Leave Balance</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-primary-50 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-primary-700">Casual Leave</span>
                                    <span className="text-lg font-bold text-primary-700">{balance.casual}</span>
                                </div>
                                <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(balance.casual / 12) * 100}%` }} />
                                </div>
                                <p className="text-xs text-primary-600 mt-1">of 12 days</p>
                            </div>

                            <div className="p-4 bg-secondary-50 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-secondary-700">Sick Leave</span>
                                    <span className="text-lg font-bold text-secondary-700">{balance.sick}</span>
                                </div>
                                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary-500 rounded-full" style={{ width: `${(balance.sick / 12) * 100}%` }} />
                                </div>
                                <p className="text-xs text-secondary-600 mt-1">of 12 days</p>
                            </div>

                            <div className="p-4 bg-accent-50 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-accent-700">Earned Leave</span>
                                    <span className="text-lg font-bold text-accent-700">{balance.earned}</span>
                                </div>
                                <div className="h-2 bg-accent-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-500 rounded-full" style={{ width: `${(balance.earned / 24) * 100}%` }} />
                                </div>
                                <p className="text-xs text-accent-600 mt-1">of 24 days</p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Apply */}
                    <Card className="!bg-gradient-to-br !from-primary-50 !to-secondary-50 !border-primary-100">
                        <h3 className="font-semibold text-slate-900 mb-3">Quick Apply</h3>
                        <p className="text-sm text-slate-600 mb-4">Need time off? Start your leave request now.</p>
                        <Button fullWidth onClick={() => setShowApplyModal(true)}>
                            Apply for Leave
                        </Button>
                    </Card>

                    {/* Upcoming Holidays */}
                    <Card hover={false}>
                        <h3 className="font-semibold text-slate-900 mb-4">Upcoming Holidays</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Christmas", date: "Dec 25" },
                                { 