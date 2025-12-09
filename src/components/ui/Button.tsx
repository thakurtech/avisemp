"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary: `
    text-white font-semibold
    bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500
    shadow-lg shadow-primary-500/25
    hover:shadow-xl hover:shadow-primary-500/30
    active:shadow-lg
  `,
    secondary: `
    text-slate-700 bg-white border border-slate-200
    shadow-sm
    hover:bg-slate-50 hover:border-slate-300
  `,
    ghost: `
    text-slate-600
    hover:bg-slate-100 hover:text-slate-900
  `,
    outline: `
    text-primary-600 bg-transparent border-2 border-primary-500
    hover:bg-primary-50
  `,
    danger: `
    text-white bg-gradient-to-r from-danger-600 to-danger-500
    shadow-lg shadow-danger-500/25
    hover:shadow-xl hover:shadow-danger-500/30
  `,
};

const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
    md: "px-6 py-3 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-xl gap-2.5",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
                "inline-flex items-center justify-center font-medium transition-all duration-200",
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                (disabled || isLoading) && "opacity-60 cursor-not-allowed",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : leftIcon ? (
                <span className="flex-shrink-0">{leftIcon}</span>
            ) : null}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </motion.button>
    );
}
