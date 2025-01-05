import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5',
        outline:
          'border border-input bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))] shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        softBlue:
          'bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-primary font-medium shadow-sm border border-blue-200/50 hover:shadow-md hover:from-blue-200 hover:via-blue-300 hover:to-blue-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-blue-900/70 dark:via-blue-800/70 dark:to-blue-900/70 dark:border-blue-700/20 dark:hover:from-blue-800/70 dark:hover:via-blue-700/70 dark:hover:to-blue-800/70', // 'bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-blue-900 shadow-sm hover:shadow-md hover:from-blue-200 hover:via-blue-300 hover:to-blue-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 dark:text-blue-100 dark:border-blue-700/50 dark:hover:from-blue-800 dark:hover:via-blue-700 dark:hover:to-blue-800',
        default:
          'relative bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-white shadow-lg hover:from-blue-700 hover:via-indigo-600 hover:to-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
