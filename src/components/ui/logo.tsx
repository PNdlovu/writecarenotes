import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "white" | "gradient" | "symbol"
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
}

const logoSizes = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
}

const logoVariants = {
  default: "bg-white",
  white: "bg-brand-blue",
  gradient: "bg-gradient-to-r from-brand-green to-brand-blue",
  symbol: "",
}

const logoOrientations = {
  horizontal: "flex-row",
  vertical: "flex-col",
}

export function Logo({
  variant = "default",
  orientation = "horizontal",
  size = "md",
  className,
  ...props
}: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        logoOrientations[orientation],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative rounded-lg p-2",
          logoVariants[variant],
          logoSizes[size]
        )}
      >
        {/* Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
        >
          <path
            d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM13 16H7V14H13V16Z"
            fill={variant === "white" ? "white" : "#017CFC"}
          />
        </svg>
      </div>
      {variant !== "symbol" && (
        <span
          className={cn(
            "font-sans font-bold",
            {
              "text-lg": size === "sm",
              "text-xl": size === "md",
              "text-2xl": size === "lg",
            },
            variant === "white" && "text-white"
          )}
        >
          Write Care Notes
        </span>
      )}
    </div>
  )
} 


