"use client"

import { cn } from '@/lib/utils'
import { motion, useScroll, useSpring } from 'framer-motion'

interface ScrollProgressProps {
  className?: string
}

export default function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className={cn(
        'fixed inset-x-0 h-[3px] origin-left bg-gradient-to-r from-[#A68FE0] to-[#E08FA0]',
        className
      )}
      style={{
        scaleX,
      }}
    />
  )
}
