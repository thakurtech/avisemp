"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import React from "react";

type CardVariant = "default" | "glass" | "elevated" | "outline" | "gradient";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: React.ReactNode;
    variant?: CardVariant;
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
    className?: string;
}

const variants: Record<CardVariant, string> = {
    default: "bg-white border border-slate-100 shadow-card",
    glass: "bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass",
    elevated: "bg-white shadow-soft",
    outline: "bg-transparent border-2 border-slate-200",
    gradient: "bg-gradient-to-br from-primary-500 to-secondary-600 text-white",
};

const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export function Card({
    children,
    variant = "default",
    hover = true,
    padding = "md",
    className,
    ...props
}: CardProps) {
    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={clsx(
                "rounded-2xl transition-shadow duration-300",
                variants[variant],
                paddings[padding],
                hover && "hover:shadow-card-hover cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// 3D Card with perspective effect
interface Card3DProps extends CardProps {
    intensity?: number;
}

export function Card3D({
    children,
    intensity = 10,
    className,
    padding = "md",
    ...props
}: Card3DProps) {
    const [rotateX, setRotateX] = React.useState(0);
    const [rotateY, setRotateY] = React.useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateXValue = ((y - centerY) / centerY) * -intensity;
        const rotateYValue = ((x - centerX) / centerX) * intensity;
        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={clsx(
                "bg-white rounded-2xl shadow-soft border border-slate-100",
                paddings[padding],
                "transform-gpu",
                className
            )}
            style={{ transformStyle: "preserve-3d" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
