import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDate(epoch: number): string {
  const timestamp = epoch.toString().length === 13 ? epoch : epoch * 1000

  try {
    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function calculateDuration(
  startDate: number,
  endDate: number | null
): string {
  const end = endDate || Date.now()

  const diffInMs = end - startDate

  const diffInMinutes = Math.round(diffInMs / (1000 * 60))

  // If less than 1 minute, show "Less than 1m"
  if (diffInMinutes < 1) {
    return 'Less than 1m'
  }

  // If less than 1 hour, return minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  }

  // If 1 hour or more, calculate hours and remaining minutes
  const hours = Math.floor(diffInMinutes / 60)
  const minutes = diffInMinutes % 60

  // If no remaining minutes, just return hours
  if (minutes === 0) {
    return `${hours}h`
  }

  // Return both hours and minutes
  return `${hours}h ${minutes}m`
}

export const formatCode = (code: string) => {
  return code
    .replace(/\\n/g, '\n') 
    .replace(/"{2,}/g, '"') 
}