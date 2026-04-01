import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50",
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 px-4 py-2",
          variant === "outline" && "border border-gray-300 hover:bg-gray-50 px-4 py-2",
          variant === "ghost" && "hover:bg-gray-100 px-4 py-2",
          size === "sm" && "px-3 py-1 text-xs",
          size === "lg" && "px-6 py-3 text-base",
          size === "icon" && "h-9 w-9 p-0",
          size === "icon-sm" && "h-7 w-7 p-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
