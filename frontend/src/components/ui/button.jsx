import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

// Button component from shadcn/ui
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

// Custom Component for Hero section
export const Component = ({
  icon,
  title,
  subtitle,
  size = "md",
  className = "",
  gradientDark,   // intentionally consumed here, not passed to DOM
  gradient,       // same
  ...props
}) => {
  const sizes = {
    sm: "p-3 rounded-xl",
    md: "p-4 rounded-2xl",
    lg: "p-6 rounded-3xl",
  };

  return (
    <button
      {...props}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out 
                  shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:scale-95
                  border-0 flex items-center justify-between gap-6
                  ${sizes[size]} 
                  ${className}`}>

      {/* Subtle internal glow/shine for depth, but keeping base color solid */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

      {/* Content - flat structure for perfect alignment */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Icon */}
        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}

        {/* Text */}
        <div className="text-left">
          <div className="font-semibold text-white">
            {title}
          </div>
          {subtitle && (
            <div className="text-sm text-white/80 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export { Button, buttonVariants }