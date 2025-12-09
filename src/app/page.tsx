"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui";
import Link from "next/link";
import {
    CheckCircle,
    Users,
    BarChart3,
    Clock,
    FileText,
    Calendar,
    ArrowRight,
    Play,
    Sparkles,
    Zap,
    Shield,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { useState, useRef } from "react";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// ============ HERO SECTION ============
function HeroSection() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-mesh opacity-60" />
            <div className="absolute inset-0 bg-dot-pattern opacity-30" />

            {/* Floating orbs */}
            <motion.div
                className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl"
                animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"
                animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div style={{ y, opacity }} className="section-container relative z-10 py-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Collaboration Reimagined</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
                            Work Together.
                            <br />
                            <span className="gradient-text">Deliver Faster.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-xl mb-8 leading-relaxed">
                            AVIS brings structure to chaos. Seamless task management, crystal clear workflows, and delightful collaboration — all in one beautiful platform.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/auth/login">
                                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Get Started Free
                                </Button>
                            </Link>
                            <Button variant="secondary" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                                Watch Demo
                            </Button>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-medium"
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <span className="font-semibold text-slate-900">500+</span>
                                <span className="text-slate-600"> teams already collaborating</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right content - 3D Dashboard preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <DashboardPreview3D />
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2"
                >
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}

// 3D Dashboard Preview Component
function DashboardPreview3D() {
    return (
        <div className="relative perspective-1000">
            {/* Main dashboard card */}
            <motion.div
                className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                animate={{ rotateY: [-2, 2, -2], rotateX: [1, -1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Header bar */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-danger-400" />
                        <div className="w-3 h-3 rounded-full bg-warning-400" />
                        <div className="w-3 h-3 rounded-full bg-success-400" />
                    </div>
                    <div className="flex-1 h-6 bg-slate-200/50 rounded-lg" />
                </div>

                {/* Dashboard content */}
                <div className="p-6 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Tasks Done", value: "24", color: "primary" },
                            { label: "In Progress", value: "8", color: "warning" },
                            { label: "Team Members", value: "12", color: "success" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="bg-slate-50 rounded-xl p-4"
                            >
                                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Task list preview */}
                    <div className="space-y-2">
                        {["Design review meeting", "Update documentation", "Code review"].map((task, i) => (
                            <motion.div
                                key={task}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-success-500' : i === 1 ? 'bg-warning-500' : 'bg-primary-500'}`} />
                                <span className="text-sm text-slate-700">{task}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-900">Task Complete!</div>
                        <div className="text-xs text-slate-500">Just now</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-lg p-4 text-white"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-medium">+23% productivity</span>
                </div>
            </motion.div>
        </div>
    );
}

// ============ PROBLEM/SOLUTION SECTION ============
function ProblemSection() {
    const problems = [
        { icon: <Clock className="w-6 h-6" />, title: "Endless back-and-forth", desc: "Tasks get lost in chat threads" },
        { icon: <FileText className="w-6 h-6" />, title: "No clarity on status", desc: "Who's doing what? Nobody knows" },
        { icon: <Users className="w-6 h-6" />, title: "Scattered updates", desc: "Files everywhere, versions unclear" },
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-slate-900 mb-4">
                        Sound familiar?
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-600">
                        Teams everywhere struggle with these everyday frustrations
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-3 gap-8 mb-16"
                >
                    {problems.map((problem, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="bg-white rounded-2xl p-8 shadow-card border border-slate-100"
                        >
                            <div className="w-14 h-14 bg-danger-50 rounded-xl flex items-center justify-center text-danger-600 mb-4">
                                {problem.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{problem.title}</h3>
                            <p className="text-slate-600">{problem.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Solution arrow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl text-white shadow-lg">
                        <Zap className="w-6 h-6" />
                        <span className="text-lg font-semibold">AVIS brings order to chaos</span>
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ============ FEATURES SECTION ============
function FeaturesSection() {
    const features = [
        {
            icon: <CheckCircle className="w-7 h-7" />,
            title: "Smart Task Management",
            desc: "Create, assign, and track tasks with priorities, deadlines, and real-time status updates.",
            color: "primary",
        },
        {
            icon: <Users className="w-7 h-7" />,
            title: "Team Collaboration",
            desc: "Comments, file sharing, and version history — all in one threaded conversation.",
            color: "secondary",
        },
        {
            icon: <Clock className="w-7 h-7" />,
            title: "Attendance Tracking",
            desc: "Clock in/out with automatic hour calculation and calendar overview.",
            color: "accent",
        },
        {
            icon: <Calendar className="w-7 h-7" />,
            title: "Leave Management",
            desc: "Request, approve, and track leaves with configurable balance logic.",
            color: "success",
        },
        {
            icon: <BarChart3 className="w-7 h-7" />,
            title: "Analytics Dashboard",
            desc: "Productivity trends, completion rates, and team performance insights.",
            color: "warning",
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: "Role-Based Access",
            desc: "Owner, Manager, Employee — each sees exactly what they need.",
            color: "danger",
        },
    ];

    const colorClasses: Record<string, { bg: string; text: string }> = {
        primary: { bg: "bg-primary-50", text: "text-primary-600" },
        secondary: { bg: "bg-secondary-50", text: "text-secondary-600" },
        accent: { bg: "bg-accent-50", text: "text-accent-600" },
        success: { bg: "bg-success-50", text: "text-success-600" },
        warning: { bg: "bg-warning-50", text: "text-warning-600" },
        danger: { bg: "bg-danger-50", text: "text-danger-600" },
    };

    return (
        <section className="py-24 bg-white">
            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-full text-secondary-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Powerful Features</span>
                    </motion.div>
                    <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-slate-900 mb-4">
                        Everything you need to win
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-600">
                        Built for teams who value clarity, speed, and beautiful design
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -8 }}
                            className="group relative bg-white rounded-2xl p-8 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow duration-300"
                        >
                            <div className={`w-14 h-14 ${colorClasses[feature.color].bg} rounded-xl flex items-center justify-center ${colorClasses[feature.color].text} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ============ ROLE PREVIEW SECTION ============
function RolePreviewSection() {
    const [activeRole, setActiveRole] = useState<"employee" | "manager" | "owner">("employee");

    const roles = {
        employee: {
            title: "Employee View",
            description: "Focus on your tasks, track your time, and stay organized.",
            features: ["Personal task list", "Clock in/out", "Leave requests", "Progress updates"],
            mockup: <EmployeeMockup />,
        },
        manager: {
            title: "Manager View",
            description: "Oversee your team, assign tasks, and approve requests.",
            features: ["Team overview", "Task assignment", "Approval workflows", "Team analytics"],
            mockup: <ManagerMockup />,
        },
        owner: {
            title: "Owner View",
            description: "Full visibility into every aspect of your organization.",
            features: ["Company analytics", "All employees", "Override controls", "Export reports"],
            mockup: <OwnerMockup />,
        },
    };

    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-slate-900 mb-4">
                        Designed for every role
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-600">
                        Each user sees exactly what they need — nothing more, nothing less
                    </motion.p>
                </motion.div>

                {/* Role switcher */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center gap-2 mb-12"
                >
                    {(["employee", "manager", "owner"] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role)}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeRole === role
                                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
                                }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </motion.div>

                {/* Role content */}
                <motion.div
                    key={activeRole}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid lg:grid-cols-2 gap-12 items-center"
                >
                    <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-slate-900">{roles[activeRole].title}</h3>
                        <p className="text-lg text-slate-600">{roles[activeRole].description}</p>
                        <ul className="space-y-3">
                            {roles[activeRole].features.map((feature, i) => (
                                <motion.li
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-success-600" />
                                    </div>
                                    <span className="text-slate-700">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <Link href={`/dashboard/${activeRole}`}>
                            <Button variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                Try {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Dashboard
                            </Button>
                        </Link>
                    </div>
                    <div className="relative">
                        {roles[activeRole].mockup}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// Mockup components for each role
function EmployeeMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
            <div className="bg-primary-600 text-white p-6">
                <p className="text-sm opacity-80">Good Morning</p>
                <h3 className="text-xl font-bold">Welcome back, Arun!</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-success-50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-success-700">4</p>
                        <p className="text-sm text-success-600">Tasks Today</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-primary-700">08:45</p>
                        <p className="text-sm text-primary-600">Hours Today</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {["Review landing page design", "Update API documentation"].map((task, i) => (
                        <div key={task} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-success-500 border-success-500' : 'border-slate-300'}`} />
                            <span className="text-sm text-slate-700">{task}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function ManagerMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
            <div className="bg-secondary-600 text-white p-6">
                <p className="text-sm opacity-80">Team Overview</p>
                <h3 className="text-xl font-bold">Design Team Dashboard</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-warning-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-warning-700">5</p>
                        <p className="text-xs text-warning-600">Pending</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-primary-700">12</p>
                        <p className="text-xs text-primary-600">In Progress</p>
                    </div>
                    <div className="bg-success-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-success-700">28</p>
                        <p className="text-xs text-success-600">Done</p>
                    </div>
                </div>
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-warning-800">2 Leave Requests Pending</p>
                    <p className="text-xs text-warning-600">Tap to review</p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm">+3</div>
                </div>
            </div>
        </motion.div>
    );
}

function OwnerMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
                <p className="text-sm opacity-80">Organization Analytics</p>
                <h3 className="text-xl font-bold">Company Overview</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-success-50 rounded-xl">
                    <div>
                        <p className="text-sm text-slate-600">Task Completion</p>
                        <p className="text-2xl font-bold text-success-700">87%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-lg font-bold text-slate-800">45</p>
                        <p className="text-xs text-slate-500">Employees</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-lg font-bold text-slate-800">8</p>
                        <p className="text-xs text-slate-500">Departments</p>
                    </div>
                </div>
                <div className="h-24 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center">
                    <div className="flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-4 bg-primary-400 rounded-t" />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ============ BENEFITS SECTION ============
function BenefitsSection() {
    const benefits = [
        { value: "40%", label: "Faster task completion" },
        { value: "90%", label: "Less status meetings" },
        { value: "3x", label: "Better visibility" },
        { value: "100%", label: "Team happiness" },
    ];

    return (
        <section className="py-24 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            <div className="section-container relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="text-center text-white mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4">
                        The results speak for themselves
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg opacity-90">
                        Teams using AVIS see immediate improvements
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {benefits.map((benefit, i) => (
                        <motion.div key={i} variants={scaleIn} className="text-center">
                            <div className="text-5xl md:text-6xl font-bold text-white mb-2">{benefit.value}</div>
                            <div className="text-white/80">{benefit.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ============ CTA SECTION ============
function CTASection() {
    return (
        <section className="py-24 bg-white">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden"
                >
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
                    <motion.div
                        className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
                        animate={{ scale: [1.2, 1, 1.2] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to transform how your team works?
                        </h2>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                            Join thousands of teams already using AVIS to deliver faster and collaborate effortlessly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/login">
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                Schedule Demo
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ============ FOOTER ============
function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-100 py-12">
            <div className="section-container">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold text-slate-900">AVIS</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-600">
                        <a href="#" className="hover:text-primary-600 transition-colors">Features</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Pricing</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">About</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm text-slate-500">© 2024 AVIS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// ============ MAIN PAGE ============
export default function LandingPage() {
    return (
        <main className="overflow-x-hidden">
            <HeroSection />
            <ProblemSection />
            <FeaturesSection />
            <RolePreviewSection />
            <BenefitsSection />
            <CTASection />
            <Footer />
        </main>
    );
}
