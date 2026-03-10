"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const StackingNavbar = () => {
    const [expanded, setExpanded] = useState(false);

    const items = [
        { href: "/", label: "Home" },
        { href: "/detect", label: "Scanner" },
        { href: "/history", label: "History" },
    ];

    return (
        <div
            className={cn(
                "flex items-center gap-x-1 p-1.5 rounded-full transition-all duration-300",
                expanded ? "bg-white/[0.06] border border-white/[0.1] backdrop-blur-md shadow-lg shadow-black/20" : ""
            )}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {items.map((item, index) => (
                <StackingNavbarItem
                    key={index}
                    href={item.href}
                    expanded={expanded}
                    index={index}
                >
                    {item.label}
                </StackingNavbarItem>
            ))}
        </div>
    );
};

const StackingNavbarItem = ({
    href,
    children,
    expanded,
    index,
}: {
    href: string;
    children: React.ReactNode;
    expanded: boolean;
    index: number;
}) => {
    return (
        <motion.div
            initial={{ x: -12 * index }}
            animate={{ x: expanded ? 0 : -12 * index }}
            transition={{
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
                type: "spring",
                stiffness: 400,
                damping: 25
            }}
            style={{ zIndex: 100 - index }}
        >
            <NavLink
                to={href}
                className={({ isActive }) => cn(
                    "flex items-center text-xs font-medium px-5 py-2.5 rounded-full no-underline transition-all duration-300 shadow-sm border",
                    isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500/30 z-50 shadow-md shadow-indigo-500/20"
                        : "bg-white/[0.06] text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15]"
                )}
            >
                {children}
            </NavLink>
        </motion.div>
    );
};

export { StackingNavbar };
