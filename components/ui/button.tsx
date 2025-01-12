import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5',
        outline:
          'border border-input bg-gradient-soft shadow-sm hover:bg-gradient-custom hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        softBlue:
          'bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-primary font-medium shadow-sm border border-blue-200/50 hover:shadow-md hover:from-blue-200 hover:via-blue-300 hover:to-blue-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-blue-900/70 dark:via-blue-800/70 dark:to-blue-900/70 dark:border-blue-700/20 dark:hover:from-blue-800/70 dark:hover:via-blue-700/70 dark:hover:to-blue-800/70',
        softTeal: `
          bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 
          text-primary font-medium 
          shadow-sm border border-teal-300/50 
          hover:shadow-md hover:from-teal-400 hover:via-teal-500 hover:to-teal-400 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-teal-600 dark:via-teal-500 dark:to-teal-600
          dark:border-teal-600/80
          dark:hover:from-teal-500 dark:hover:via-teal-400 dark:hover:to-teal-500
        `,
        softTealSecondary: `
        bg-gradient-to-r from-teal-100/90 via-teal-200/90 to-teal-100/90 
        text-teal-700 font-medium 
        shadow-sm border border-teal-200/30 
        hover:shadow-md hover:from-teal-100 hover:via-teal-200 hover:to-teal-100 
        hover:-translate-y-0.5 active:translate-y-0
        dark:from-teal-900/40 dark:via-teal-800/40 dark:to-teal-900/40 
        dark:text-teal-300 dark:border-teal-700/20 
        dark:hover:from-teal-800/40 dark:hover:via-teal-700/40 dark:hover:to-teal-800/40
      `,
        warmYellow: `
          bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 
          text-amber-900 font-medium 
          shadow-sm border border-amber-200/50 
          hover:shadow-md hover:from-amber-200 hover:via-yellow-300 hover:to-amber-200 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-amber-800/70 dark:via-amber-700/70 dark:to-amber-800/70 
          dark:text-amber-100 dark:border-amber-700/30 
          dark:hover:from-amber-700/70 dark:hover:via-amber-600/70 dark:hover:to-amber-700/70
        `,
        oceanBlue: `
          bg-gradient-to-r from-cyan-100 via-blue-200 to-cyan-100 
          text-blue-900 font-medium 
          shadow-sm border border-blue-200/50 
          hover:shadow-md hover:from-cyan-200 hover:via-blue-300 hover:to-cyan-200 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-cyan-900/70 dark:via-blue-800/70 dark:to-cyan-900/70 
          dark:text-blue-100 dark:border-blue-700/30 
          dark:hover:from-cyan-800/70 dark:hover:via-blue-700/70 dark:hover:to-cyan-800/70
        `,
        slate: `
          bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 
          text-slate-700 font-medium 
          shadow-sm border border-slate-200/50 
          hover:shadow-md hover:from-slate-200 hover:via-slate-300 hover:to-slate-200 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80 
          dark:text-slate-200 dark:border-slate-600/30 
          dark:hover:from-slate-700/80 dark:hover:via-slate-600/80 dark:hover:to-slate-700/80
        `,
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
