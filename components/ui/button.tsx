import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5',
        outline:
          'border border-input border-teal-400 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0',
        whiteGray:
          'bg-zinc-100 text-secondary-foreground shadow-sm hover:bg-zinc-100/90 dark:bg-zinc-700 dark:hover:bg-zinc-700/90 hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        softBlue:
          'bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-primary font-md shadow-sm border border-purple-200/50 hover:shadow-md hover:from-purple-200 hover:via-purple-300 hover:to-purple-200 hover:-translate-y-0.5 active:translate-y-0 dark:from-purple-900/70 dark:via-purple-800/70 dark:to-purple-900/70 dark:border-purple-700/20 dark:hover:from-purple-800/70 dark:hover:via-purple-700/70 dark:hover:to-purple-800/70',
        softTeal: `
          bg-gradient-to-r from-teal-300 via-teal-200 to-teal-300 
          text-primary font-md 
          shadow-md
          hover:shadow-lg hover:from-teal-400 hover:via-teal-300 hover:to-teal-400 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-teal-600 dark:via-teal-700 dark:to-teal-600
          dark:border-teal-600/80
          dark:hover:from-teal-500 dark:hover:via-teal-600 dark:hover:to-teal-500
        `,
        softTealSecondary: `
        bg-teal-100
        text-teal-700 font-md 
        shadow-sm border border-teal-200/30 
        hover:shadow-md hover:bg-teal-100/90
        hover:-translate-y-0.5 active:translate-y-0
        dark:bg-teal-300
        dark:text-teal-900 dark:border-teal-700/20 
        dark:hover:bg-teal-300/90
      `,
        warmYellow: `
          bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 
          text-amber-900 font-md 
          shadow-sm border border-amber-200/50 
          hover:shadow-md hover:from-amber-200 hover:via-yellow-300 hover:to-amber-200 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-amber-800/70 dark:via-amber-700/70 dark:to-amber-800/70 
          dark:text-amber-100 dark:border-amber-700/30 
          dark:hover:from-amber-700/70 dark:hover:via-amber-600/70 dark:hover:to-amber-700/70
        `,
        oceanBlue: `
          bg-gradient-to-r from-cyan-100 via-cyan-200 to-cyan-100 
          text-blue-900 font-md 
          shadow-sm border border-purple-200/50 
          hover:shadow-md hover:from-cyan-200 hover:via-cyan-300 hover:to-cyan-200 
          hover:-translate-y-0.5 active:translate-y-0
          dark:from-cyan-900/70 dark:via-cyan-800/70 dark:to-cyan-900/70 
          dark:text-cyan-100 dark:border-cyan-700/30 
          dark:hover:from-cyan-800/70 dark:hover:via-cyan-700/70 dark:hover:to-cyan-800/70
        `,
        slate: `
          bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 
          text-slate-700 font-md 
          shadow-sm border border-slate-200/50 
          hover:shadow-md hover:from-slate-200 hover:via-slate-300 hover:to-slate-200 
          dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80 
          dark:text-slate-200 dark:border-slate-600/30 
          dark:hover:from-slate-700/80 dark:hover:via-slate-600/80 dark:hover:to-slate-700/80
        `,
        animated: `
          group
          relative
          overflow-hidden
          rounded-full
          bg-background
          items-center
          shadow-[inset_0_-8px_10px_#8fdfff1f]
          backdrop-blur-sm 
          transition-shadow 
          duration-500 
          ease-out 
          [--bg-size:300%]
          hover:shadow-[inset_0_-5px_10px_#8fdfff3f]
          before:absolute
          before:inset-0
          before:block
          before:h-full
          before:w-full
          before:animate-gradient
          before:bg-gradient-to-r
          before:from-purple-500
          before:via-teal-400
          before:via-amber-300
          before:to-purple-500
          before:bg-[length:var(--bg-size)_100%]
          before:p-[1px]
          before:![mask-composite:subtract]
          before:[border-radius:inherit]
          before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
        `,
        default:
          'relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 text-white shadow-md hover:from-purple-700 hover:via-purple-600 hover:to-purple-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12  px-8 py-4 text-lg',
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
