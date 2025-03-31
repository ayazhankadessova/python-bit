'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  showText?: boolean
  textSize?: string
  primaryColor?: string
  secondaryColor?: string
  className?: string
  textClassName?: string
  counterClockwise?: boolean
}

export const CircularProgress = ({
  percentage,
  size = 160,
  strokeWidth = 8,
  showText = true,
  textSize = 'text-lg',
  primaryColor = 'stroke-teal-500',
  secondaryColor = 'stroke-gray-200 dark:stroke-gray-700',
  className = '',
  textClassName = '',
  counterClockwise = false,
}: CircularProgressProps) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  const radius = (size - strokeWidth) / 2
  const center = size / 2

  const circumference = 2 * Math.PI * radius

  const strokeDashOffset =
    circumference - (clampedPercentage / 100) * circumference

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className='transform rotate-[-90deg]'
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill='none'
          strokeWidth={strokeWidth}
          className={secondaryColor}
        />

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill='none'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashOffset}
          strokeLinecap='round'
          className={cn(
            primaryColor,
            counterClockwise ? 'transform -scale-y-100' : ''
          )}
          style={{
            transformOrigin: counterClockwise
              ? `${center}px ${center}px`
              : undefined,
          }}
        />
      </svg>

      {showText && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className={cn('font-semibold', textSize, textClassName)}>
            {clampedPercentage}%
          </span>
        </div>
      )}
    </div>
  )
}
