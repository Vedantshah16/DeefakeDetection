/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                dark: {
                    50: '#fafafa',
                    100: '#f4f4f5',
                    200: '#e4e4e7',
                    300: '#d4d4d8',
                    400: '#a1a1aa',
                    500: '#71717a',
                    600: '#52525b',
                    700: '#27272a',
                    800: '#1c1c20',
                    900: '#141416',
                    950: '#0a0a0b',
                },
                mint: '#34d399',
                coral: '#f87171',
                amber: '#fbbf24',
                'cyber-cyan': '#06b6d4',
                'cyber-purple': '#a855f7',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'pulse-slow': 'pulse 3s infinite',
                'gradient-xy': 'gradient-xy 15s ease infinite',
                'scan': 'scanLine 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s ease-in-out infinite',
                'ring-fill': 'ringFill 1.5s ease-out forwards',
                'count-up': 'countUp 0.8s ease-out forwards',
                'border-pulse': 'borderPulse 2s ease-in-out infinite',
                'pop': 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'gradient-xy': {
                    '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                scanLine: {
                    '0%': { top: '0%' },
                    '50%': { top: '100%' },
                    '100%': { top: '0%' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                ringFill: {
                    '0%': { strokeDashoffset: '283' },
                    '100%': { strokeDashoffset: 'var(--ring-target)' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                borderPulse: {
                    '0%, 100%': { borderColor: 'rgba(139, 92, 246, 0.15)' },
                    '50%': { borderColor: 'rgba(139, 92, 246, 0.4)' },
                },
                pop: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { 'box-shadow': '0 0 20px rgba(99,102,241,0.15)' },
                    '50%': { 'box-shadow': '0 0 40px rgba(99,102,241,0.3), 0 0 60px rgba(6,182,212,0.1)' },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
