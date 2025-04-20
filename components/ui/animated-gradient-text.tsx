import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export default function AnimatedGradientText({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        `inline animate-gradient bg-gradient-to-r from-[#E08FA0] via-[#A68FE0] to-[#E08FA0] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent font-medium`
      )}
    >
      {children}
    </span>
  );
}