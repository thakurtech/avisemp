"use client";

import { clsx } from "clsx";
import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
}

const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-primary-100 text-primary-700",
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    danger: "bg-danger-100 text-danger-700",
    info: "bg-accent-100 text-accent-700",
};

const sizes: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
};

export function Badge({
    children,
    variant = "default",
    size = "md",
    dot = false,
    className,
}: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center font-medium rounded-full",
                variants[variant],
                sizes[size],
                className
            )}
        >
            {dot && (
                <span
                    className={clsx(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        variant === "success" && "bg-success-500",
                        variant === "warning" && "bg-warning-500",
                        variant === "danger" && "bg-danger-500",
                        variant === "primary" && "bg-primary-500",
                        variant === "info" && "bg-accent-500",
                        variant === "default" && "bg-slate-500"
                    )}
                />
            )}
            {children}
        </span>
    );
}

// Status Badge with pulse animation for active states
interface StatusBadgeProps {
    status: "pending" | "in-progress" | "completed" | "delayed" | "under-review";
}

const statusConfig = {
    pending: { label: "Pending", variant: "default" as const },
    "in-progress": { label: "In Progress", variant: "primary" as const },
    completed: { label: "Completed", variant: "success" as const },
    delayed: { label: "Delayed", variant: "danger" as const },
    "under-review": { label: "Under Review", variant: "warning" as const },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <Badge variant={config.variant} dot>
            {config.label}
        </Badge>
    );
}

// Priority Badge
interface PriorityBadgeProps {
    priority: "low" | "medium" | "high";
}

const priorityConfig = {
    low: { label: "Low", variant: "default" as const },
    medium: { label: "Medium", variant: "warning" as const },
    high: { label: "High", variant: "danger" as const },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const config = priorityConfig[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
