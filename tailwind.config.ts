/**
 * @fileoverview Tailwind CSS configuration for WriteNotes Enterprise Platform
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import type { Config } from 'tailwindcss'
import { colors } from './src/styles/colors'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Frutiger', 'sans-serif'],
      },
      fontSize: {
        base: '16px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "#f0f9ff",
          secondary: "#f0fdf9"
        },
        foreground: {
          DEFAULT: "rgb(51, 65, 85)",
          muted: "rgb(100, 116, 139)"
        },
        primary: {
          DEFAULT: "#7FD02B",
          hover: "#72BB27",
          light: "#E8F5D6"
        },
        secondary: {
          DEFAULT: "#2B95D0",
          hover: "#2785BB",
          light: "#D6EBF5"
        },
        success: {
          DEFAULT: "rgb(34, 197, 94)",
          light: "rgb(220, 252, 231)"
        },
        warning: {
          DEFAULT: "rgb(234, 179, 8)",
          light: "rgb(254, 249, 195)"
        },
        error: {
          DEFAULT: "rgb(239, 68, 68)",
          light: "rgb(254, 226, 226)"
        },
        info: {
          DEFAULT: "rgb(59, 130, 246)",
          light: "rgb(219, 234, 254)"
        }
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(to bottom, #f0f9ff, #f0fdf9)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}

export default config
