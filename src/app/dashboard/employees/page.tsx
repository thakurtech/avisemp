"use client";

import { motion } from "framer-motion";
import { Card, Button } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import {
    Plus,
    Search,
    MoreVertical,
    Mail,
    Phone,
    Building2,
    User,
    Edit2,
    Trash2,
    X,
    UserPlus
} from "lucide-react";
import { useState, useEffect } from "react";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
    designation?: string;
    department?: string;
    status: string;
    managerId?: string;
    manager?: { id: string; name: string };
}

export default function EmployeesPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "EMPLOYEE" as "MANAGER" | "EMPLOYEE",
        designation: "",
        department: "",
        managerId: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, managersRes] = await Promise.all([
                usersAPI.getAll(),
                usersAPI.getManagers().catch(() => ({ managers: [] })),
            ]);
            setUsers(usersRes.users);
            setManagers(managersRes.managers);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await usersAPI.create(formData);
            setShowAddModal(false);
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                role: "EMPLOYEE",
                designation: "",
                department: "",
                managerId: "",
            });
            loadData();
        } catch (err: any) {
            setError(err.message || "Failed to create user");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await usersAPI.delete(id);
            loadData();
        } catch (err: any) {
            alert(err.message || "Failed to delete user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isOwner = currentUser?.role === 'OWNER';

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-6 pb-20 lg:pb-0"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                    <p className="text-slate-600">Manage your team members</p>
                </div>
                {isOwner && (
                    <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                        Add Employee
                    </Button>
                )}
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeInUp}>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                </div>
            </motion.div>

            {/* Employee Grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} hover={false} className="animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} hover={false} className="relative">
                            {isOwner && user.role !== 'OWNER' && (
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                                    <p className="text-sm text-slate-500 truncate">{user.designation || 'Team Member'}</p>
                                    <Badge
                                        variant={user.role === 'OWNER' ? 'primary' : user.role === 'MANAGER' ? 'warning' : 'default'}
                                        className="mt-2"
                                    >
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {user.department && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span>{user.department}</span>
                                    </div>
                                )}
                                {user.manager && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>Reports to: {user.manager.name}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </motion.div>
            )}

            {!isLoading && filteredUsers.length === 0 && (
                <Card hover={false} className="text-center py-12">
                    <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No employees found</h3>
                    <p className="text-slate-500">
                        {searchQuery ? "Try a different search term" : "Add your first team member to get started"}
                    </p>
                </Card>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Add New Employee</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "MANAGER" | "EMPLOYEE" })}
                                    className="input-field"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="MANAGER">Manager</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g. Developer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g. Engineering"
                                    />
                                </div>
                            </div>

                            {formData.role === "EMPLOYEE" && managers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Manager</label>
                                    <select
                                        value={formData.managerId}
                                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">No manager</option>
                                        {managers.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)} type="button">
                                    Cancel
                                </Button>
                                <Button fullWidth type="submit">
                                    Add Employee
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
