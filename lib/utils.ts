import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDate(epoch: number): string {
  // Check if the epoch is in milliseconds (13 digits) or seconds (10 digits)
  const timestamp = epoch.toString().length === 13 ? epoch : epoch * 1000

  try {
    const date = new Date(timestamp)

    // Validate if the date is valid
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