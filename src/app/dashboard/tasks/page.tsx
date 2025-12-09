"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    ChevronDown,
    X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { tasksAPI, usersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    deadline?: string;
    assignee: { id: string; name: string; avatar?: string };
    createdBy: { id: string; name: string };
}

interface User {
    id: string;
    name: string;
    email: string;
}

export default function TasksPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
        deadline: "",
        assigneeId: "",
    });

    useEffect(() => {
        loadData();
    }, [filterStatus]);

    const loadData = async () => {
        try {
            const filters = filterStatus !== "all" ? { status: filterStatus } : undefined;
            const [tasksRes, usersRes] = await Promise.all([
                tasksAPI.getAll(filters),
                usersAPI.getAll().catch(() => ({ users: [] })),
            ]);
            setTasks(tasksRes.tasks);
            setUsers(usersRes.users);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.assigneeId) {
            setError("Please select an assignee");
            return;
        }

        try {
            await tasksAPI.create({
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                deadline: formData.deadline || undefined,
                assigneeId: formData.assigneeId,
            });
            setShowCreateModal(false);
            setFormData({
                title: "",
                description: "",
                priority: "MEDIUM",
                deadline: "",
                assigneeId: "",
            });
            loadData();
        } catch (err: any) {
            setError(err.message || "Failed to create task");
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await tasksAPI.updateStatus(taskId, newStatus);
            loadData();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canCreateTask = user?.role === 'OWNER' || user?.role === 'MANAGER';

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-6 pb-20 lg:pb-0"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
                    <p className="text-slate-600">Manage and track all your tasks</p>
                </div>
                {canCreateTask && (
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                        New Task
                    </Button>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeInUp}>
                <Card hover={false} className="!p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Task List/Grid */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} hover={false} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : viewMode === "list" ? (
                <motion.div variants={fadeInUp}>
                    <Card hover={false} className="!p-0 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredTasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div
                                        onClick={() => {
                                            const nextStatus = task.status === 'PENDING' ? 'IN_PROGRESS' :
                                                task.status === 'IN_PROGRESS' ? 'UNDER_REVIEW' :
                                                    task.status === 'UNDER_REVIEW' ? 'COMPLETED' : 'PENDING';
                                            handleStatusChange(task.id, nextStatus);
                                        }}
                                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer transition-colors ${task.status === 'COMPLETED'
                                                ? 'bg-success-500 border-success-500'
                                                : 'border-slate-300 hover:border-primary-500'
                                            }`}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium ${task.status === 'COMPLETED'
                                                ? 'text-slate-500 line-through'
                                                : 'text-slate-900'
                                            }`}>
                                            {task.title}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate">{task.description}</p>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs">
                                                {task.assignee.name.charAt(0)}
                                            </div>
                                            <span className="text-sm text-slate-600">{task.assignee.name.split(' ')[0]}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <PriorityBadge priority={task.priority.toLowerCase() as any} />
                                        <StatusBadge status={task.status.toLowerCase().replace('_', '-') as any} />
                                    </div>

                                    {task.deadline && (
                                        <div className="hidden md:block text-sm text-slate-400">
                                            Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            ) : (
                <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task, i) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <PriorityBadge priority={task.priority.toLowerCase() as any} />
                                    <StatusBadge status={task.status.toLowerCase().replace('_', '-') as any} />
                                </div>
                                <h3 className={`font-medium mb-2 ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-900'
                                    }`}>
                                    {task.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs">
                                            {task.assignee.name.charAt(0)}
                                        </div>
                                        <span className="text-xs text-slate-500">{task.assignee.name.split(' ')[0]}</span>
                                    </div>
                                    {task.deadline && (
                                        <span className="text-xs text-slate-400">
                                            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!isLoading && filteredTasks.length === 0 && (
                <Card hover={false} className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <List className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                    <p className="text-slate-500 mb-4">
                        {searchQuery ? "Try a different search term" : "Create your first task to get started"}
                    </p>
                    {canCreateTask && (
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                            Create Task
                        </Button>
                    )}
                </Card>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create New Task</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none"
                                    rows={3}
                                    placeholder="Describe the task..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="input-field"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To *</label>
                                <select
                                    value={formData.assigneeId}
                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select team member</option>
                                    {users.filter(u => u.id !== user?.id).map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" fullWidth onClick={() => setShowCreateModal(false)} type="button">
                                    Cancel
                                </Button>
                                <Button fullWidth type="submit">
                                    Create Task
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
